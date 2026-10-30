"use client"

// Coreloom UI — AI runs (block). RunList: an agent's runs in a DataTable (status, trigger, start,
// duration, tokens, cost). RunTrace: one run step by step — a waterfall of model calls, tool calls
// and retrievals on a shared time axis, and the selected step's input, output, tokens and error.
// Feed it your tracing data (OpenTelemetry spans, Langfuse, your own logs) mapped to `TraceSpan`.
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { BotIcon, DatabaseIcon, SparklesIcon, WrenchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatCost, formatDuration } from "@/lib/ai"
import { AppLink } from "@/lib/link"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { useCoreloomI18n } from "@/lib/i18n"

type RunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled"

type RunSummary = {
  id: string
  agent: string
  status: RunStatus
  /** What started it: "Chat", "Schedule", "API", "Webhook"… */
  trigger: string
  startedAt: Date | string
  durationMs?: number
  tokens?: number
  cost?: number
}

const RUN_VARIANT = { queued: "secondary", running: "default", succeeded: "success", failed: "destructive", cancelled: "secondary" } as const

function RunStatusBadge({ status }: { status: RunStatus }) {
  const t = useCoreloomI18n().messages.ai.runs
  return (
    <Badge variant={RUN_VARIANT[status]}>
      <BadgeDot />
      {t.status[status]}
    </Badge>
  )
}

/** Runs in a table; the run id links to its trace. */
function RunList({ runs, href, className }: { runs: RunSummary[]; href: (id: string) => string; className?: string }) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.ai.runs
  const columns = React.useMemo<ColumnDef<RunSummary>[]>(
    () => [
      {
        accessorKey: "id",
        header: t.run,
        cell: ({ row }) => (
          <AppLink href={href(row.original.id)} className="font-mono text-[12.5px] text-primary-text underline-offset-4 hover:underline">
            {row.original.id}
          </AppLink>
        ),
      },
      { accessorKey: "agent", header: ({ column }) => <DataTableColumnHeader column={column} title={t.agent} />, cell: ({ row }) => <span className="text-foreground">{row.original.agent}</span> },
      { accessorKey: "status", header: t.state, cell: ({ row }) => <RunStatusBadge status={row.original.status} /> },
      { accessorKey: "trigger", header: t.trigger },
      {
        accessorKey: "startedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t.started} />,
        sortingFn: (a, b) => +new Date(a.original.startedAt) - +new Date(b.original.startedAt),
        cell: ({ row }) => (
          <span className="font-mono text-[12px]">
            {new Date(row.original.startedAt).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        ),
      },
      {
        accessorKey: "durationMs",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t.duration} />,
        cell: ({ row }) => <span className="font-mono text-[12px]">{row.original.durationMs !== undefined ? formatDuration(row.original.durationMs, locale) : "—"}</span>,
      },
      {
        accessorKey: "tokens",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t.tokens} />,
        cell: ({ row }) => <span className="font-mono text-[12px]">{row.original.tokens !== undefined ? formatNumber(row.original.tokens) : "—"}</span>,
      },
      {
        accessorKey: "cost",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t.cost} />,
        cell: ({ row }) => <span className="font-mono text-[12px]">{row.original.cost !== undefined ? formatCost(row.original.cost, locale) : "—"}</span>,
      },
    ],
    [t, href, locale, formatNumber, messages]
  )
  return <DataTable columns={columns} data={runs} getRowId={(r) => r.id} filterColumn="agent" filterPlaceholder={messages.ai.agents.search} pageSize={10} className={className} />
}

type SpanKind = "agent" | "llm" | "tool" | "retrieval"

type TraceSpan = {
  id: string
  /** The span it runs inside (a tool call inside the agent's step). */
  parentId?: string
  kind: SpanKind
  name: string
  /** Start, in ms from the run's start. */
  startMs: number
  durationMs: number
  status: "ok" | "error" | "running"
  model?: string
  tokens?: { input: number; output: number }
  cost?: number
  input?: unknown
  output?: unknown
  error?: string
}

const KIND = {
  agent: { icon: BotIcon, bar: "bg-fg-secondary/60" },
  llm: { icon: SparklesIcon, bar: "bg-primary" },
  tool: { icon: WrenchIcon, bar: "bg-chart-2" },
  retrieval: { icon: DatabaseIcon, bar: "bg-chart-4" },
} as const

