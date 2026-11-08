'use client'

// Coreloom UI — useAudioRecorder. The microphone side of AudioRecorder and DictationButton: asks
// for the microphone, records with MediaRecorder, measures the level for a live waveform and
// hands back the recording. Nothing leaves the browser: what to do with the audio (upload it,
// transcribe it) is the app's call. The pure helpers below are exported for tests.
import * as React from 'react'

/** A finished recording. `levels` (0–1, about 20 a second, at most 120) draw its waveform. */
interface AudioRecording {
  blob: Blob
  mimeType: string
  /** Seconds. MediaRecorder files often carry no duration, so it travels with the blob. */
  duration: number
  levels: number[]
}

type AudioRecorderError = 'denied' | 'unsupported' | 'failed'

type AudioRecorderState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'recording'; paused: boolean; elapsed: number; levels: number[] }
  | { status: 'error'; error: AudioRecorderError }

/** Levels per second kept while recording. */
const LEVEL_RATE = 20
/** Levels drawn live (the last few seconds). */
const LIVE_LEVELS = 64
/** Levels kept in a finished recording. */
const RECORDING_LEVELS = 120

/** A root-mean-square amplitude (0–1) on a −60 dB…0 dB scale, so speech fills the bars. */
function levelFromRms(rms: number) {
  if (!Number.isFinite(rms) || rms <= 0) return 0
  const db = 20 * Math.log10(rms)
  return Math.min(1, Math.max(0, (db + 60) / 60))
}

/** The root mean square of a block of samples (−1…1). */
function rmsOf(samples: Float32Array | readonly number[]) {
  if (samples.length === 0) return 0
  let sum = 0
  for (const sample of samples) sum += sample * sample
  return Math.sqrt(sum / samples.length)
}

/** Fits `levels` into `count` bars, keeping each bucket's loudest value (peaks stay visible). */
function resampleLevels(levels: readonly number[], count: number) {
  if (count <= 0) return []
  if (levels.length <= count) return [...levels]
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const from = Math.floor((i * levels.length) / count)
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / count))
    out.push(Math.max(...levels.slice(from, to)))
  }
  return out
}

/** The first container the browser can record, or "" to let MediaRecorder choose. */
function pickMimeType(isSupported: (type: string) => boolean) {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
  return types.find((type) => isSupported(type)) ?? ''
}

/** What went wrong, from getUserMedia's or MediaRecorder's error. */
function recorderErrorOf(error: unknown): AudioRecorderError {
  const name = error instanceof Error || error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'NotSupportedError') return 'unsupported'
  return 'failed'
}

