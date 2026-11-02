'use client'

// Coreloom UI — AgentAvatar. A small animated face for an AI agent: it blinks while it waits, looks
// around while it thinks, talks while it answers, smiles when it is done and frowns on an error.
// `variant="dots"` is the quieter version: three dots that wave and bounce. Give each agent a `seed`
// (its id or name) and it keeps the same colour and eyes everywhere, so the members of a team are
// told apart at a glance. The state is said in words to screen readers; the motion stops for people
// who ask for reduced motion.
//
//   <AgentAvatar name="Researcher" seed="researcher" state="thinking" />
//   <AgentAvatar variant="dots" state={status === 'streaming' ? 'speaking' : 'idle'} decorative />
import * as React from 'react'

import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type AgentAvatarState = 'idle' | 'thinking' | 'speaking' | 'done' | 'error' | 'offline'
type AgentAvatarVariant = 'face' | 'dots'
type AgentAvatarTone = 'primary' | 'neutral' | 'teal' | 'violet' | 'orange' | 'blue' | 'pink'
type AgentAvatarEyes = 'round' | 'tall' | 'square'
type AgentAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * The tones a seed picks from: chart colours, distinct from one another in both themes. Pink is
 * left out so that a seeded agent never looks like one in error.
 */
const SEED_TONES = ['teal', 'violet', 'orange', 'blue'] as const
const SEED_EYES = ['round', 'tall', 'square'] as const

/**
 * The colour and eyes an agent gets from its seed (an id or a name): the same seed always gives
 * the same look, so an agent is recognisable wherever it appears.
 */
function agentAvatarLook(seed: string): { tone: AgentAvatarTone; eyes: AgentAvatarEyes } {
  // FNV-1a over the seed's UTF-16 units, then a final mix so that close seeds ("agent-1",
  // "agent-2") land on different looks.
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  hash >>>= 0
  return {
    tone: SEED_TONES[hash % SEED_TONES.length] ?? 'teal',
    eyes: SEED_EYES[(hash >>> 8) % SEED_EYES.length] ?? 'round',
  }
}

const TONES: Record<AgentAvatarTone | 'danger' | 'muted', string> = {
  primary: 'border-primary/30 bg-primary-subtle text-primary-text',
  neutral: 'border-border bg-secondary text-fg-secondary',
  teal: 'border-chart-1/35 bg-chart-1/15 text-chart-1',
  violet: 'border-chart-2/35 bg-chart-2/15 text-chart-2',
  orange: 'border-chart-3/35 bg-chart-3/15 text-chart-3',
  blue: 'border-chart-4/35 bg-chart-4/15 text-chart-4',
  pink: 'border-chart-5/35 bg-chart-5/15 text-chart-5',
  danger: 'border-destructive/40 bg-destructive-subtle text-destructive',
  muted: 'border-border-subtle bg-inset text-muted-foreground',
}

const SIZES: Record<AgentAvatarSize, string> = {
  xs: 'size-4 rounded-[5px]',
  sm: 'size-6 rounded-[7px]',
  md: 'size-8 rounded-[9px]',
  lg: 'size-10 rounded-[11px]',
  xl: 'size-14 rounded-[15px]',
}

// SVG parts move around their own centre.
const own = '[transform-box:fill-box] origin-center motion-reduce:animate-none'

/** One eye, open, centred on (cx, cy) of the 32 × 32 face. */
function Eye({
  shape,
  cx,
  cy,
  className,
  style,
}: {
  shape: AgentAvatarEyes
  cx: number
  cy: number
  className?: string
  style?: React.CSSProperties
}) {
  if (shape === 'round')
    return <circle cx={cx} cy={cy} r={3.4} className={className} style={style} />
  const [w, h, r] = shape === 'tall' ? [4.2, 8.6, 2.1] : [6, 6, 1.6]
  return (
    <rect
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      rx={r}
      className={className}
      style={style}
    />
  )
}

