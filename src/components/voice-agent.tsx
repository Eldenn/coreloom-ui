'use client'

// Coreloom UI — Voice agent (voice-agent block). The face of a spoken conversation with an AI:
// an avatar that shows whether it listens, thinks or speaks, a level meter, a push-to-talk button
// (hold it, or Space while it has focus; or tap to start and stop in hands-free mode) and the live
// transcript, partial words included. The app owns the microphone and the model (`onStart`,
// `onStop`, the `state` and `transcript` it feeds back); nothing is recorded or sent here.
import { MicIcon, SquareIcon } from 'lucide-react'
import * as React from 'react'

import { AgentAvatar, type AgentAvatarState } from '@/components/ui/agent-avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type VoiceState =
  | { status: 'idle' }
  | { status: 'connecting' }
  | { status: 'listening' }
  | { status: 'thinking' }
  | { status: 'speaking' }
  | { status: 'error'; error: string }

type VoiceStatus = VoiceState['status']

/** "hold": talk while the button is held. "toggle" (hands-free): tap to start, tap to stop. */
type TalkMode = 'hold' | 'toggle'

interface VoiceTurn {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** false while the words are still coming in (shown lighter, not announced yet). Default true. */
  final?: boolean
}

const avatarState: Record<VoiceStatus, AgentAvatarState> = {
  idle: 'idle',
  connecting: 'thinking',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
  error: 'error',
}

/**
 * The heights of a level meter's bars (0 to 1) for a level from 0 to 1: a fixed bell shape, so the
 * middle moves most, scaled by the level, never quite flat.
 */
function levelBars(level: number, count: number) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(level) ? level : 0))
  return Array.from({ length: count }, (_, i) => {
    const x = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
    const shape = 0.35 + 0.65 * Math.exp(-3 * x * x) * (0.75 + 0.25 * Math.cos(i * 2.3))
    return Math.max(0.08, clamped * shape)
  })
}

function VoiceLevel({
  level,
  active = true,
  bars = 24,
  className,
}: {
  /** 0 (silence) to 1 (loud): the microphone's level while listening, the voice's while speaking. */
  level: number
  /** false dims the meter (nobody is talking). Default true. */
  active?: boolean
  bars?: number
  className?: string
}) {
  const heights = levelBars(active ? level : 0, bars)
  return (
    <div
      aria-hidden
      data-slot="voice-level"
      className={cn('flex h-12 items-center justify-center gap-[3px]', className)}
    >
      {heights.map((h, i) => (
        <span
          // eslint-disable-next-line @eslint-react/no-array-index-key -- the bars are positions, not items
          key={i}
          className={cn(
            'w-[3px] rounded-pill transition-[height] duration-fast motion-reduce:transition-none',
            active ? 'bg-primary' : 'bg-border-strong',
          )}
          style={{ height: `${Math.round(h * 100)}%` }}
        />
      ))}
    </div>
  )
}

/** Press-and-hold with the pointer and with Space / Enter; or a plain toggle. */
function usePushToTalk({
  mode,
  listening,
  onStart,
  onStop,
}: {
  mode: TalkMode
  listening: boolean
  onStart: () => void
  onStop: () => void
}) {
  const held = React.useRef(false)
  const start = () => {
    if (held.current) return
    held.current = true
    onStart()
  }
  const stop = () => {
    if (!held.current) return
    held.current = false
    onStop()
  }
  if (mode === 'toggle')
    return {
      onClick: () => {
        if (listening) onStop()
        else onStart()
      },
    }
  return {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.currentTarget.setPointerCapture(e.pointerId)
      start()
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onBlur: stop,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      e.preventDefault()
      if (!e.repeat) start()
    },
    onKeyUp: (e: React.KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return
      e.preventDefault()
      stop()
    },
    // Touch screens open a context menu on a long press.
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
    },
  }
}

function talkLabel(mode: TalkMode, listening: boolean, t: Messages['voice']) {
  if (mode === 'hold') return t.hold
  return listening ? t.stop : t.tap
}

