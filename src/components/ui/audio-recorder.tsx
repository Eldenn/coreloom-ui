'use client'

// Coreloom UI — AudioRecorder. Records a voice note from the microphone: a live waveform and a
// timer while it records, pause and stop, then the recording to play back or delete. The
// recording (a Blob) goes to the app through `onValueChange`; nothing is uploaded here.
// DictationButton is the compact form for a composer: it records, hands the audio to the app's
// `onTranscribe`, and gives the text back, e.g. into PromptInput's field.
//
//   <AudioRecorder maxDuration={120} onValueChange={(recording) => setNote(recording)} />
//   <PromptInput value={text} onValueChange={setText} onSubmit={send}
//     toolbar={<DictationButton onTranscribe={transcribe} onText={(t) => setText(appendText(text, t))} />} />
import {
  CheckIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  type AudioRecorderError,
  type AudioRecording,
  formatClock,
  resampleLevels,
  useAudioRecorder,
} from '@/components/ui/use-audio-recorder'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type RecorderMessages = Messages['audioRecorder']

/** Bars for levels (0–1). `progress` (0–1) colours the played part. Decorative: no text. */
function AudioWaveform({
  levels,
  bars = 48,
  progress,
  className,
}: {
  levels: readonly number[]
  /** How many bars to draw; shorter level lists are padded with silence on the left. */
  bars?: number
  progress?: number
  className?: string
}) {
  const fitted = resampleLevels(levels, bars)
  const padded = [...Array.from({ length: bars - fitted.length }, () => 0), ...fitted]
  const played = progress === undefined ? bars : Math.round(progress * bars)
  return (
    <div
      aria-hidden
      data-slot="audio-waveform"
      className={cn('flex h-8 min-w-0 items-center gap-[2px]', className)}
    >
      {padded.map((level, i) => (
        <span
          // eslint-disable-next-line @eslint-react/no-array-index-key -- bars are positions, not items: the index is the identity.
          key={i}
          style={{ height: `${Math.max(8, Math.round(level * 100))}%` }}
          className={cn(
            'min-w-[2px] flex-1 rounded-pill transition-[height] duration-fast',
            i < played ? 'bg-primary' : 'bg-border-strong',
          )}
        />
      ))}
    </div>
  )
}

/** Adds dictated text after what is already written, with one space between. */
function appendText(current: string, addition: string) {
  const added = addition.trim()
  if (!added) return current
  if (!current.trim()) return added
  return /\s$/.test(current) ? `${current}${added}` : `${current} ${added}`
}

function errorText(t: RecorderMessages, error: AudioRecorderError) {
  switch (error) {
    case 'denied':
      return t.denied
    case 'unsupported':
      return t.unsupported
    case 'failed':
      return t.failed
  }
}

/** Plays a finished recording against its waveform. */
function RecordingPlayback({
  recording,
  onDelete,
  disabled,
  playRef,
}: {
  recording: AudioRecording
  onDelete: () => void
  disabled?: boolean
  playRef: React.Ref<HTMLButtonElement>
}) {
  const t = useCoreloomI18n().messages.audioRecorder
  const audio = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)

  // The object URL lives as long as this blob is shown, and is set on the element directly so
  // React never holds a URL that was already revoked.
  React.useEffect(() => {
    const element = audio.current
    if (!element) return
    const url = URL.createObjectURL(recording.blob)
    element.src = url
    return () => {
      element.pause()
      element.removeAttribute('src')
      URL.revokeObjectURL(url)
    }
  }, [recording.blob])

  const progress = recording.duration > 0 ? Math.min(1, time / recording.duration) : 0
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the person's own voice note, just recorded: there is no caption file to give. */}
      <audio
        ref={audio}
        preload="metadata"
        onPlay={() => {
          setPlaying(true)
        }}
        onPause={() => {
          setPlaying(false)
        }}
        onEnded={() => {
          setPlaying(false)
          setTime(0)
        }}
        onTimeUpdate={(e) => {
          setTime(e.currentTarget.currentTime)
        }}
      />
      <Button
        ref={playRef}
        type="button"
        size="icon"
        variant="secondary"
        className="shrink-0 rounded-full"
        aria-label={playing ? t.pausePlayback : t.play}
        disabled={disabled}
        onClick={() => {
          const element = audio.current
          if (!element) return
          if (element.paused) void element.play().catch(() => undefined)
          else element.pause()
        }}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <AudioWaveform levels={recording.levels} progress={progress} className="flex-1" />
      <span className="shrink-0 font-mono text-[12.5px] text-muted-foreground tabular-nums">
        <span className="sr-only">{t.duration} </span>
        {playing || time > 0 ? `${formatClock(time)} / ` : ''}
        {formatClock(recording.duration)}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={t.delete}
            disabled={disabled}
            onClick={onDelete}
          >
            <Trash2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.delete}</TooltipContent>
      </Tooltip>
    </div>
  )
}