/** "m:ss", or "h:mm:ss" from an hour. Negative and unknown durations read 0:00. */
function formatClock(seconds: number) {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`
}

/** Everything one recording holds on to, released by `release`. */
interface Session {
  stream: MediaStream
  context: AudioContext
  analyser: AnalyserNode
  recorder: MediaRecorder
  chunks: Blob[]
  levels: number[]
  /** Seconds recorded before the current stretch (pauses split the recording into stretches). */
  before: number
  /** AudioContext time when the current stretch started; null while paused. */
  since: number | null
  /** AudioContext time of the last level kept. */
  lastLevel: number
  frame: number
}

function elapsedOf(session: Session) {
  return session.before + (session.since === null ? 0 : session.context.currentTime - session.since)
}

function release(session: Session) {
  cancelAnimationFrame(session.frame)
  for (const track of session.stream.getTracks()) track.stop()
  void session.context.close().catch(() => undefined)
}

/** The microphone's stream, or why there is none. */
async function openMicrophone(
  constraints?: MediaTrackConstraints,
): Promise<MediaStream | AudioRecorderError> {
  if (typeof MediaRecorder === 'undefined' || !('mediaDevices' in navigator)) return 'unsupported'
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: constraints ?? true })
  } catch (error) {
    return recorderErrorOf(error)
  }
}

function useAudioRecorder({
  onComplete,
  maxDuration,
  constraints,
}: {
  /** Called with the recording when `stop` (or the time limit) ends it. */
  onComplete: (recording: AudioRecording) => void
  /** Seconds; recording stops by itself there. */
  maxDuration?: number
  /** Passed to getUserMedia as `audio` (a device id, echo cancellation…). Default: `true`. */
  constraints?: MediaTrackConstraints
}) {
  const [state, setState] = React.useState<AudioRecorderState>({ status: 'idle' })
  const session = React.useRef<Session | null>(null)
  // The latest callback, read when a recording ends (MediaRecorder calls back outside React).
  const completeRef = React.useRef(onComplete)
  React.useLayoutEffect(() => {
    completeRef.current = onComplete
  })

  React.useEffect(
    () => () => {
      const s = session.current
      if (!s) return
      session.current = null
      s.recorder.onstop = null
      if (s.recorder.state !== 'inactive') s.recorder.stop()
      release(s)
    },
    [],
  )

  const stop = () => {
    const s = session.current
    if (s?.recorder.state === 'recording' || s?.recorder.state === 'paused') s.recorder.stop()
  }

  const finish = (s: Session) => {
    if (session.current !== s) return
    session.current = null
    release(s)
    const mimeType = s.recorder.mimeType || s.chunks[0]?.type || 'audio/webm'
    setState({ status: 'idle' })
    completeRef.current({
      blob: new Blob(s.chunks, { type: mimeType }),
      mimeType,
      duration: elapsedOf(s),
      levels: resampleLevels(s.levels, RECORDING_LEVELS),
    })
  }

  /** One animation frame: keeps a level every 1/20 s, updates the timer, enforces the limit. */
  const measure = (s: Session) => {
    if (session.current !== s) return
    const now = s.context.currentTime
    if (s.since !== null && now - s.lastLevel >= 1 / LEVEL_RATE) {
      const samples = new Float32Array(s.analyser.fftSize)
      s.analyser.getFloatTimeDomainData(samples)
      s.levels.push(levelFromRms(rmsOf(samples)))
      s.lastLevel = now
      const elapsed = elapsedOf(s)
      setState({
        status: 'recording',
        paused: false,
        elapsed,
        levels: s.levels.slice(-LIVE_LEVELS),
      })
      if (maxDuration !== undefined && elapsed >= maxDuration) {
        stop()
        return
      }
    }
    s.frame = requestAnimationFrame(() => {
      measure(s)
    })
  }

  const start = async () => {
    if (session.current || state.status === 'requesting') return
    setState({ status: 'requesting' })
    const stream = await openMicrophone(constraints)
    if (typeof stream === 'string') {
      setState({ status: 'error', error: stream })
      return
    }
    try {
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      context.createMediaStreamSource(stream).connect(analyser)
      const mimeType = pickMimeType((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const s: Session = {
        stream,
        context,
        analyser,
        recorder,
        chunks: [],
        levels: [],
        before: 0,
        since: context.currentTime,
        lastLevel: context.currentTime,
        frame: 0,
      }
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) s.chunks.push(event.data)
      }
      recorder.onstop = () => {
        finish(s)
      }
      session.current = s
      recorder.start(250)
      setState({ status: 'recording', paused: false, elapsed: 0, levels: [] })
      measure(s)
    } catch (error) {
      for (const track of stream.getTracks()) track.stop()
      setState({ status: 'error', error: recorderErrorOf(error) })
    }
  }

  const pause = () => {
    const s = session.current
    if (s?.recorder.state !== 'recording' || s.since === null) return
    s.recorder.pause()
    s.before = elapsedOf(s)
    s.since = null
    setState({
      status: 'recording',
      paused: true,
      elapsed: s.before,
      levels: s.levels.slice(-LIVE_LEVELS),
    })
  }

  const resume = () => {
    const s = session.current
    if (s?.recorder.state !== 'paused') return
    s.recorder.resume()
    s.since = s.context.currentTime
    setState({
      status: 'recording',
      paused: false,
      elapsed: s.before,
      levels: s.levels.slice(-LIVE_LEVELS),
    })
  }

  /** Stops without a recording: the audio is dropped and `onComplete` isn't called. */
  const cancel = () => {
    const s = session.current
    if (!s) return
    session.current = null
    s.recorder.onstop = null
    if (s.recorder.state !== 'inactive') s.recorder.stop()
    release(s)
    setState({ status: 'idle' })
  }

  /** Back to idle after an error. */
  const reset = () => {
    setState((current) => (current.status === 'error' ? { status: 'idle' } : current))
  }

  return { state, start, stop, pause, resume, cancel, reset }
}

export {
  type AudioRecorderError,
  type AudioRecorderState,
  type AudioRecording,
  formatClock,
  levelFromRms,
  pickMimeType,
  recorderErrorOf,
  resampleLevels,
  rmsOf,
  useAudioRecorder,
}
