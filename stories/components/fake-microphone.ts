// A stand-in microphone for the stories and their tests: getUserMedia returns a synthetic voice
// (a tone that rises and falls like speech), so the recorder works without a real microphone or a
// permission prompt. The device id "blocked-microphone" is refused, as when a person says no.
// An app needs none of this: the browser's own microphone is used.
import type { AudioRecording } from '@/components/ui/audio-recorder'

const BLOCKED = 'blocked-microphone'

function deviceIdOf(constraints?: MediaStreamConstraints) {
  const audio = constraints?.audio
  if (!audio || audio === true) return undefined
  return typeof audio.deviceId === 'string' ? audio.deviceId : undefined
}

function syntheticVoice() {
  const context = new AudioContext()
  const voice = context.createOscillator()
  voice.frequency.value = 196
  const syllables = context.createOscillator()
  syllables.frequency.value = 3
  const depth = context.createGain()
  depth.gain.value = 0.35
  const level = context.createGain()
  level.gain.value = 0.4
  syllables.connect(depth).connect(level.gain)
  const out = context.createMediaStreamDestination()
  voice.connect(level).connect(out)
  voice.start()
  syllables.start()
  // Closing the stream's tracks (the recorder does it when it stops) closes the voice too.
  for (const track of out.stream.getTracks())
    track.addEventListener('ended', () => void context.close())
  return out.stream
}

/** Installs the stand-in once per page. */
export function installFakeMicrophone() {
  if (typeof navigator === 'undefined' || !('mediaDevices' in navigator)) return
  const devices = navigator.mediaDevices as MediaDevices & { coreloomFake?: true }
  if (devices.coreloomFake) return
  devices.coreloomFake = true
  devices.getUserMedia = (constraints) => {
    if (deviceIdOf(constraints) === BLOCKED)
      return Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
    return Promise.resolve(syntheticVoice())
  }
}

/** A 3.5-second recording made here, the same every time: a WAV tone with a fixed waveform. */
export function sampleRecording(): AudioRecording {
  const rate = 8000
  const seconds = 3.5
  const count = Math.round(rate * seconds)
  const data = new DataView(new ArrayBuffer(44 + count * 2))
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) data.setUint8(offset + i, value.charCodeAt(i))
  }
  text(0, 'RIFF')
  data.setUint32(4, 36 + count * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  data.setUint32(16, 16, true)
  data.setUint16(20, 1, true)
  data.setUint16(22, 1, true)
  data.setUint32(24, rate, true)
  data.setUint32(28, rate * 2, true)
  data.setUint16(32, 2, true)
  data.setUint16(34, 16, true)
  text(36, 'data')
  data.setUint32(40, count * 2, true)
  const envelope = (t: number) => 0.5 + 0.5 * Math.sin(2 * Math.PI * 2.2 * t)
  for (let i = 0; i < count; i++) {
    const t = i / rate
    const sample = 0.3 * envelope(t) * Math.sin(2 * Math.PI * 196 * t)
    data.setInt16(44 + i * 2, Math.round(sample * 32767), true)
  }
  const levels = Array.from({ length: 70 }, (_, i) => 0.25 + 0.6 * envelope(i / 20))
  return {
    blob: new Blob([data.buffer], { type: 'audio/wav' }),
    mimeType: 'audio/wav',
    duration: seconds,
    levels,
  }
}
