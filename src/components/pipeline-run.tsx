'use client'

// Coreloom UI — PipelineRun. One run of a CI pipeline or a deploy, as GitHub Actions or GitLab show
// it: the run's status and duration, its jobs, each job's steps, and each step's log (with its ANSI
// colours, search and levels). The failed step opens by itself. Your app passes the run as data and
// updates it while it runs; Re-run and Cancel are callbacks.
//
//   <PipelineRun title="Deploy #482" status="running" jobs={jobs} meta="main · 3f9c2e1"
//     onCancel={() => api.cancel(run.id)} onRerun={() => api.rerun(run.id)} />
import {
  ChevronRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleMinusIcon,
  CircleSlashIcon,
  CircleXIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { type LogEntry, LogViewer } from '@/components/ui/log-viewer'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type PipelineStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped'

interface PipelineStep {
  id: string
  name: string
  status: PipelineStatus
  durationMs?: number
  /** The step's output: raw text (ANSI allowed) or entries. */
  log?: string | readonly LogEntry[]
}

interface PipelineJob {
  id: string
  name: string
  status: PipelineStatus
  durationMs?: number
  steps: readonly PipelineStep[]
}

/** 950 → "950ms", 72_000 → "1m 12s", 3_900_000 → "1h 5m", in the locale's narrow units. */
function formatRunDuration(ms: number, locale: string) {
  const unit = (value: number, name: 'millisecond' | 'second' | 'minute' | 'hour') =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: name, unitDisplay: 'narrow' }).format(
      value,
    )
  if (ms < 1000) return unit(Math.round(ms), 'millisecond')
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return unit(seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const rest = seconds % 60
    return rest ? `${unit(minutes, 'minute')} ${unit(rest, 'second')}` : unit(minutes, 'minute')
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${unit(hours, 'hour')} ${unit(rest, 'minute')}` : unit(hours, 'hour')
}

const statusTones: Record<PipelineStatus, string> = {
  queued: 'text-muted-foreground',
  running: 'text-primary-text',
  success: 'text-success',
  failed: 'text-destructive',
  cancelled: 'text-muted-foreground',
  skipped: 'text-muted-foreground',
}

/** The status as an icon, with its word for screen readers (and as a tooltip). */
function PipelineStatusIcon({ status, className }: { status: PipelineStatus; className?: string }) {
  const t = useCoreloomI18n().messages.pipelineRun
  const classes = cn('size-4 shrink-0', statusTones[status], className)
  const icon =
    status === 'running' ? (
      <Spinner aria-hidden className={classes} />
    ) : status === 'success' ? (
      <CircleCheckIcon aria-hidden className={classes} />
    ) : status === 'failed' ? (
      <CircleXIcon aria-hidden className={classes} />
    ) : status === 'cancelled' ? (
      <CircleSlashIcon aria-hidden className={classes} />
    ) : status === 'skipped' ? (
      <CircleMinusIcon aria-hidden className={classes} />
    ) : (
      <CircleDashedIcon aria-hidden className={classes} />
    )
  return (
    <span className="inline-flex shrink-0" title={t.status[status]}>
      {icon}
      <span className="sr-only">{t.status[status]}</span>
    </span>
  )
}

/** The step to open first: the failed one, else the running one. */
function firstOpenStep(job: PipelineJob | undefined) {
  return (
    job?.steps.find((s) => s.status === 'failed') ?? job?.steps.find((s) => s.status === 'running')
  )?.id
}

function StepRow({
  step,
  open,
  onOpenChange,
  logHeight,
  timeZone,
}: {
  step: PipelineStep
  open: boolean
  onOpenChange: (open: boolean) => void
  logHeight: number | string
  timeZone?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.pipelineRun
  const hasLog = typeof step.log === 'string' ? step.log.length > 0 : (step.log?.length ?? 0) > 0
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} asChild>
      <li className="border-b border-border-subtle last:border-b-0">
        <CollapsibleTrigger className="group/step flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring">
          <ChevronRightIcon
            aria-hidden
            className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/step:rotate-90 motion-reduce:transition-none"
          />
          <PipelineStatusIcon status={step.status} />
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              step.status === 'skipped' ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {step.name}
          </span>
          {step.durationMs !== undefined ? (
            <span className="shrink-0 font-mono text-[11.5px] text-muted-foreground tabular-nums">
              {formatRunDuration(step.durationMs, locale)}
            </span>
          ) : null}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          {hasLog ? (
            <LogViewer
              key={step.id}
              aria-label={t.log(step.name)}
              {...(typeof step.log === 'string' ? { text: step.log } : { entries: step.log })}
              height={logHeight}
              timeZone={timeZone}
              follow={step.status === 'running'}
            />
          ) : (
            <p className="rounded-md border border-border-subtle bg-inset px-3 py-2.5 text-[12.5px] text-muted-foreground">
              {step.status === 'queued' ? t.notStarted : t.noLog}
            </p>
          )}
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

function PipelineRun({
  title,
  status,
  jobs,
  meta,
  durationMs,
  onRerun,
  onCancel,
  onRerunJob,
  defaultJob,
  logHeight = 300,
  timeZone,
  actions,
  className,
}: {
  /** The run's name: "Deploy #482", "CI · fix: login redirect". */
  title: React.ReactNode
  status: PipelineStatus
  jobs: readonly PipelineJob[]
  /** A line under the title: branch, commit, who started it. */
  meta?: React.ReactNode
  durationMs?: number
  /** Shown when the run isn't running or queued. */
  onRerun?: () => void
  /** Shown while the run is running or queued. */
  onCancel?: () => void
  /** Re-runs one job (shown on finished jobs). */
  onRerunJob?: (job: PipelineJob) => void
  /** The job shown first; by default the first failed one, else the first running one. */
  defaultJob?: string
  /** Height of each step's log. */
  logHeight?: number | string
  /** Time zone of the log timestamps. */
  timeZone?: string
  /** More buttons in the header. */
  actions?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.pipelineRun
  const id = React.useId()
  const [jobId, setJobId] = React.useState(
    () =>
      defaultJob ??
      (
        jobs.find((j) => j.status === 'failed') ??
        jobs.find((j) => j.status === 'running') ??
        jobs.at(0)
      )?.id,
  )
  const job = jobs.find((j) => j.id === jobId) ?? jobs.at(0)
  // Open steps per job; a job not visited yet opens its failed (or running) step.
  const [openSteps, setOpenSteps] = React.useState<Record<string, readonly string[]>>({})
  const open = job ? (openSteps[job.id] ?? [firstOpenStep(job)].filter((s) => s !== undefined)) : []
  const active = status === 'running' || status === 'queued'
  const finishedJob = job && job.status !== 'running' && job.status !== 'queued'

  return (
    <section
      data-slot="pipeline-run"
      aria-labelledby={`${id}-title`}
      className={cn(
        '@container min-w-0 overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-border-subtle px-4 py-3">
        <PipelineStatusIcon status={status} className="mt-0.5 size-5" />
        <div className="min-w-0 flex-1">
          <p id={`${id}-title`} className="truncate text-[14px] font-semibold text-foreground">
            {title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted-foreground">
            <span className={statusTones[status]}>{t.status[status]}</span>
            {durationMs !== undefined ? (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">
                  <span className="sr-only">{`${t.duration} `}</span>
                  {formatRunDuration(durationMs, locale)}
                </span>
              </>
            ) : null}
            {meta ? (
              <>
                <span aria-hidden>·</span>
                <span className="min-w-0 truncate">{meta}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {actions}
          {active && onCancel ? (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              <SquareIcon />
              {t.cancel}
            </Button>
          ) : null}
          {!active && onRerun ? (
            <Button type="button" variant="outline" size="sm" onClick={onRerun}>
              <RotateCcwIcon />
              {t.rerun}
            </Button>
          ) : null}
        </div>
      </header>
      <div className="grid min-w-0 grid-cols-1 @2xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label={t.jobs}
          className="border-b border-border-subtle p-2 @2xl:border-r @2xl:border-b-0"
        >
          <ul className="flex gap-1 overflow-x-auto @2xl:flex-col @2xl:overflow-visible">
            {jobs.map((j) => {
              const current = j.id === job?.id
              return (
                <li key={j.id} className="shrink-0">
                  <button
                    type="button"
                    aria-current={current || undefined}
                    onClick={() => {
                      setJobId(j.id)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-fg-secondary outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring',
                      current && 'bg-accent text-foreground',
                    )}
                  >
                    <PipelineStatusIcon status={j.status} />
                    <span className="min-w-0 flex-1 truncate">{j.name}</span>
                    {j.durationMs !== undefined ? (
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatRunDuration(j.durationMs, locale)}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        {job ? (
          <div className="min-w-0">
            <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
              <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                {job.name}
              </p>
              {finishedJob && onRerunJob ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onRerunJob(job)
                  }}
                >
                  <RotateCcwIcon />
                  {t.rerunJob}
                </Button>
              ) : null}
            </div>
            <ul aria-label={t.steps}>
              {job.steps.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  logHeight={logHeight}
                  timeZone={timeZone}
                  open={open.includes(step.id)}
                  onOpenChange={(next) => {
                    setOpenSteps((all) => ({
                      ...all,
                      [job.id]: next ? [...open, step.id] : open.filter((s) => s !== step.id),
                    }))
                  }}
                />
              ))}
            </ul>
          </div>
        ) : (
          <p className="p-6 text-center text-[13px] text-muted-foreground">{t.noJobs}</p>
        )}
      </div>
    </section>
  )
}

export {
  formatRunDuration,
  type PipelineJob,
  PipelineRun,
  type PipelineStatus,
  PipelineStatusIcon,
  type PipelineStep,
}
