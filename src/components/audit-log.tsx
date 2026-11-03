'use client'

// Coreloom UI — AuditLog (settings block). Who did what, and when: one row per event, grouped by
// day, with the actor, the action, the target, the IP address and the event's details. People
// filter by text, actor and action; Export and Load more are callbacks, so the data can come from
// your API page by page.
import { BotIcon, ChevronDownIcon, DownloadIcon, SearchIcon, ServerIcon } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { JsonViewer } from '@/components/ui/json-viewer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { initials } from '@/lib/initials'
import { cn } from '@/lib/utils'

interface AuditActor {
  name: string
  email?: string
  avatar?: string
  /** A person, an API key or the platform itself. */
  type?: 'user' | 'api' | 'system'
}

interface AuditEvent {
  id: string
  actor: AuditActor
  /** A stable action key ("member.invited"); its label comes from `actions`. */
  action: string
  /** What it acted on ("ada@acme.dev", "Production"). */
  target?: string
  at: Date
  ip?: string
  location?: string
  /** Anything else, shown as JSON when the row is opened. */
  metadata?: unknown
}

interface AuditAction {
  value: string
  label: string
}

const ALL = '__all__'

/** The events that match a search text, an actor and an action (each optional). */
function filterAuditEvents(
  events: readonly AuditEvent[],
  {
    query = '',
    actor,
    action,
    actionLabel = (v: string) => v,
  }: { query?: string; actor?: string; action?: string; actionLabel?: (v: string) => string },
) {
  const q = query.trim().toLocaleLowerCase()
  return events.filter(
    (e) =>
      (!actor || e.actor.name === actor) &&
      (!action || e.action === action) &&
      (!q ||
        [e.actor.name, e.actor.email, e.action, actionLabel(e.action), e.target, e.ip]
          .filter(Boolean)
          .some((s) => s?.toLocaleLowerCase().includes(q))),
  )
}

function AuditRow({ event, actionLabel }: { event: AuditEvent; actionLabel: string }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.auditLog
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
  const Icon =
    event.actor.type === 'api' ? BotIcon : event.actor.type === 'system' ? ServerIcon : null
  const body = (
    <>
      <Avatar className="size-7">
        {event.actor.avatar && <AvatarImage src={event.actor.avatar} alt="" />}
        <AvatarFallback className="text-[11px] [&_svg]:size-3.5">
          {Icon ? <Icon aria-hidden /> : initials(event.actor.name)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13.5px] text-foreground">
          <span className="font-medium">{event.actor.name}</span> {actionLabel}
          {event.target && (
            <>
              {' '}
              <span className="font-medium break-words">{event.target}</span>
            </>
          )}
        </span>
        <span className="font-mono text-[11.5px] text-muted-foreground">
          {event.action}
          {event.ip && ` · ${event.ip}`}
          {event.location && ` · ${event.location}`}
        </span>
      </span>
      <time
        dateTime={event.at.toISOString()}
        className="shrink-0 font-mono text-[11.5px] text-muted-foreground tabular-nums"
      >
        {time.format(event.at)}
      </time>
    </>
  )
  if (event.metadata === undefined)
    return (
      <li data-slot="audit-event" className="flex items-start gap-3 px-5 py-3 pl-12">
        {body}
      </li>
    )
  return (
    <Collapsible asChild>
      <li data-slot="audit-event" className="flex flex-col">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={t.details(
              `${event.actor.name} ${actionLabel}${event.target ? ` ${event.target}` : ''}`,
            )}
            className="group/trigger flex w-full cursor-pointer items-start gap-3 px-5 py-3 text-left outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
          >
            <ChevronDownIcon
              aria-hidden
              className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
            />
            {body}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-3 pl-12">
            <JsonViewer value={event.metadata} maxHeight="260px" aria-label={t.metadata} />
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

function AuditLog({
  events,
  actions = [],
  hasMore = false,
  loading = false,
  onLoadMore,
  onExport,
  title,
  className,
}: {
  /** Newest first or not: they are sorted by date. */
  events: AuditEvent[]
  /** Labels for the action keys, also the action filter's options. */
  actions?: AuditAction[]
  /** Shows Load more. */
  hasMore?: boolean
  /** A page is loading: Load more shows a spinner. */
  loading?: boolean
  onLoadMore?: () => unknown
  /** Shows Export; receives the events that match the filters. */
  onExport?: (events: AuditEvent[]) => unknown
  title?: React.ReactNode
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.auditLog
  const [query, setQuery] = React.useState('')
  const [actor, setActor] = React.useState(ALL)
  const [action, setAction] = React.useState(ALL)
  const resultsId = React.useId()
  const actionLabel = (v: string) => actions.find((a) => a.value === v)?.label ?? v
  const actors = [...new Set(events.map((e) => e.actor.name))].sort((a, b) =>
    a.localeCompare(b, locale),
  )
  const shown = filterAuditEvents(events, {
    query,
    actor: actor === ALL ? undefined : actor,
    action: action === ALL ? undefined : action,
    actionLabel,
  }).sort((a, b) => b.at.getTime() - a.at.getTime())
  const day = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const days = new Map<string, AuditEvent[]>()
  for (const e of shown) {
    const key = day.format(e.at)
    days.set(key, [...(days.get(key) ?? []), e])
  }
  const filtered = query.trim() !== '' || actor !== ALL || action !== ALL

  return (
    <div
      data-slot="audit-log"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 font-display text-[17px] font-semibold text-foreground">
            {title ?? t.title}
          </p>
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => void onExport(shown)}>
              <DownloadIcon />
              {t.export}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
              }}
              placeholder={t.search}
              aria-label={t.search}
              aria-controls={resultsId}
              className="h-9 pl-9"
            />
          </div>
          <Select value={actor} onValueChange={setActor}>
            <SelectTrigger size="sm" className="w-full sm:w-44" aria-label={t.actor}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.allActors}</SelectItem>
              {actors.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {actions.length > 0 && (
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger size="sm" className="w-full sm:w-48" aria-label={t.action}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t.allActions}</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {filtered ? t.results(shown.length, formatNumber(shown.length)) : ''}
      </p>
      <div id={resultsId}>
        {shown.length === 0 ? (
          <p className="m-0 px-5 py-10 text-center text-[13px] text-muted-foreground">
            {filtered ? t.noMatch : t.empty}
          </p>
        ) : (
          [...days].map(([label, list]) => (
            <section key={label} aria-label={label}>
              <p className="m-0 border-y border-border-subtle bg-surface px-5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase first:border-t-0">
                {label}
              </p>
              <ul className="m-0 list-none divide-y divide-border-subtle p-0">
                {list.map((e) => (
                  <AuditRow key={e.id} event={e} actionLabel={actionLabel(e.action)} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
      {hasMore && onLoadMore && (
        <div className="flex justify-center border-t border-border px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            aria-busy={loading || undefined}
            disabled={loading}
            onClick={() => void onLoadMore()}
          >
            {loading && <Spinner />}
            {t.loadMore}
          </Button>
        </div>
      )}
    </div>
  )
}

export { type AuditAction, type AuditActor, type AuditEvent, AuditLog, filterAuditEvents }