/** The live part: dot, waveform, timer, pause / resume, stop, discard. */
function LiveRecording({
  paused,
  elapsed,
  levels,
  maxDuration,
  onPause,
  onResume,
  onStop,
  onCancel,
  stopRef,
}: {
  paused: boolean
  elapsed: number
  levels: number[]
  maxDuration?: number
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onCancel: () => void
  stopRef: React.Ref<HTMLButtonElement>
}) {
  const t = useCoreloomI18n().messages.audioRecorder
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
      <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-foreground">
        <span
          aria-hidden
          className={cn(
            'size-2.5 rounded-full',
            paused ? 'bg-border-strong' : 'animate-pulse bg-destructive motion-reduce:animate-none',
          )}
        />
        {paused ? t.paused : t.recording}
      </span>
      <AudioWaveform
        levels={levels}
        className="order-last basis-full sm:order-none sm:flex-1 sm:basis-0"
      />
      <span className="ml-auto shrink-0 font-mono text-[12.5px] text-muted-foreground tabular-nums sm:ml-0">
        {formatClock(elapsed)}
        {maxDuration !== undefined && ` / ${formatClock(maxDuration)}`}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={paused ? t.resume : t.pause}
          onClick={paused ? onResume : onPause}
        >
          {paused ? <MicIcon /> : <PauseIcon />}
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={t.discard}
          onClick={onCancel}
        >
          <XIcon />
        </Button>
        <Button ref={stopRef} type="button" size="sm" onClick={onStop}>
          <SquareIcon className="fill-current" />
          {t.stop}
        </Button>
      </div>
    </div>
  )
}

/** What the live region says for a state: one sentence per change. */
function announcementOf(
  t: RecorderMessages,
  state: ReturnType<typeof useAudioRecorder>['state'],
  recording: AudioRecording | null,
) {
  switch (state.status) {
    case 'requesting':
      return t.requesting
    case 'recording':
      return state.paused ? t.paused : t.recording
    case 'error':
      return errorText(t, state.error)
    case 'idle':
      return recording ? t.recorded(formatClock(recording.duration)) : ''
  }
}

/**
 * Moves focus to `target()` when `value` changes, if focus was inside `container` or had fallen
 * to the page (the focused button just disappeared). Focus elsewhere on the page is left alone.
 */
function useFocusOnChange(
  container: React.RefObject<HTMLElement | null>,
  value: unknown,
  target: () => HTMLElement | null,
) {
  const previous = React.useRef(value)
  const pick = React.useEffectEvent(target)
  React.useEffect(() => {
    if (Object.is(previous.current, value)) return
    previous.current = value
    const active = document.activeElement
    const inside = !active || active === document.body || container.current?.contains(active)
    if (inside) pick()?.focus()
  }, [container, value])
}

function AudioRecorder({
  value,
  defaultValue = null,
  onValueChange,
  maxDuration,
  constraints,
  disabled = false,
  label,
  className,
}: {
  /** The recording shown (controlled). `null`: none yet. */
  value?: AudioRecording | null
  defaultValue?: AudioRecording | null
  /** A new recording when one ends, `null` when it's deleted. */
  onValueChange?: (recording: AudioRecording | null) => void
  /** Seconds; recording stops by itself there, and the timer shows the limit. */
  maxDuration?: number
  /** Passed to getUserMedia as `audio`: a device id, noise suppression… */
  constraints?: MediaTrackConstraints
  disabled?: boolean
  /** The group's accessible name. Default: "Voice recording". */
  label?: string
  className?: string
}) {
  const t = useCoreloomI18n().messages.audioRecorder
  const [inner, setInner] = React.useState(defaultValue)
  const recording = value === undefined ? inner : value
  const setRecording = (next: AudioRecording | null) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const container = React.useRef<HTMLDivElement>(null)
  const stopButton = React.useRef<HTMLButtonElement>(null)
  const playButton = React.useRef<HTMLButtonElement>(null)
  const recordButton = React.useRef<HTMLButtonElement>(null)
  const recorder = useAudioRecorder({ maxDuration, constraints, onComplete: setRecording })
  const { state } = recorder
  // Each step hides the button that started it: focus moves to the next step's main control,
  // unless it was somewhere else on the page (a time limit can end a recording at any moment).
  const live = state.status === 'recording'
  const hasRecording = recording !== null
  useFocusOnChange(container, live, () =>
    live ? stopButton.current : (hasRecording ? playButton : recordButton).current,
  )
  useFocusOnChange(
    container,
    hasRecording,
    () => (hasRecording ? playButton : recordButton).current,
  )

  return (
    <div
      ref={container}
      role="group"
      aria-label={label ?? t.label}
      data-slot="audio-recorder"
      data-state={state.status}
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5',
        className,
      )}
    >
      {state.status === 'recording' && (
        <LiveRecording
          paused={state.paused}
          elapsed={state.elapsed}
          levels={state.levels}
          maxDuration={maxDuration}
          onPause={recorder.pause}
          onResume={recorder.resume}
          onStop={recorder.stop}
          onCancel={recorder.cancel}
          stopRef={stopButton}
        />
      )}
      {state.status !== 'recording' && recording && (
        <RecordingPlayback
          recording={recording}
          disabled={disabled}
          playRef={playButton}
          onDelete={() => {
            setRecording(null)
          }}
        />
      )}
      {state.status !== 'recording' && !recording && (
        <IdleRecorder
          error={state.status === 'error' ? state.error : undefined}
          requesting={state.status === 'requesting'}
          disabled={disabled}
          onStart={() => void recorder.start()}
          recordRef={recordButton}
        />
      )}
      <p role="status" className="sr-only">
        {announcementOf(t, state, recording)}
      </p>
    </div>
  )
}

