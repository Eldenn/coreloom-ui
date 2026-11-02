'use client'

// Coreloom UI — StatusPage (status block). A public status page: the overall state, each
// component's state and its uptime over the last 90 days, ongoing incidents with their updates,
// and past incidents. UptimeBar and IncidentTimeline also work on their own (an admin incident page,
// a service card). Everything is data you pass in; Subscribe is a callback.
import { BellIcon, ChevronDownIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { StatusDot, StatusIndicator, type StatusTone } from '@/components/ui/status-indicator'
import { Timeline, TimelineItem, type TimelineTone } from '@/components/ui/timeline'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type ComponentStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'
type IncidentImpact = 'none' | 'minor' | 'major' | 'critical' | 'maintenance'
type IncidentStage =
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved'
  | 'scheduled'
  | 'inProgress'
  | 'verifying'
  | 'completed'

interface UptimeDay {
  date: Date
  /** 0 to 100. Leave it out for a day without data. */
  uptime?: number
  /** Overrides the status read from `uptime` (a maintenance day, for instance). */
  status?: ComponentStatus
  /** Titles of the incidents that day. */
  incidents?: string[]
}

interface StatusComponent {
  id: string
  name: string
  description?: string
  status: ComponentStatus
  /** Components with the same group are listed under it. */
  group?: string
  /** One entry per day, oldest first; the last one is today. */
  days?: UptimeDay[]
  /** Uptime over the period, 0 to 100. The average of `days` when left out. */
  uptime?: number
}

interface IncidentUpdate {
  stage: IncidentStage
  message: React.ReactNode
  at: Date
}

interface Incident {
  id: string
  title: string
  impact: IncidentImpact
  /** Newest first or not: they are sorted by date. */
  updates: IncidentUpdate[]
  /** Names of the affected components. */
  components?: string[]
}

const statusTone: Record<ComponentStatus, StatusTone> = {
  operational: 'success',
  degraded: 'warning',
  partial: 'warning',
  major: 'danger',
  maintenance: 'info',
}
const dayColor: Record<ComponentStatus, string> = {
  operational: 'bg-success',
  degraded: 'bg-warning/70',
  partial: 'bg-warning',
  major: 'bg-destructive',
  maintenance: 'bg-info',
}
const impactVariant: Record<IncidentImpact, 'secondary' | 'warning' | 'destructive' | 'default'> = {
  none: 'secondary',
  minor: 'warning',
  major: 'destructive',
  critical: 'destructive',
  maintenance: 'default',
}
const stageTone: Record<IncidentStage, TimelineTone> = {
  investigating: 'danger',
  identified: 'warning',
  monitoring: 'info',
  resolved: 'success',
  scheduled: 'neutral',
  inProgress: 'info',
  verifying: 'info',
  completed: 'success',
}
/** Worst first: the page's overall state is the first one any component is in. */
const severity: ComponentStatus[] = ['major', 'partial', 'degraded', 'maintenance', 'operational']

/** The status a day's uptime stands for. */
function dayStatus(day: UptimeDay): ComponentStatus | undefined {
  if (day.status) return day.status
  if (day.uptime === undefined) return undefined
  if (day.uptime >= 99.9) return 'operational'
  if (day.uptime >= 99) return 'degraded'
  if (day.uptime >= 95) return 'partial'
  return 'major'
}

/** The worst status among the components ("operational" when there are none). */
function overallStatus(components: readonly Pick<StatusComponent, 'status'>[]): ComponentStatus {
  return severity.find((s) => components.some((c) => c.status === s)) ?? 'operational'
}

/** Average uptime of the days that have data; undefined when none has. */
function averageUptime(days: readonly UptimeDay[]) {
  const known = days.flatMap((d) => (d.uptime === undefined ? [] : [d.uptime]))
  return known.length ? known.reduce((a, b) => a + b, 0) / known.length : undefined
}

/** True once the latest update says it's over. */
function isResolved(incident: Pick<Incident, 'updates'>) {
  const latest = sortUpdates(incident.updates).at(0)
  return latest?.stage === 'resolved' || latest?.stage === 'completed'
}

function sortUpdates(updates: readonly IncidentUpdate[]) {
  return [...updates].sort((a, b) => b.at.getTime() - a.at.getTime())
}

/** "2 h 15 min", "45 min", "3 d 4 h" in the reader's language. */
function formatIncidentDuration(ms: number, locale: string) {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  const unit = (value: number, u: 'day' | 'hour' | 'minute') =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'short' }).format(value)
  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60
  if (d) return [unit(d, 'day'), h ? unit(h, 'hour') : ''].filter(Boolean).join(' ')
  if (h) return [unit(h, 'hour'), m ? unit(m, 'minute') : ''].filter(Boolean).join(' ')
  return unit(m, 'minute')
}

const usePercent = () => {
  const { locale } = useCoreloomI18n()
  return React.useMemo(() => {
    const nf = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    // 99.998% must not read as 100%: a status page rounds down.
    return (value: number) => nf.format(Math.floor(value * 100) / 10_000)
  }, [locale])
}

