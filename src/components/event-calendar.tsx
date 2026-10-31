'use client'

// Coreloom UI — EventCalendar (calendar block). A month of events: a grid on wide screens, an
// agenda list on phones. Weeks start on the locale's first day; events take the chart colours.
// Controlled month (or uncontrolled with `defaultMonth`); events are { id, title, start, end? }.
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  type Locale,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  /** Same day as `start` for a timed event; leave out for an all-day event. */
  end?: Date
  allDay?: boolean
  /** chart-1 … chart-5 (cyan, violet, amber, green, rose by default). */
  color?: 1 | 2 | 3 | 4 | 5
}

const DOT = ['', 'bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'] as const

function EventCalendar({
  events,
  month,
  defaultMonth,
  onMonthChange,
  onEventSelect,
  onDaySelect,
  maxPerDay = 3,
  className,
}: {
  events: CalendarEvent[]
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  onEventSelect?: (event: CalendarEvent) => void
  /** Clicking a day's number (create an event that day…). */
  onDaySelect?: (day: Date) => void
  /** Events shown in a day cell before "n more". */
  maxPerDay?: number
  className?: string
}) {
  const { messages, dateLocale, formatNumber } = useCoreloomI18n()
  const t = messages.eventCalendar
  const locale = dateLocale as Locale | undefined
  const [inner, setInner] = React.useState(() => startOfMonth(defaultMonth ?? new Date()))
  const current = startOfMonth(month ?? inner)
  const go = (next: Date) => {
    if (month === undefined) setInner(startOfMonth(next))
    onMonthChange?.(startOfMonth(next))
  }

  const weekStartsOn = locale?.options?.weekStartsOn ?? 0
  const first = startOfWeek(startOfMonth(current), { weekStartsOn })
  const last = endOfWeek(endOfMonth(current), { weekStartsOn })
  const days: Date[] = []
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d)
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7))
  const today = startOfDay(new Date())

  const sorted = React.useMemo(
    () => [...events].sort((a, b) => a.start.getTime() - b.start.getTime()),
    [events],
  )
  const on = (day: Date) => sorted.filter((e) => isSameDay(e.start, day))
  const time = (e: CalendarEvent) =>
    e.allDay || !e.end ? t.allDay : format(e.start, 'p', { locale })
  const monthEvents = sorted.filter((e) => isSameMonth(e.start, current))
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const eventButton = (e: CalendarEvent, compact: boolean) => (
    <button
      key={e.id}
      type="button"
      onClick={() => onEventSelect?.(e)}
      className={cn(
        'flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-sm text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring',
        compact ? 'px-1 py-0.5 text-[12px]' : 'px-2 py-1.5 text-[14px]',
      )}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', DOT[e.color ?? 1])} />
      {!compact && (
        <span className="w-16 shrink-0 font-mono text-[12px] text-muted-foreground">{time(e)}</span>
      )}
      {compact && !e.allDay && e.end && (
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {format(e.start, 'p', { locale })}
        </span>
      )}
      <span className="truncate text-foreground">{e.title}</span>
    </button>
  )

  return (
    <div data-slot="event-calendar" className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2
          aria-live="polite"
          className="m-0 mr-auto font-display text-[20px] font-semibold tracking-[-0.01em] text-foreground first-letter:uppercase"
        >
          {format(current, 'LLLL yyyy', { locale })}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            go(new Date())
          }}
        >
          {t.today}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t.previous}
          onClick={() => {
            go(addMonths(current, -1))
          }}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t.next}
          onClick={() => {
            go(addMonths(current, 1))
          }}
        >
          <ChevronRightIcon />
        </Button>
      </div>

      {/* Wide screens: the month grid. */}
      <table className="hidden w-full table-fixed border-collapse overflow-hidden rounded-lg border border-border md:table">
        <thead>
          <tr>
            {weeks[0].map((d) => (
              <th
                key={d.toISOString()}
                scope="col"
                abbr={format(d, 'EEEE', { locale })}
                className="border-b border-border bg-surface px-2 py-2 text-left font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
              >
                {format(d, 'EEE', { locale })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].toISOString()}>
              {week.map((day) => {
                const list = on(day)
                const key = day.toISOString()
                const open = expanded === key
                const shown = open ? list : list.slice(0, maxPerDay)
                const inMonth = isSameMonth(day, current)
                const isToday = isSameDay(day, today)
                const label = format(day, 'PPPP', { locale })
                return (
                  <td
                    key={key}
                    aria-label={`${label}, ${list.length ? t.events(formatNumber(list.length), list.length) : t.noEvents}`}
                    className={cn(
                      'h-28 border-r border-b border-border-subtle p-1 align-top last:border-r-0',
                      !inMonth && 'bg-surface/40',
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      {onDaySelect ? (
                        <button
                          type="button"
                          onClick={() => {
                            onDaySelect(day)
                          }}
                          aria-label={label}
                          aria-current={isToday ? 'date' : undefined}
                          className={cn(
                            'mb-0.5 flex size-6 cursor-pointer items-center justify-center rounded-full font-mono text-[12px] outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring',
                            isToday
                              ? 'bg-primary text-primary-foreground hover:bg-primary'
                              : inMonth
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                          )}
                        >
                          {format(day, 'd')}
                        </button>
                      ) : (
                        <span
                          aria-current={isToday ? 'date' : undefined}
                          className={cn(
                            'mb-0.5 flex size-6 items-center justify-center rounded-full font-mono text-[12px]',
                            isToday
                              ? 'bg-primary text-primary-foreground'
                              : inMonth
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                      )}
                      {shown.map((e) => eventButton(e, true))}
                      {list.length > maxPerDay && (
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => {
                            setExpanded(open ? null : key)
                          }}
                          className="flex min-h-6 cursor-pointer items-center self-start rounded-sm px-1.5 text-[11px] font-medium text-primary-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          {open ? '−' : t.more(formatNumber(list.length - maxPerDay))}
                        </button>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones: an agenda of the month's days that have events. */}
      <ol className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
        {monthEvents.length === 0 && (
          <li className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-muted-foreground">
            {t.noEvents}
          </li>
        )}
        {days
          .filter((d) => isSameMonth(d, current) && on(d).length > 0)
          .map((day) => (
            <li key={day.toISOString()} className="rounded-lg border border-border">
              <h3
                className={cn(
                  'm-0 border-b border-border px-3 py-2 text-[13px] font-semibold first-letter:uppercase',
                  isSameDay(day, today) ? 'text-primary-text' : 'text-foreground',
                )}
              >
                {format(day, 'EEEE d MMMM', { locale })}
              </h3>
              <div className="flex flex-col p-1">{on(day).map((e) => eventButton(e, false))}</div>
            </li>
          ))}
      </ol>
    </div>
  )
}

export { type CalendarEvent, EventCalendar }