function idleText(t: RecorderMessages, requesting: boolean, error?: AudioRecorderError) {
  if (requesting) return t.requesting
  return error ? errorText(t, error) : t.hint
}

function IdleRecorder({
  error,
  requesting,
  disabled,
  onStart,
  recordRef,
}: {
  error?: AudioRecorderError
  requesting: boolean
  disabled: boolean
  onStart: () => void
  recordRef: React.Ref<HTMLButtonElement>
}) {
  const t = useCoreloomI18n().messages.audioRecorder
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
      <Button
        ref={recordRef}
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        aria-disabled={requesting || undefined}
        aria-busy={requesting || undefined}
        onClick={() => {
          if (!requesting) onStart()
        }}
      >
        {requesting ? <Spinner /> : <MicIcon />}
        {error ? t.retry : t.record}
      </Button>
      <span
        className={cn(
          'min-w-0 text-[12.5px]',
          error ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {idleText(t, requesting, error)}
      </span>
    </div>
  )
}

type DictationState = { status: 'ready'; error?: string } | { status: 'transcribing' }

function dictationError(
  t: RecorderMessages,
  state: ReturnType<typeof useAudioRecorder>['state'],
  dictation: DictationState,
) {
  if (state.status === 'error') return errorText(t, state.error)
  return dictation.status === 'ready' ? dictation.error : undefined
}

function DictationButton({
  onTranscribe,
  onText,
  maxDuration = 120,
  constraints,
  disabled = false,
  className,
}: {
  /** Turns the recording into text: your speech-to-text call. Reject to show an error. */
  onTranscribe: (recording: AudioRecording) => Promise<string>
  /** The text to add to the field (see `appendText`). */
  onText: (text: string) => void
  /** Seconds; dictation stops by itself there. Default 120. */
  maxDuration?: number
  constraints?: MediaTrackConstraints
  disabled?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.audioRecorder
  const [dictation, setDictation] = React.useState<DictationState>({ status: 'ready' })
  const container = React.useRef<HTMLSpanElement>(null)
  const micButton = React.useRef<HTMLButtonElement>(null)
  const doneButton = React.useRef<HTMLButtonElement>(null)
  const recorder = useAudioRecorder({
    maxDuration,
    constraints,
    onComplete: (recording) => {
      setDictation({ status: 'transcribing' })
      onTranscribe(recording).then(
        (text) => {
          setDictation({ status: 'ready' })
          onText(text)
        },
        () => {
          setDictation({ status: 'ready', error: t.transcribeFailed })
        },
      )
    },
  })
  const { state } = recorder
  const live = state.status === 'recording'
  // The mic button stays focusable while busy (aria-disabled), so focus has a place to go when
  // Done disappears.
  useFocusOnChange(container, live, () => (live ? doneButton : micButton).current)

  const busy = dictation.status === 'transcribing' || state.status === 'requesting'
  const error = dictationError(t, state, dictation)
  let announcement = error ?? ''
  if (live) announcement = t.dictating
  else if (dictation.status === 'transcribing') announcement = t.transcribing

  return (
    <span
      ref={container}
      data-slot="dictation-button"
      className={cn('inline-flex min-w-0 items-center gap-1', className)}
    >
      {live && (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive-subtle py-0.5 pr-0.5 pl-2">
          <span
            aria-hidden
            className="size-2 shrink-0 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
          />
          <AudioWaveform levels={state.levels} bars={12} className="h-5 w-12" />
          <span className="font-mono text-[11.5px] text-foreground tabular-nums">
            {formatClock(state.elapsed)}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={t.discard}
            onClick={recorder.cancel}
          >
            <XIcon />
          </Button>
          <Button
            ref={doneButton}
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={t.finishDictation}
            onClick={recorder.stop}
          >
            <CheckIcon />
          </Button>
        </span>
      )}
      {!live && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={micButton}
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={dictation.status === 'transcribing' ? t.transcribing : t.dictate}
              aria-busy={busy || undefined}
              aria-disabled={busy || undefined}
              disabled={disabled}
              onClick={() => {
                if (busy) return
                setDictation({ status: 'ready' })
                recorder.reset()
                void recorder.start()
              }}
            >
              {busy ? <Spinner /> : <MicIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.dictate}</TooltipContent>
        </Tooltip>
      )}
      {error && !live && (
        <span className="min-w-0 truncate text-[12px] text-destructive" title={error}>
          {error}
        </span>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </span>
  )
}

export { appendText, AudioRecorder, type AudioRecording, AudioWaveform, DictationButton }