function UptimeBar({
  days,
  name,
  uptime,
  className,
}: {
  /** Oldest first; the last one is today. */
  days: UptimeDay[]
  /** What the bar is for, in its accessible name. */
  name: string
  /** Uptime over the period; the average of the days by default. */
  uptime?: number
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.statusPage
  const percent = usePercent()
  const [active, setActive] = React.useState<number | null>(null)
  const total = uptime ?? averageUptime(days)
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  // Phones show the last 30 days: 90 bars would be a pixel wide each.
  const phoneDays = Math.min(30, days.length)

  const describe = (day: UptimeDay) => {
    const date = dateFormat.format(day.date)
    const base = day.uptime === undefined ? t.dayNoData(date) : t.day(date, percent(day.uptime))
    const incidents = day.incidents ?? []
    return incidents.length
      ? `${base}. ${t.dayIncidents(incidents.length)}: ${incidents.join(', ')}`
      : base
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = days.length - 1
    const current = active ?? last
    const next =
      e.key === 'ArrowLeft'
        ? Math.max(0, current - 1)
        : e.key === 'ArrowRight'
          ? Math.min(last, current + 1)
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
  }

  const activeDay = active === null ? undefined : days[active]
  return (
    <div data-slot="uptime-bar" className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div
        // A slider over the days: arrows move from day to day, and each day is read out as the value.
        role="slider"
        tabIndex={0}
        aria-label={t.uptimeOver(
          name,
          total === undefined ? t.noData : percent(total),
          days.length,
        )}
        aria-valuemin={1}
        aria-valuemax={days.length}
        aria-valuenow={(active ?? days.length - 1) + 1}
        aria-valuetext={
          days.length ? describe(days[active ?? days.length - 1] ?? days[0]) : undefined
        }
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onFocus={() => {
          setActive((a) => a ?? days.length - 1)
        }}
        onBlur={() => {
          setActive(null)
        }}
        onPointerLeave={() => {
          setActive(null)
        }}
        className="flex h-8 items-stretch gap-[2px] rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {days.map((day, i) => {
          const status = dayStatus(day)
          return (
            <span
              key={day.date.toISOString()}
              data-status={status ?? 'none'}
              onPointerEnter={() => {
                setActive(i)
              }}
              className={cn(
                'min-w-0 flex-1 rounded-[2px] transition-opacity',
                status ? dayColor[status] : 'bg-border',
                active !== null && active !== i && 'opacity-60',
                active === i && 'ring-2 ring-foreground/70',
                i < days.length - phoneDays && 'max-sm:hidden',
              )}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
        {activeDay ? (
          <span className="truncate text-foreground">{describe(activeDay)}</span>
        ) : (
          <>
            <span>
              <span className="max-sm:hidden">{t.daysAgo(days.length)}</span>
              <span className="sm:hidden">{t.daysAgo(phoneDays)}</span>
            </span>
            <span className="truncate">
              {total === undefined ? t.noData : t.uptime(percent(total))}
            </span>
            <span>{t.today}</span>
          </>
        )}
      </div>
    </div>
  )
}

function IncidentTimeline({ incident, className }: { incident: Incident; className?: string }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.statusPage
  const time = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <Timeline aria-label={t.updatesOf(incident.title)} className={className}>
      {sortUpdates(incident.updates).map((u) => (
        <TimelineItem
          key={`${u.stage}-${u.at.getTime()}`}
          tone={stageTone[u.stage]}
          title={<span className="font-medium">{t.stage[u.stage]}</span>}
          time={<time dateTime={u.at.toISOString()}>{time.format(u.at)}</time>}
          description={u.message}
        />
      ))}
    </Timeline>
  )
}

function IncidentHeader({ incident }: { incident: Incident }) {
  const { messages } = useCoreloomI18n()
  const t = messages.statusPage
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14.5px] font-semibold text-foreground">{incident.title}</span>
        <Badge variant={impactVariant[incident.impact]}>{t.impact[incident.impact]}</Badge>
      </div>
      {!!incident.components?.length && (
        <span className="text-[12.5px] text-muted-foreground">
          {t.affects(incident.components.join(', '))}
        </span>
      )}
    </div>
  )
}

