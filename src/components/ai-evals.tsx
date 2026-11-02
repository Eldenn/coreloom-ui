'use client'

// Coreloom UI — AI evaluations (block). EvalSuiteList: your test suites with their last pass rate,
// trend and a Run button. EvalRunReport: one run case by case — score, the judge's verdict and its
// reasoning, per-metric scores — and, given a baseline run, the two side by side with the
// regressions and improvements called out. It complements `ai-runs` (one agent run's trace): an
// eval run is many cases scored against what was expected. Feed it your eval tool's results
// (promptfoo, Braintrust, LangSmith, OpenAI evals, your own scripts) mapped to `EvalRun`.
import { PlayIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import * as React from 'react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { RelativeTime } from '@/components/ui/relative-time'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Sparkline } from '@/components/ui/sparkline'
import { Spinner } from '@/components/ui/spinner'
import { formatCost, formatDuration } from '@/lib/ai'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

type EvalVerdict = 'pass' | 'partial' | 'fail' | 'error'

/** What an LLM judge (or a person) said about one answer. */
interface EvalJudgement {
  verdict: EvalVerdict
  /** Why, in the judge's words. */
  reasoning?: string
  /** Who judged: a model id, a rubric name, a person. */
  judge?: string
}

/** One test case's result in one run. `id` is the case's id, the same in every run. */
interface EvalCaseResult {
  id: string
  /** A short name for the case ("Refund after 30 days"). */
  name: string
  input: string
  /** The reference answer, when the case has one. */
  expected?: string
  output: string
  /** Overall score, 0 to 1. */
  score: number
  passed: boolean
  /** Scores per metric, 0 to 1: `{ faithfulness: 0.9, relevance: 1 }`. */
  scores?: Record<string, number>
  judge?: EvalJudgement
  latencyMs?: number
  cost?: number
  /** The case couldn't be scored: a timeout, a refused call, a crash in the grader. */
  error?: string
  tags?: string[]
}

interface EvalRun {
  id: string
  /** What the run tried: "gpt-5 · prompt v12", "main @ 3f2a9c1". */
  label: string
  model?: string
  startedAt?: Date | string
  cases: EvalCaseResult[]
}

interface EvalSuite {
  id: string
  name: string
  description?: string
  /** How many cases the suite has. */
  caseCount: number
  /** The pass rate (0 to 1) a run needs to pass. */
  threshold?: number
  lastRun?: { passRate: number; score?: number; at: Date | string }
  /** Pass rates of the last runs, oldest first, for the trend. */
  history?: number[]
}

type EvalChange = 'regressed' | 'improved' | 'unchanged' | 'added' | 'removed'

interface EvalComparisonRow {
  id: string
  name: string
  baseline?: EvalCaseResult
  candidate?: EvalCaseResult
  change: EvalChange
  /** candidate.score − baseline.score, when the case is in both runs. */
  delta?: number
}

interface EvalSummary {
  total: number
  passed: number
  failed: number
  errored: number
  /** passed / total, 0 when there are no cases. */
  passRate: number
  meanScore: number
  cost?: number
  /** The median latency, when the cases report one. */
  latencyMs?: number
}

/** Totals for one run: counts, pass rate, mean score, cost and median latency. */
function summarizeEvalRun(run: Pick<EvalRun, 'cases'>): EvalSummary {
  const cases = run.cases
  const total = cases.length
  const errored = cases.filter((c) => c.error !== undefined).length
  const passed = cases.filter((c) => c.passed && c.error === undefined).length
  const scores = cases.map((c) => (Number.isFinite(c.score) ? c.score : 0))
  const costs = cases.flatMap((c) => (c.cost !== undefined ? [c.cost] : []))
  const latencies = cases
    .flatMap((c) => (c.latencyMs !== undefined ? [c.latencyMs] : []))
    .sort((a, b) => a - b)
  const mid = Math.floor(latencies.length / 2)
  return {
    total,
    passed,
    failed: total - passed - errored,
    errored,
    passRate: total ? passed / total : 0,
    meanScore: total ? scores.reduce((a, b) => a + b, 0) / total : 0,
    cost: costs.length ? costs.reduce((a, b) => a + b, 0) : undefined,
    latencyMs: latencies.length
      ? latencies.length % 2
        ? latencies[mid]
        : ((latencies[mid - 1] ?? 0) + (latencies[mid] ?? 0)) / 2
      : undefined,
  }
}

/**
 * Case by case, what changed from `baseline` to `candidate`. A case regressed when it passed and
 * now fails, or its score dropped by more than `tolerance` (default 0.05); it improved the other
 * way round. Rows follow the candidate's order, then the cases only the baseline has.
 */
function compareEvalRuns(
  baseline: Pick<EvalRun, 'cases'>,
  candidate: Pick<EvalRun, 'cases'>,
  { tolerance = 0.05 }: { tolerance?: number } = {},
): EvalComparisonRow[] {
  const before = new Map(baseline.cases.map((c) => [c.id, c]))
  const seen = new Set<string>()
  const ok = (c: EvalCaseResult) => c.passed && c.error === undefined
  const rows: EvalComparisonRow[] = []
  for (const c of candidate.cases) {
    seen.add(c.id)
    const b = before.get(c.id)
    if (!b) {
      rows.push({ id: c.id, name: c.name, candidate: c, change: 'added' })
      continue
    }
    const delta = c.score - b.score
    const change: EvalChange =
      ok(b) && !ok(c)
        ? 'regressed'
        : !ok(b) && ok(c)
          ? 'improved'
          : delta < -tolerance
            ? 'regressed'
            : delta > tolerance
              ? 'improved'
              : 'unchanged'
    rows.push({ id: c.id, name: c.name, baseline: b, candidate: c, change, delta })
  }
  for (const b of baseline.cases)
    if (!seen.has(b.id)) rows.push({ id: b.id, name: b.name, baseline: b, change: 'removed' })
  return rows
}

const VERDICT_VARIANT = {
  pass: 'success',
  partial: 'warning',
  fail: 'destructive',
  error: 'destructive',
} as const

/** The verdict as a badge with its word. */
function EvalVerdictBadge({ verdict }: { verdict: EvalVerdict }) {
  const t = useCoreloomI18n().messages.ai.evals
  return (
    <Badge variant={VERDICT_VARIANT[verdict]}>
      <BadgeDot />
      {t.verdicts[verdict]}
    </Badge>
  )
}

function verdictOf(c: EvalCaseResult): EvalVerdict {
  if (c.error !== undefined) return 'error'
  return c.judge?.verdict ?? (c.passed ? 'pass' : 'fail')
}

const CHANGE_VARIANT = {
  regressed: 'destructive',
  improved: 'success',
  unchanged: 'secondary',
  added: 'outline',
  removed: 'outline',
} as const

function usePercent() {
  const { locale } = useCoreloomI18n()
  return React.useMemo(() => {
    const nf = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
    const pts = new Intl.NumberFormat(locale, {
      signDisplay: 'exceptZero',
      maximumFractionDigits: 0,
    })
    return { percent: (n: number) => nf.format(n), points: (n: number) => pts.format(n * 100) }
  }, [locale])
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** "+4 pts" in success, "−6 pts" in destructive, with an arrow and the word for screen readers. */
function Delta({ value }: { value: number }) {
  const t = useCoreloomI18n().messages.ai.evals
  const { points } = usePercent()
  if (Math.abs(value) < 0.005)
    return <span className="text-[12px] text-muted-foreground">{t.noChange}</span>
  const up = value > 0
  const Icon = up ? TrendingUpIcon : TrendingDownIcon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[12px] tabular-nums',
        up ? 'text-success' : 'text-destructive',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {t.points(points(value))}
    </span>
  )
}

/** Your eval suites: last pass rate against the threshold, the trend, and Run. */
function EvalSuiteList({
  suites,
  href,
  onRun,
  running = [],
  className,
}: {
  suites: EvalSuite[]
  /** Links each suite's name to its page (its runs). */
  href?: (id: string) => string
  /** Adds a Run button to each suite. */
  onRun?: (id: string) => void
  /** Suites with a run in progress: their button is busy. */
  running?: readonly string[]
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.evals
  const { percent } = usePercent()
  if (suites.length === 0)
    return (
      <Empty className={cn('border border-dashed border-border', className)}>
        <EmptyHeader>
          <EmptyTitle>{t.noSuites}</EmptyTitle>
          <EmptyDescription>{t.noSuitesHint}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  return (
    <ul
      data-slot="eval-suite-list"
      aria-label={t.suites}
      className={cn('m-0 flex list-none flex-col gap-2 p-0', className)}
    >
      {suites.map((s) => {
        const busy = running.includes(s.id)
        const below =
          s.lastRun !== undefined && s.threshold !== undefined && s.lastRun.passRate < s.threshold
        return (
          <li
            key={s.id}
            className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
              {href ? (
                <AppLink
                  href={href(s.id)}
                  className="truncate text-[14px] font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {s.name}
                </AppLink>
              ) : (
                <span className="truncate text-[14px] font-medium text-foreground">{s.name}</span>
              )}
              <span className="truncate text-[12.5px] text-muted-foreground">
                {t.caseCount(s.caseCount)}
                {s.description ? ` · ${s.description}` : ''}
              </span>
            </div>
            {s.history && s.history.length > 1 && (
              <Sparkline
                data={s.history}
                min={0}
                max={1}
                width={96}
                height={28}
                color={below ? 'var(--warning)' : 'var(--chart-1)'}
                formatValue={percent}
                aria-label={t.trend}
                className="shrink-0"
              />
            )}
            <div className="flex w-28 shrink-0 flex-col gap-0.5">
              <Label>{t.passRate}</Label>
              {s.lastRun ? (
                <span className="flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      'font-mono text-[15px] font-medium tabular-nums',
                      below ? 'text-warning' : 'text-foreground',
                    )}
                  >
                    {percent(s.lastRun.passRate)}
                  </span>
                  {s.threshold !== undefined && (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {t.threshold(percent(s.threshold))}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[13px] text-muted-foreground">{t.neverRun}</span>
              )}
              {below && <span className="sr-only">{t.belowThreshold}</span>}
            </div>
            <div className="w-28 shrink-0 text-[12.5px] text-muted-foreground">
              {s.lastRun ? <RelativeTime date={s.lastRun.at} /> : '—'}
            </div>
            {onRun && (
              <Button
                variant="outline"
                size="sm"
                aria-busy={busy || undefined}
                disabled={busy}
                aria-label={t.runSuite(s.name)}
                onClick={() => {
                  onRun(s.id)
                }}
                className="shrink-0"
              >
                {busy ? <Spinner aria-hidden /> : <PlayIcon aria-hidden />}
                {busy ? t.running : t.run}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

type EvalFilter = 'all' | 'failed' | 'regressed' | 'improved'

function Stat({
  label,
  value,
  extra,
}: {
  label: string
  value: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Label>{label}</Label>
      <span className="text-[17px] font-medium text-foreground tabular-nums">{value}</span>
      {extra}
    </div>
  )
}

function Block({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Text({ children, tone }: { children: string; tone?: 'error' }) {
  return (
    <p
      className={cn(
        'm-0 max-h-60 overflow-auto rounded-md px-3 py-2 text-[13px] leading-[1.55] whitespace-pre-wrap text-foreground',
        tone === 'error' ? 'bg-destructive-subtle' : 'bg-inset',
      )}
    >
      {children}
    </p>
  )
}

/**
 * One eval run case by case. With `baseline`, the two runs side by side: deltas in the totals,
 * regressions and improvements, and each case's outputs compared.
 */
function EvalRunReport({
  run,
  baseline,
  tolerance,
  defaultFilter,
  defaultSelectedId,
  onRerunCase,
  className,
}: {
  run: EvalRun
  /** An earlier run (main, the previous prompt) to compare against. */
  baseline?: EvalRun
  /** Score change that counts as a regression or improvement (default 0.05). */
  tolerance?: number
  defaultFilter?: EvalFilter
  defaultSelectedId?: string
  /** Adds a Run again button to the selected case. */
  onRerunCase?: (caseId: string) => void
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.ai.evals
  const { percent } = usePercent()
  const baseId = React.useId()
  const summary = React.useMemo(() => summarizeEvalRun(run), [run])
  const before = React.useMemo(() => (baseline ? summarizeEvalRun(baseline) : null), [baseline])
  const rows = React.useMemo<EvalComparisonRow[]>(
    () =>
      baseline
        ? compareEvalRuns(baseline, run, { tolerance })
        : run.cases.map((c) => ({ id: c.id, name: c.name, candidate: c, change: 'unchanged' })),
    [baseline, run, tolerance],
  )
  const regressions = rows.filter((r) => r.change === 'regressed').length
  const improvements = rows.filter((r) => r.change === 'improved').length

  const [filter, setFilter] = React.useState<EvalFilter>(
    defaultFilter ?? (baseline && regressions ? 'regressed' : 'all'),
  )
  const shown = rows.filter((r) =>
    filter === 'all'
      ? true
      : filter === 'failed'
        ? r.candidate !== undefined && verdictOf(r.candidate) !== 'pass'
        : r.change === filter,
  )
  const [selected, setSelected] = React.useState(
    defaultSelectedId ??
      shown.at(0)?.id ??
      rows.find((r) => r.candidate && !r.candidate.passed)?.id ??
      rows.at(0)?.id,
  )
  const current = rows.find((r) => r.id === selected)

  const filters = [
    { value: 'all', label: t.filters.all(rows.length) },
    {
      value: 'failed',
      label: t.filters.failed(
        rows.filter((r) => r.candidate && verdictOf(r.candidate) !== 'pass').length,
      ),
    },
    ...(baseline
      ? [
          { value: 'regressed', label: t.filters.regressed(regressions) },
          { value: 'improved', label: t.filters.improved(improvements) },
        ]
      : []),
  ]

  if (run.cases.length === 0)
    return (
      <Empty className={cn('border border-dashed border-border', className)}>
        <EmptyHeader>
          <EmptyTitle>{t.noCases}</EmptyTitle>
          <EmptyDescription>{t.noCasesHint}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <div data-slot="eval-run-report" className={cn('flex min-w-0 flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px]">
          {baseline && (
            <>
              <span className="font-mono text-muted-foreground">{baseline.label}</span>
              <span className="text-muted-foreground">{t.versus}</span>
            </>
          )}
          <span className="font-mono font-medium text-foreground">{run.label}</span>
          {run.startedAt !== undefined && (
            <span className="text-muted-foreground">
              · <RelativeTime date={run.startedAt} />
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            label={t.passRate}
            value={percent(summary.passRate)}
            extra={before ? <Delta value={summary.passRate - before.passRate} /> : undefined}
          />
          <Stat
            label={t.meanScore}
            value={percent(summary.meanScore)}
            extra={before ? <Delta value={summary.meanScore - before.meanScore} /> : undefined}
          />
          {baseline ? (
            <>
              <Stat
                label={t.regressions}
                value={
                  <span className={regressions ? 'text-destructive' : undefined}>
                    {regressions}
                  </span>
                }
              />
              <Stat
                label={t.improvements}
                value={
                  <span className={improvements ? 'text-success' : undefined}>{improvements}</span>
                }
              />
            </>
          ) : (
            <>
              <Stat label={t.results} value={t.passedOf(summary.passed, summary.total)} />
              <Stat
                label={summary.cost !== undefined ? t.cost : t.latency}
                value={
                  summary.cost !== undefined
                    ? formatCost(summary.cost, locale)
                    : summary.latencyMs !== undefined
                      ? formatDuration(summary.latencyMs, locale)
                      : '—'
                }
              />
            </>
          )}
        </div>
      </div>

      <SegmentedControl
        size="sm"
        aria-label={t.filterCases}
        options={filters}
        value={filter}
        onValueChange={(v) => {
          setFilter(v as EvalFilter)
        }}
        className="max-w-full overflow-x-auto"
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <section
          aria-labelledby={`${baseId}-cases`}
          className="flex min-w-0 flex-col self-start rounded-lg border border-border bg-card"
        >
          <p
            id={`${baseId}-cases`}
            className="m-0 border-b border-border-subtle px-4 py-2.5 text-[13.5px] font-semibold text-foreground"
          >
            {t.cases}
          </p>
          {shown.length === 0 ? (
            <p className="m-0 px-4 py-6 text-[13px] text-muted-foreground">{t.noMatch}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-2">
              {shown.map((r) => {
                const c = r.candidate ?? r.baseline
                if (!c) return null
                const active = r.id === selected
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSelected(r.id)
                      }}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                        // No tint behind a selected case: the badges' own tints need the card behind them.
                        active
                          ? 'shadow-[inset_3px_0_0_var(--color-primary)] ring-1 ring-border-strong ring-inset'
                          : 'hover:bg-accent/60',
                      )}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[13px] text-foreground">{r.name}</span>
                        {baseline && r.change !== 'unchanged' && (
                          <span>
                            <Badge variant={CHANGE_VARIANT[r.change]} className="text-[11px]">
                              {t.changes[r.change]}
                            </Badge>
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 font-mono text-[12px] text-fg-secondary tabular-nums">
                        {r.baseline && r.candidate && (
                          <>
                            <span className="text-muted-foreground">
                              {percent(r.baseline.score)}
                            </span>
                            <span aria-hidden className="text-muted-foreground">
                              →
                            </span>
                            <span className="sr-only">{t.to}</span>
                          </>
                        )}
                        <span>{percent(c.score)}</span>
                      </span>
                      {r.candidate ? (
                        <EvalVerdictBadge verdict={verdictOf(r.candidate)} />
                      ) : (
                        <Badge variant="outline">{t.changes.removed}</Badge>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section
          aria-label={current ? current.name : t.cases}
          className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4"
        >
          {current ? (
            <CaseDetail
              row={current}
              run={run}
              baseline={baseline}
              onRerun={onRerunCase}
              percent={percent}
            />
          ) : (
            <p className="m-0 text-[13px] text-muted-foreground">{t.selectCase}</p>
          )}
        </section>
      </div>
    </div>
  )
}

function CaseDetail({
  row,
  run,
  baseline,
  onRerun,
  percent,
}: {
  row: EvalComparisonRow
  run: EvalRun
  baseline?: EvalRun
  onRerun?: (id: string) => void
  percent: (n: number) => string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.ai.evals
  const c = row.candidate ?? row.baseline
  if (!c) return null
  const metrics = Array.from(
    new Set([
      ...Object.keys(row.candidate?.scores ?? {}),
      ...Object.keys(row.baseline?.scores ?? {}),
    ]),
  )
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Label>{t.case}</Label>
          <p className="m-0 text-[14px] font-semibold break-words text-foreground">{row.name}</p>
          {c.tags && c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {onRerun && row.candidate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRerun(row.id)
            }}
          >
            <PlayIcon aria-hidden />
            {t.rerun}
          </Button>
        )}
      </div>

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">{t.score}</dt>
          <dd className="m-0 flex flex-wrap items-center gap-2 font-mono text-foreground">
            {percent(c.score)}
            {row.delta !== undefined && <Delta value={row.delta} />}
          </dd>
        </div>
        {c.latencyMs !== undefined && (
          <div>
            <dt className="text-muted-foreground">{t.caseLatency}</dt>
            <dd className="m-0 font-mono text-foreground">{formatDuration(c.latencyMs, locale)}</dd>
          </div>
        )}
        {c.cost !== undefined && (
          <div>
            <dt className="text-muted-foreground">{t.cost}</dt>
            <dd className="m-0 font-mono text-foreground">{formatCost(c.cost, locale)}</dd>
          </div>
        )}
      </dl>

      {row.candidate?.error !== undefined && (
        <Block label={<span className="text-destructive">{t.error}</span>}>
          <Text tone="error">{row.candidate.error}</Text>
        </Block>
      )}

      {(row.candidate?.judge ?? row.baseline?.judge) && (
        <Block label={t.judge}>
          <div className="flex flex-col gap-2 rounded-md border border-border-subtle p-3">
            {row.candidate?.judge && (
              <JudgeLine judgement={row.candidate.judge} label={baseline ? run.label : undefined} />
            )}
            {baseline && row.baseline?.judge && (
              <JudgeLine judgement={row.baseline.judge} label={baseline.label} muted />
            )}
          </div>
        </Block>
      )}

      {metrics.length > 0 && (
        <Block label={t.metrics}>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {metrics.map((m) => {
              const now = row.candidate?.scores?.[m]
              const then = row.baseline?.scores?.[m]
              const value = now ?? then ?? 0
              return (
                <li key={m} className="flex items-center gap-3 text-[12.5px]">
                  <span className="w-28 shrink-0 truncate text-fg-secondary">{m}</span>
                  <span aria-hidden className="relative h-1.5 flex-1 rounded-full bg-inset">
                    {baseline && then !== undefined && (
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-border-strong"
                        style={{ width: `${String(Math.max(0, Math.min(1, then)) * 100)}%` }}
                      />
                    )}
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
                      style={{ width: `${String(Math.max(0, Math.min(1, value)) * 100)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-mono text-foreground tabular-nums">
                    {percent(value)}
                  </span>
                  {baseline && now !== undefined && then !== undefined && (
                    <span className="w-20 shrink-0 text-right whitespace-nowrap">
                      <Delta value={now - then} />
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </Block>
      )}

      <Block label={t.input}>
        <Text>{c.input}</Text>
      </Block>
      {c.expected !== undefined && (
        <Block label={t.expected}>
          <Text>{c.expected}</Text>
        </Block>
      )}
      {baseline && row.baseline && row.candidate ? (
        <Block label={t.outputs}>
          {row.baseline.output === row.candidate.output ? (
            <>
              <span className="text-[12.5px] text-muted-foreground">{t.sameOutput}</span>
              <Text>{row.candidate.output}</Text>
            </>
          ) : (
            <DiffViewer
              before={row.baseline.output}
              after={row.candidate.output}
              view="split"
              wrap
              context={20}
              beforeLabel={baseline.label}
              afterLabel={run.label}
            />
          )}
        </Block>
      ) : (
        <Block label={t.output}>
          <Text>{c.output}</Text>
        </Block>
      )}
    </>
  )
}

function JudgeLine({
  judgement,
  label,
  muted,
}: {
  judgement: EvalJudgement
  label?: string
  muted?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', muted && 'border-t border-border-subtle pt-2')}>
      <div className="flex flex-wrap items-center gap-2">
        <EvalVerdictBadge verdict={judgement.verdict} />
        {label && <span className="font-mono text-[11.5px] text-muted-foreground">{label}</span>}
        {judgement.judge && (
          <span className="font-mono text-[11.5px] text-muted-foreground">· {judgement.judge}</span>
        )}
      </div>
      {judgement.reasoning && (
        <p
          className={cn(
            'm-0 text-[13px] leading-[1.55]',
            muted ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          {judgement.reasoning}
        </p>
      )}
    </div>
  )
}

export {
  compareEvalRuns,
  type EvalCaseResult,
  type EvalChange,
  type EvalComparisonRow,
  type EvalFilter,
  type EvalJudgement,
  type EvalRun,
  EvalRunReport,
  type EvalSuite,
  EvalSuiteList,
  type EvalSummary,
  type EvalVerdict,
  EvalVerdictBadge,
  summarizeEvalRun,
}