function Face({ state, eyes }: { state: AgentAvatarState; eyes: AgentAvatarEyes }) {
  const line = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const
  if (state === 'done')
    return (
      <g {...line}>
        <path d="M8.5 16.5 Q11 12.5 13.5 16.5" />
        <path d="M18.5 16.5 Q21 12.5 23.5 16.5" />
      </g>
    )
  if (state === 'error')
    return (
      <g {...line}>
        <path d="M9 12.5 13 16.5 M13 12.5 9 16.5" />
        <path d="M19 12.5 23 16.5 M23 12.5 19 16.5" />
        <path d="M13 22.5 Q16 20.5 19 22.5" />
      </g>
    )
  if (state === 'offline')
    return (
      <g {...line}>
        <path d="M8.5 15.5 H13.5" />
        <path d="M18.5 15.5 H23.5" />
      </g>
    )
  if (state === 'thinking')
    return (
      <g className={cn(own, 'animate-agent-scan')}>
        <Eye shape={eyes} cx={11} cy={13.5} />
        <Eye shape={eyes} cx={21} cy={13.5} />
      </g>
    )
  if (state === 'speaking')
    return (
      <>
        <g className={cn(own, 'animate-agent-hop')}>
          <Eye shape={eyes} cx={11} cy={14} />
          <Eye shape={eyes} cx={21} cy={14} />
        </g>
        <rect
          x={13}
          y={21.2}
          width={6}
          height={1.6}
          rx={0.8}
          className={cn(own, 'animate-agent-talk')}
        />
      </>
    )
  return (
    <>
      <Eye shape={eyes} cx={11} cy={15} className={cn(own, 'animate-agent-blink')} />
      <Eye shape={eyes} cx={21} cy={15} className={cn(own, 'animate-agent-blink')} />
    </>
  )
}

function Dots({ state }: { state: AgentAvatarState }) {
  // A smile when it is done, smaller dots when offline, a row otherwise.
  const ys = state === 'done' ? [14.5, 17.5, 14.5] : [16, 16, 16]
  const r = state === 'offline' ? 1.6 : 2.2
  const motion =
    state === 'thinking' ? 'animate-agent-wave' : state === 'speaking' ? 'animate-agent-eq' : ''
  return (
    <>
      {[10, 16, 22].map((cx, i) => (
        <rect
          key={cx}
          x={cx - r}
          y={(ys[i] ?? 16) - r}
          width={r * 2}
          height={r * 2}
          rx={r}
          className={cn(own, motion)}
          style={motion ? { animationDelay: `${String(i * 150)}ms` } : undefined}
        />
      ))}
    </>
  )
}

function AgentAvatar({
  name,
  state = 'idle',
  variant = 'face',
  seed,
  tone,
  eyes,
  size = 'md',
  decorative = false,
  className,
  ...props
}: {
  /** The agent's name, said with its state to screen readers ("Researcher, thinking"). Default "AI agent". */
  name?: string
  /** idle (blinks), thinking (looks around), speaking (talks), done (smiles), error, offline. Default idle. */
  state?: AgentAvatarState
  /** face: eyes on a rounded square; dots: three dots in a circle. Default face. */
  variant?: AgentAvatarVariant
  /** Picks a stable colour and eyes for this agent (its id or name). Without it, the accent colour and round eyes. */
  seed?: string
  /** Overrides the seed's colour; `primary` follows the app's accent. */
  tone?: AgentAvatarTone
  /** Overrides the seed's eyes (face only). */
  eyes?: AgentAvatarEyes
  /** xs 16 px, sm 24, md 32 (default), lg 40, xl 56. */
  size?: AgentAvatarSize
  /** Hide it from screen readers when the name and state are already said next to it. */
  decorative?: boolean
} & Omit<React.ComponentProps<'span'>, 'children'>) {
  const t = useCoreloomI18n().messages.ai.agentAvatar
  const look = seed === undefined ? undefined : agentAvatarLook(seed)
  const shape = eyes ?? look?.eyes ?? 'round'
  const colour =
    state === 'error' ? 'danger' : state === 'offline' ? 'muted' : (tone ?? look?.tone ?? 'primary')
  const shell =
    state === 'error' ? 'animate-agent-shake' : state === 'done' ? 'animate-agent-pop' : ''
  return (
    <span
      data-slot="agent-avatar"
      data-state={state}
      data-variant={variant}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': t.label(name ?? t.agent, t.state[state]) })}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border select-none motion-reduce:animate-none',
        SIZES[size],
        variant === 'dots' && 'rounded-full',
        TONES[colour],
        shell,
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className="size-full">
        {variant === 'dots' ? <Dots state={state} /> : <Face state={state} eyes={shape} />}
      </svg>
    </span>
  )
}

export {
  AgentAvatar,
  type AgentAvatarEyes,
  agentAvatarLook,
  type AgentAvatarSize,
  type AgentAvatarState,
  type AgentAvatarTone,
  type AgentAvatarVariant,
}