function PastIncident({ incident }: { incident: Incident }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.statusPage
  const updates = sortUpdates(incident.updates)
  const first = updates.at(-1)
  const last = updates.at(0)
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <Collapsible asChild>
      <li className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <IncidentHeader incident={incident} />
          {first && last && (
            <span className="font-mono text-[11.5px] text-muted-foreground">
              <time dateTime={first.at.toISOString()}>{date.format(first.at)}</time>
              {' · '}
              {t.resolvedIn(formatIncidentDuration(last.at.getTime() - first.at.getTime(), locale))}
            </span>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="group/trigger -ml-2 w-fit text-muted-foreground"
          >
            <ChevronDownIcon className="transition-transform group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none" />
            {t.showUpdates(updates.length)}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <IncidentTimeline incident={incident} className="pt-1" />
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

function StatusPage({
  components,
  incidents = [],
  title,
  updatedAt,
  onSubscribe,
  className,
}: {
  components: StatusComponent[]
  /** Ongoing ones (latest update not resolved/completed) go on top, the rest under Past incidents. */
  incidents?: Incident[]
  title?: React.ReactNode
  /** When the data was last checked, shown under the overall state. */
  updatedAt?: Date
  /** Shows "Subscribe to updates". */
  onSubscribe?: () => void
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.statusPage
  const percent = usePercent()
  const overall = overallStatus(components)
  const ongoing = incidents.filter((i) => !isResolved(i))
  const past = incidents
    .filter((i) => isResolved(i))
    .sort(
      (a, b) =>
        (sortUpdates(b.updates).at(0)?.at.getTime() ?? 0) -
        (sortUpdates(a.updates).at(0)?.at.getTime() ?? 0),
    )
  const componentsId = React.useId()
  const ongoingId = React.useId()
  const pastId = React.useId()
  const updated = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const groups = new Map<string | undefined, StatusComponent[]>()
  for (const c of components) groups.set(c.group, [...(groups.get(c.group) ?? []), c])

  const sectionLabel =
    'm-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'

  return (
    <div data-slot="status-page" className={cn('flex min-w-0 flex-col gap-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 font-display text-[22px] font-semibold text-foreground">
          {title ?? t.title}
        </p>
        {onSubscribe && (
          <Button variant="outline" size="sm" onClick={onSubscribe}>
            <BellIcon />
            {t.subscribe}
          </Button>
        )}
      </div>

      <div
        data-slot="status-overall"
        data-status={overall}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-5 py-4',
          overall === 'operational' && 'border-success/30 bg-success-subtle',
          (overall === 'degraded' || overall === 'partial') &&
            'border-warning/30 bg-warning-subtle',
          overall === 'major' && 'border-destructive/30 bg-destructive-subtle',
          overall === 'maintenance' && 'border-info/30 bg-info-subtle',
        )}
      >
        <StatusDot
          tone={statusTone[overall]}
          pulse={overall !== 'operational'}
          className="size-3 [&>span]:size-3"
        />
        <div className="flex min-w-0 flex-col">
          <span className="text-[15px] font-semibold text-foreground">{t.overall[overall]}</span>
          {updatedAt && (
            <span className="text-[12.5px] text-fg-secondary">
              {t.updated(updated.format(updatedAt))}
            </span>
          )}
        </div>
      </div>

      {ongoing.length > 0 && (
        <section aria-labelledby={ongoingId} className="flex flex-col gap-3">
          <p id={ongoingId} className={sectionLabel}>
            {t.ongoing}
          </p>
          {ongoing.map((incident) => (
            <article
              key={incident.id}
              data-slot="incident"
              aria-label={incident.title}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4"
            >
              <IncidentHeader incident={incident} />
              <IncidentTimeline incident={incident} />
            </article>
          ))}
        </section>
      )}

      <section aria-labelledby={componentsId} className="flex flex-col gap-3">
        <p id={componentsId} className={sectionLabel}>
          {t.components}
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {[...groups].map(([group, list]) => (
            <div key={group ?? ''} className="border-b border-border last:border-b-0">
              {group !== undefined && (
                <p className="m-0 border-b border-border-subtle bg-surface px-5 py-2 text-[12.5px] font-semibold text-fg-secondary">
                  {group}
                </p>
              )}
              <ul className="m-0 list-none p-0">
                {list.map((c) => (
                  <li
                    key={c.id}
                    data-slot="status-component"
                    className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[14px] font-medium text-foreground">{c.name}</span>
                        {c.description && (
                          <span className="text-[12.5px] text-muted-foreground">
                            {c.description}
                          </span>
                        )}
                      </span>
                      <StatusIndicator tone={statusTone[c.status]}>
                        {t.status[c.status]}
                      </StatusIndicator>
                    </div>
                    {c.days && c.days.length > 0 && (
                      <UptimeBar days={c.days} name={c.name} uptime={c.uptime} />
                    )}
                    {!c.days?.length && c.uptime !== undefined && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {t.uptime(percent(c.uptime))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby={pastId} className="flex flex-col gap-3">
        <p id={pastId} className={sectionLabel}>
          {t.past}
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {past.length ? (
            <ul className="m-0 list-none p-0">
              {past.map((incident) => (
                <PastIncident key={incident.id} incident={incident} />
              ))}
            </ul>
          ) : (
            <p className="m-0 px-5 py-6 text-center text-[13px] text-muted-foreground">
              {t.noPast}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export {
  averageUptime,
  type ComponentStatus,
  dayStatus,
  formatIncidentDuration,
  type Incident,
  type IncidentImpact,
  type IncidentStage,
  IncidentTimeline,
  type IncidentUpdate,
  isResolved,
  overallStatus,
  type StatusComponent,
  StatusPage,
  UptimeBar,
  type UptimeDay,
}