function Json({ value }: { value: unknown }) {
  return (
    <pre className="m-0 max-h-72 overflow-auto rounded-md bg-inset px-3 py-2.5 font-mono text-[12px] leading-[1.6] whitespace-pre-wrap text-foreground">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <span className="text-[15px] font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

/** One run: totals, the waterfall of its steps, and the selected step's details. */
function RunTrace({
  run,
  spans,
  defaultSelectedId,
  className,
}: {
  run: { status: RunStatus; durationMs: number; tokens?: { input: number; output: number }; cost?: number; model?: string }
  spans: TraceSpan[]
  defaultSelectedId?: string
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.ai.runs
  const [selected, setSelected] = React.useState(defaultSelectedId ?? spans.find((s) => s.error)?.id ?? spans.find((s) => s.status === "error")?.id ?? spans[0]?.id)
  const total = Math.max(run.durationMs, ...spans.map((s) => s.startMs + s.durationMs), 1)

  // Depth-first order with each span's depth, so children sit under their parent.
  const ordered = React.useMemo(() => {
    const children = new Map<string | undefined, TraceSpan[]>()
    for (const s of spans) children.set(s.parentId, [...(children.get(s.parentId) ?? []), s])
    const out: { span: TraceSpan; depth: number }[] = []
    const walk = (parent: string | undefined, depth: number) => {
      for (const s of (children.get(parent) ?? []).sort((a, b) => a.startMs - b.startMs)) {
        out.push({ span: s, depth })
        walk(s.id, depth + 1)
      }
    }
    walk(undefined, 0)
    return out
  }, [spans])
  const current = spans.find((s) => s.id === selected)
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div data-slot="run-trace" className={cn("flex flex-col gap-4", className)}>
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
        <Stat label={t.state} value={<RunStatusBadge status={run.status} />} />
        <Stat label={t.duration} value={formatDuration(run.durationMs, locale)} />
        <Stat label={t.tokens} value={run.tokens ? t.tokensInOut(formatNumber(run.tokens.input), formatNumber(run.tokens.output)) : "—"} />
        <Stat label={t.cost} value={run.cost !== undefined ? formatCost(run.cost, locale) : "—"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="run-trace-steps" className="flex min-w-0 flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
            <h3 id="run-trace-steps" className="m-0 text-[13.5px] font-semibold text-foreground">
              {t.steps}
            </h3>
            <span className="font-mono text-[11px] text-muted-foreground">{t.timeline}</span>
          </div>
          <div aria-hidden className="relative mx-4 mt-2 ml-[45%] h-4 font-mono text-[10.5px] text-muted-foreground">
            {ticks.map((f) => (
              <span key={f} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${f * 100}%` }}>
                {formatDuration(total * f, locale)}
              </span>
            ))}
          </div>
          <ul className="m-0 flex list-none flex-col p-2 pt-1">
            {ordered.map(({ span, depth }) => {
              const Icon = KIND[span.kind].icon
              const active = span.id === selected
              return (
                <li key={span.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(span.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                      active ? "bg-primary-subtle" : "hover:bg-accent/60"
                    )}
                  >
                    <span className="flex w-[45%] min-w-0 shrink-0 items-center gap-1.5" style={{ paddingLeft: depth * 14 }}>
                      <Icon className={cn("size-3.5 shrink-0", span.status === "error" ? "text-destructive" : "text-muted-foreground")} aria-hidden />
                      <span className={cn("truncate font-mono text-[12px]", span.status === "error" ? "text-destructive" : "text-foreground")}>{span.name}</span>
                      <span className="sr-only">
                        {t.kinds[span.kind]}, {formatDuration(span.durationMs, locale)}
                        {span.status === "error" ? `, ${t.error}` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="relative h-5 flex-1">
                      <span
                        className={cn("absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full", span.status === "error" ? "bg-destructive" : KIND[span.kind].bar, span.status === "running" && "animate-pulse")}
                        style={{ left: `${(span.startMs / total) * 100}%`, width: `max(4px, ${(span.durationMs / total) * 100}%)` }}
                      />
                    </span>
                    <span aria-hidden className="w-14 shrink-0 text-right font-mono text-[11px] text-fg-secondary tabular-nums">
                      {formatDuration(span.durationMs, locale)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-live="polite" aria-label={current ? current.name : t.steps} className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4">
          {current ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t.kinds[current.kind]}</span>
                <h3 className="m-0 font-mono text-[14px] font-semibold break-all text-foreground">{current.name}</h3>
              </div>
              <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                <div>
                  <dt className="text-muted-foreground">{t.duration}</dt>
                  <dd className="m-0 font-mono text-foreground">{formatDuration(current.durationMs, locale)}</dd>
                </div>
                {current.model && (
                  <div>
                    <dt className="text-muted-foreground">{t.model}</dt>
                    <dd className="m-0 font-mono text-foreground">{current.model}</dd>
                  </div>
                )}
                {current.tokens && (
                  <div>
                    <dt className="text-muted-foreground">{t.tokens}</dt>
                    <dd className="m-0 font-mono text-foreground">{t.tokensInOut(formatNumber(current.tokens.input), formatNumber(current.tokens.output))}</dd>
                  </div>
                )}
                {current.cost !== undefined && (
                  <div>
                    <dt className="text-muted-foreground">{t.cost}</dt>
                    <dd className="m-0 font-mono text-foreground">{formatCost(current.cost, locale)}</dd>
                  </div>
                )}
              </dl>
              {current.error && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-destructive uppercase">{t.error}</h4>
                  <p className="m-0 rounded-md bg-destructive-subtle px-3 py-2 text-[13px] text-foreground">{current.error}</p>
                </div>
              )}
              {current.input !== undefined && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t.input}</h4>
                  <Json value={current.input} />
                </div>
              )}
              {current.output !== undefined && (
                <div className="flex flex-col gap-1.5">
                  <h4 className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t.output}</h4>
                  <Json value={current.output} />
                </div>
              )}
            </>
          ) : (
            <p className="m-0 text-[13px] text-muted-foreground">{t.selectStep}</p>
          )}
        </section>
      </div>
    </div>
  )
}

export { RunList, RunStatusBadge, RunTrace, type RunStatus, type RunSummary, type SpanKind, type TraceSpan }