function PushToTalkButton({
  state,
  mode = 'hold',
  onStart,
  onStop,
  disabled,
  className,
}: {
  state: VoiceState
  /** Default "hold". */
  mode?: TalkMode
  /** The person starts talking: open the microphone. Also called to talk over the agent. */
  onStart: () => void
  /** They stopped: close the microphone and send what they said. */
  onStop: () => void
  disabled?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.voice
  const listening = state.status === 'listening'
  const handlers = usePushToTalk({ mode, listening, onStart, onStop })
  const busy = state.status === 'connecting'
  const label = talkLabel(mode, listening, t)
  const icon = listening && mode === 'toggle' ? <SquareIcon aria-hidden /> : <MicIcon aria-hidden />
  return (
    <Button
      type="button"
      size="icon-lg"
      // After a failure (a blocked microphone) the button still works, without its accent.
      variant={state.status === 'error' ? 'secondary' : 'default'}
      aria-label={label}
      aria-pressed={listening}
      disabled={!!disabled || busy}
      data-listening={listening || undefined}
      className={cn(
        'size-16 touch-none rounded-full select-none [&_svg:not([class*=size-])]:size-6',
        'data-[listening]:ring-[6px] data-[listening]:ring-primary/25',
        className,
      )}
      {...handlers}
    >
      {busy ? <Spinner aria-hidden /> : icon}
    </Button>
  )
}

/** The latest final turn, or undefined. */
const lastFinal = (turns: VoiceTurn[]) => [...turns].reverse().find((turn) => turn.final !== false)

function LiveTranscript({
  turns,
  assistantName,
  announce = true,
  className,
}: {
  /** Oldest first; the last one may still be partial (`final: false`). */
  turns: VoiceTurn[]
  /** Default "Assistant". */
  assistantName?: string
  /** Reads each finished turn aloud (polite). Turn it off when the page already announces them. */
  announce?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.voice
  const listRef = React.useRef<HTMLOListElement>(null)
  const latest = lastFinal(turns)
  const speaker = (role: VoiceTurn['role']) =>
    role === 'user' ? t.you : (assistantName ?? t.assistant)
  // Keep the newest words in view, unless the person scrolled up to read.
  React.useEffect(() => {
    const list = listRef.current
    if (!list) return
    if (list.scrollHeight - list.scrollTop - list.clientHeight < 80)
      list.scrollTop = list.scrollHeight
  }, [turns])
  return (
    <div data-slot="live-transcript" className={cn('flex min-h-0 flex-col', className)}>
      <ol
        ref={listRef}
        aria-label={t.transcript}
        className="m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-0"
      >
        {turns.map((turn) => (
          <li
            key={turn.id}
            className={cn('flex flex-col gap-0.5', turn.role === 'user' && 'items-end text-end')}
          >
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {speaker(turn.role)}
            </span>
            <p
              className={cn(
                'm-0 max-w-[85%] text-[15px] leading-[1.55]',
                turn.final === false ? 'text-fg-secondary' : 'text-foreground',
              )}
            >
              {turn.text}
              {turn.final === false && (
                <span
                  aria-hidden
                  className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary motion-reduce:animate-none"
                />
              )}
            </p>
          </li>
        ))}
      </ol>
      {announce && (
        <p aria-live="polite" className="sr-only">
          {latest ? `${speaker(latest.role)}: ${latest.text}` : ''}
        </p>
      )}
    </div>
  )
}

/** What the agent is doing, in words; an error says what went wrong. */
function useStatusLabel(state: VoiceState, mode: TalkMode) {
  const t = useCoreloomI18n().messages.voice
  if (state.status === 'error') return state.error
  if (state.status === 'idle') return mode === 'hold' ? t.idleHold : t.idleTap
  return t.status[state.status]
}

/**
 * The one line the screen reader hears: the agent's answer once it is complete, otherwise the new
 * state ("Thinking…"). The person's own words aren't read back. Worked out during render from
 * what changed since the last one.
 */
function useAnnouncement(state: VoiceState, turns: VoiceTurn[], statusLabel: string, name: string) {
  const reply = lastFinal(turns.filter((turn) => turn.role === 'assistant'))
  const [seen, setSeen] = React.useState({ status: state.status, turn: reply?.id, message: '' })
  if (seen.status !== state.status || seen.turn !== reply?.id) {
    const message = reply && seen.turn !== reply.id ? `${name}: ${reply.text}` : statusLabel
    setSeen({ status: state.status, turn: reply?.id, message })
  }
  return seen.message
}

function VoiceAgent({
  state,
  transcript = [],
  level = 0,
  mode: modeProp,
  defaultMode = 'hold',
  onModeChange,
  onStart,
  onStop,
  name,
  seed,
  className,
}: {
  state: VoiceState
  /** Oldest first; the last turn may be partial (`final: false`). */
  transcript?: VoiceTurn[]
  /** 0 to 1: the microphone while listening, the agent's voice while speaking. */
  level?: number
  mode?: TalkMode
  defaultMode?: TalkMode
  /** Shows a "Hands-free" switch. */
  onModeChange?: (mode: TalkMode) => void
  /** Open the microphone (also to talk over the agent while it speaks). */
  onStart: () => void
  /** Close it and send what was said. */
  onStop: () => void
  /** The agent's name. Default "Assistant". */
  name?: string
  /** Gives the avatar its own colour and eyes (see AgentAvatar). */
  seed?: string
  className?: string
}) {
  const t = useCoreloomI18n().messages.voice
  const [innerMode, setInnerMode] = React.useState(defaultMode)
  const mode = modeProp ?? innerMode
  const switchId = React.useId()
  const statusLabel = useStatusLabel(state, mode)
  const announcement = useAnnouncement(state, transcript, statusLabel, name ?? t.assistant)
  const metering = state.status === 'listening' || state.status === 'speaking'

  return (
    <div
      data-slot="voice-agent"
      data-status={state.status}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6">
        <AgentAvatar
          name={name ?? t.assistant}
          seed={seed}
          size="xl"
          state={avatarState[state.status]}
          decorative
        />
        <p
          className={cn(
            'm-0 min-h-6 text-center text-[14.5px]',
            state.status === 'error' ? 'text-destructive' : 'text-fg-secondary',
          )}
        >
          {statusLabel}
        </p>
        <VoiceLevel level={level} active={metering} className="w-full max-w-60" />
        <PushToTalkButton state={state} mode={mode} onStart={onStart} onStop={onStop} />
        {mode === 'hold' && <p className="m-0 text-[12.5px] text-muted-foreground">{t.holdHint}</p>}
        {!!onModeChange && (
          <div className="flex items-center gap-2">
            <Switch
              id={switchId}
              size="sm"
              checked={mode === 'toggle'}
              onCheckedChange={(on) => {
                const next = on ? 'toggle' : 'hold'
                setInnerMode(next)
                onModeChange(next)
              }}
            />
            <label htmlFor={switchId} className="text-[13px] text-fg-secondary">
              {t.handsFree}
            </label>
          </div>
        )}
      </div>
      {transcript.length > 0 && (
        <LiveTranscript
          turns={transcript}
          assistantName={name}
          announce={false}
          className="max-h-72 border-t border-border-subtle px-5 py-4"
        />
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

export {
  levelBars,
  LiveTranscript,
  PushToTalkButton,
  type TalkMode,
  VoiceAgent,
  VoiceLevel,
  type VoiceState,
  type VoiceStatus,
  type VoiceTurn,
}
