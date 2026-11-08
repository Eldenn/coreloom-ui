'use client'

// Coreloom UI — AgentRunReplay (AI block). Replays a finished multi-agent run from its trace spans:
// the agent graph lit as it was at each moment, a timeline to scrub or play (1×, 2×, 4×), the turns
// in order (a numbered path; each step jumps there) and what each agent cost — turns, time, tokens,
// tool calls, errors. It reads the spans you already have for ai-runs (`TraceSpan` fits); nothing
// is fetched. For a run still going, show AgentTeams with `agentActivityFromSpans` instead.
import { PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react'
import * as React from 'react'

import { agentActivityFromSpans, type AgentSpanLike } from '@/components/ai-agent-teams'
import {
  AgentGraph,
  type AgentGraphEdge,
  type AgentGraphNode,
  type AgentGraphTeam,
} from '@/components/ui/agent-graph'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A span of the run: what agentActivityFromSpans reads, plus its length and what it used. */
interface ReplaySpan extends AgentSpanLike {
  durationMs: number
  tokens?: { input: number; output: number }
  cost?: number
}

interface ReplayStep {
  /** 1-based, in the order the agents took turns. */
  n: number
  agentId: string
  startMs: number
}

interface AgentRunMetrics {
  agentId: string
  turns: number
  /** Time spent in its own turns, in ms. */
  durationMs: number
  tokens: number
  cost: number
  toolCalls: number
  errors: number
}

const SPEEDS = ['1', '2', '4'] as const

/** When the run ended, in ms from its start. */
function replayDuration(spans: readonly ReplaySpan[]) {
  return spans.reduce((end, s) => Math.max(end, s.startMs + s.durationMs), 0)
}

/** The spans as they stood at `ms`: later ones left out, unfinished ones running. */
function spansAt<T extends ReplaySpan>(spans: readonly T[], ms: number): T[] {
  return spans
    .filter((s) => s.startMs <= ms)
    .map((s) => (s.startMs + s.durationMs > ms ? { ...s, status: 'running' as const } : s))
}

function resolver(agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[]) {
  const ids = new Set(agents.map((a) => a.id))
  return (s: AgentSpanLike) =>
    s.agentId !== undefined && ids.has(s.agentId)
      ? s.agentId
      : agents.find((a) => a.name === s.name)?.id
}

/** The turns in order: each time the work moved to another agent, numbered from 1. */
function replaySteps(
  spans: readonly ReplaySpan[],
  agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[],
): ReplayStep[] {
  const resolve = resolver(agents)
  const steps: ReplayStep[] = []
  for (const s of [...spans].sort((a, b) => a.startMs - b.startMs)) {
    const agentId = s.kind === 'agent' ? resolve(s) : undefined
    if (agentId === undefined || steps.at(-1)?.agentId === agentId) continue
    steps.push({ n: steps.length + 1, agentId, startMs: s.startMs })
  }
  return steps
}

/**
 * What each agent did: its turns and their time, and the tokens, cost, tool calls and errors of
 * every span under its turns (a tool call inside a sub-agent counts for the sub-agent).
 */
function agentRunMetrics(
  spans: readonly ReplaySpan[],
  agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[],
): AgentRunMetrics[] {
  const resolve = resolver(agents)
  const byId = new Map(spans.map((s) => [s.id, s]))
  // The agent a span belongs to: its own, or its nearest agent ancestor's. Bounded against loops.
  const owner = (span: ReplaySpan) => {
    let current: ReplaySpan | undefined = span
    for (let step = 0; current && step <= spans.length; step++) {
      if (current.kind === 'agent') {
        const id = resolve(current)
        if (id !== undefined) return id
      }
      current = current.parentId !== undefined ? byId.get(current.parentId) : undefined
    }
    return undefined
  }
  const metrics = new Map<string, AgentRunMetrics>()
  for (const s of spans) {
    const agentId = owner(s)
    if (agentId === undefined) continue
    const m = metrics.get(agentId) ?? {
      agentId,
      turns: 0,
      durationMs: 0,
      tokens: 0,
      cost: 0,
      toolCalls: 0,
      errors: 0,
    }
    if (s.kind === 'agent') {
      m.turns += 1
      m.durationMs += s.durationMs
    }
    if (s.kind === 'tool') m.toolCalls += 1
    if (s.status === 'error') m.errors += 1
    m.tokens += (s.tokens?.input ?? 0) + (s.tokens?.output ?? 0)
    m.cost += s.cost ?? 0
    metrics.set(agentId, m)
  }
  return agents.flatMap((a) => metrics.get(a.id) ?? [])
}

/** Plays from `time` to `end` at `speed`, one animation frame at a time. */
function usePlayback(end: number, initial: number) {
  const [time, setTime] = React.useState(initial)
  const [playing, setPlaying] = React.useState(false)
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>('1')
  // The frame loop reads the latest time from here, not from a stale render.
  const timeRef = React.useRef(initial)
  const moveTo = (ms: number) => {
    timeRef.current = ms
    setTime(ms)
  }
  const advance = React.useEffectEvent((elapsed: number) => {
    const next = Math.min(end, timeRef.current + elapsed * Number(speed))
    moveTo(next)
    if (next >= end) setPlaying(false)
    return next < end
  })
  React.useEffect(() => {
    if (!playing) return
    let last = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const going = advance(now - last)
      last = now
      if (going) frame = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [playing])
  return {
    time,
    playing,
    speed,
    setSpeed,
    seek: (ms: number) => {
      moveTo(Math.min(end, Math.max(0, ms)))
    },
    toggle: () => {
      // Play at the end starts over.
      if (!playing && timeRef.current >= end) moveTo(0)
      setPlaying(!playing)
    },
  }
}

function MetricsTable({
  metrics,
  agents,
  selectedId,
}: {
  metrics: AgentRunMetrics[]
  agents: AgentGraphNode[]
  selectedId: string | null
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.agentReplay
  const seconds = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'second',
    maximumFractionDigits: 1,
  })
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 3,
  })
  const name = (id: string) => agents.find((a) => a.id === id)?.name ?? id
  return (
    <div className="relative overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full border-collapse text-[13px] whitespace-nowrap">
        <caption className="px-4 pt-3 pb-1 text-left font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {t.metrics}
        </caption>
        <thead>
          <tr className="border-b border-border text-right text-muted-foreground">
            <th scope="col" className="px-4 py-2 text-left font-medium">
              {t.agent}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t.turns}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t.time}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t.tokens}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t.toolCalls}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t.cost}
            </th>
            <th scope="col" className="px-4 py-2 font-medium">
              {t.errors}
            </th>
          </tr>
        </thead>
        <tbody className="text-right font-mono text-[12.5px] text-fg-secondary tabular-nums">
          {metrics.map((m) => (
            <tr
              key={m.agentId}
              aria-current={m.agentId === selectedId || undefined}
              className="border-b border-border-subtle last:border-b-0 aria-[current]:bg-secondary"
            >
              <th scope="row" className="px-4 py-2 text-left font-sans font-medium text-foreground">
                {name(m.agentId)}
              </th>
              <td className="px-3 py-2">{formatNumber(m.turns)}</td>
              <td className="px-3 py-2">{seconds.format(m.durationMs / 1000)}</td>
              <td className="px-3 py-2">{formatNumber(m.tokens)}</td>
              <td className="px-3 py-2">{formatNumber(m.toolCalls)}</td>
              <td className="px-3 py-2">{money.format(m.cost)}</td>
              <td className={cn('px-4 py-2', m.errors > 0 && 'text-destructive')}>
                {formatNumber(m.errors)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReplayControls({
  play,
  end,
  valueText,
  seconds,
}: {
  play: ReturnType<typeof usePlayback>
  end: number
  valueText: string
  seconds: (ms: number) => string
}) {
  const t = useCoreloomI18n().messages.agentReplay
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <Button
        size="icon-sm"
        variant="outline"
        aria-label={play.playing ? t.pause : t.play}
        onClick={play.toggle}
      >
        {play.playing ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={t.restart}
        onClick={() => {
          play.seek(0)
        }}
      >
        <RotateCcwIcon />
      </Button>
      <Slider
        className="min-w-40 flex-1"
        min={0}
        max={Math.max(1, end)}
        step={100}
        value={[play.time]}
        aria-label={t.position}
        aria-valuetext={valueText}
        onValueChange={([v]) => {
          play.seek(v)
        }}
      />
      <span className="font-mono text-[12px] text-fg-secondary tabular-nums">
        {seconds(play.time)} / {seconds(end)}
      </span>
      <Select
        value={play.speed}
        onValueChange={(v) => {
          const speed = SPEEDS.find((s) => s === v)
          if (speed) play.setSpeed(speed)
        }}
      >
        <SelectTrigger size="sm" aria-label={t.speed} className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((s) => (
            <SelectItem key={s} value={s}>
              {s}×
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function AgentRunReplay({
  agents,
  edges,
  teams,
  spans,
  defaultTime = 0,
  avatars,
  className,
}: {
  agents: AgentGraphNode[]
  edges: AgentGraphEdge[]
  teams?: AgentGraphTeam[]
  /** The run's trace spans (`TraceSpan` from ai-runs): agents' turns and what ran inside them. */
  spans: ReplaySpan[]
  /** Where the replay starts, in ms from the run's start. */
  defaultTime?: number
  /** Animated AgentAvatars in the graph (`face` or `dots`). */
  avatars?: React.ComponentProps<typeof AgentGraph>['avatars']
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.agentReplay
  const end = replayDuration(spans)
  const play = usePlayback(end, Math.min(defaultTime, end))
  const [selected, setSelected] = React.useState<string | null>(null)
  const now = React.useMemo(() => spansAt(spans, play.time), [spans, play.time])
  const { activity, path } = React.useMemo(() => agentActivityFromSpans(now, agents), [now, agents])
  const steps = React.useMemo(() => replaySteps(spans, agents), [spans, agents])
  const metrics = React.useMemo(() => agentRunMetrics(spans, agents), [spans, agents])
  const seconds = (ms: number) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'second',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(ms / 1000)
  const name = (id: string) => agents.find((a) => a.id === id)?.name ?? id
  const working = agents.filter((a) => activity[a.id] === 'working').map((a) => a.name)
  const currentStep = steps.filter((s) => s.startMs <= play.time).at(-1)

  if (!spans.length)
    return (
      <p
        data-slot="agent-run-replay"
        className="m-0 rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center text-[13px] text-muted-foreground"
      >
        {t.empty}
      </p>
    )

  return (
    <div data-slot="agent-run-replay" className={cn('flex flex-col gap-4', className)}>
      <ReplayControls
        play={play}
        end={end}
        valueText={t.positionText(seconds(play.time), seconds(end), working)}
        seconds={seconds}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <AgentGraph
          agents={agents}
          edges={edges}
          teams={teams}
          activity={activity}
          activePath={path}
          selectedId={selected}
          onSelectedChange={setSelected}
          avatars={avatars}
          label={t.graph}
        />
        <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.steps}
          </p>
          <ol aria-label={t.steps} className="m-0 flex list-none flex-col gap-0.5 p-0">
            {steps.map((s) => (
              <li key={s.n}>
                <button
                  type="button"
                  aria-current={s === currentStep ? 'step' : undefined}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring aria-[current]:bg-secondary"
                  onClick={() => {
                    play.seek(s.startMs)
                    setSelected(s.agentId)
                  }}
                >
                  <span
                    aria-hidden
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-inset font-mono text-[11px] text-fg-secondary"
                  >
                    {s.n}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    <span className="sr-only">{t.stepN(s.n)}</span>
                    {name(s.agentId)}
                  </span>
                  <span className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
                    {seconds(s.startMs)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <MetricsTable metrics={metrics} agents={agents} selectedId={selected} />
    </div>
  )
}

export {
  type AgentRunMetrics,
  agentRunMetrics,
  AgentRunReplay,
  replayDuration,
  type ReplaySpan,
  type ReplayStep,
  replaySteps,
  spansAt,
}
