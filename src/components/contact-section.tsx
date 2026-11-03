'use client'

// Coreloom UI — Contact and opening hours (showcase block). ContactDetails lists the address (with
// a directions link), phone, email and anything else a visitor needs to come (access, parking).
// OpeningHours shows the week, marks today, says whether it's open now and when it next opens or
// closes, and lists exceptional hours (holidays). ContactSection lays them out beside a map.
// Times are wall-clock times of the place, read against the visitor's clock: a site whose
// visitors are in the same time zone as the place (a practice, a shop) reads right.
import { ArrowUpRightIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react'
import * as React from 'react'

import { StatusIndicator } from '@/components/ui/status-indicator'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const
type Weekday = (typeof WEEKDAYS)[number]

/** One opening, in 24-hour "HH:MM" wall-clock time: { open: "09:00", close: "12:30" }. */
interface OpeningRange {
  open: string
  /** After `open`, the same day; "24:00" for midnight. Ranges over midnight aren't supported. */
  close: string
}

/** The usual week. A day that's missing, or has no ranges, is closed. */
type WeeklyHours = Partial<Record<Weekday, OpeningRange[]>>

/** A date with other hours than usual: a holiday, a late opening. */
interface HoursException {
  /** "YYYY-MM-DD". */
  date: string
  /** "Christmas", "Summer closure". */
  label?: string
  /** The day's ranges; none (or missing) means closed all day. */
  hours?: OpeningRange[]
}

type OpeningStatus =
  | { open: true; closes: string }
  | {
      open: false
      /** The next opening within two weeks, if any. */
      opens?: { time: string; daysAhead: number; weekday: Weekday }
    }

/** "09:30" → 570. null for anything that isn't a 24-hour time ("24:00" is allowed, as midnight). */
function minutesOf(value: string): number | null {
  const m = /^([01]?\d|2[0-4]):([0-5]\d)$/.exec(value.trim())
  if (!m) return null
  const minutes = Number(m[1]) * 60 + Number(m[2])
  return minutes > 24 * 60 ? null : minutes
}

/** The valid ranges, sorted, as minutes. Broken or backwards ranges are dropped. */
function normalizeRanges(ranges: OpeningRange[] | undefined) {
  return (ranges ?? [])
    .map((r) => ({ ...r, from: minutesOf(r.open), to: minutesOf(r.close) }))
    .filter(
      (r): r is OpeningRange & { from: number; to: number } =>
        r.from !== null && r.to !== null && r.from < r.to,
    )
    .sort((a, b) => a.from - b.from)
}

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** The ranges of one date: its exception if there is one, otherwise its weekday's. */
function rangesOn(date: Date, hours: WeeklyHours, exceptions: HoursException[] = []) {
  const exception = exceptions.find((e) => e.date === isoDate(date))
  return normalizeRanges(exception ? exception.hours : hours[WEEKDAYS[date.getDay()]])
}

/** Open now? Until when — or when does it next open? Pure: give it the time to judge. */
function openingStatus(
  hours: WeeklyHours,
  now: Date,
  exceptions: HoursException[] = [],
): OpeningStatus {
  const minute = now.getHours() * 60 + now.getMinutes()
  const today = rangesOn(now, hours, exceptions)
  const current = today.findIndex((r) => r.from <= minute && minute < r.to)
  if (current !== -1) {
    // Back-to-back ranges (09:00–12:00, 12:00–18:00) read as one opening.
    let end = today[current]
    for (const next of today.slice(current + 1)) {
      if (next.from > end.to) break
      if (next.to > end.to) end = next
    }
    return { open: true, closes: end.close }
  }
  for (let daysAhead = 0; daysAhead <= 14; daysAhead++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead)
    const ranges = daysAhead === 0 ? today : rangesOn(day, hours, exceptions)
    const next = ranges.find((r) => daysAhead > 0 || r.from > minute)
    if (next)
      return { open: false, opens: { time: next.open, daysAhead, weekday: WEEKDAYS[day.getDay()] } }
  }
  return { open: false }
}

/** "14:00" in the locale's way: "2:00 PM", "14:00", "14 h 00" depending on the locale. */
function formatClockTime(locale: string, value: string) {
  const minutes = minutesOf(value)
  if (minutes === null) return value
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2024, 0, 1, Math.floor(minutes / 60), minutes % 60),
  )
}

/** The minute, as a number, so the snapshot stays the same between renders. */
function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 15_000)
  return () => {
    clearInterval(id)
  }
}
const currentMinute = () => Math.floor(Date.now() / 60_000)
const noMinute = () => null

/** The visitor's clock, after hydration (the server can't know it), refreshed every minute. */
function useNow(now: Date | undefined) {
  const minute = React.useSyncExternalStore(subscribeMinute, currentMinute, noMinute)
  if (now) return now
  return minute === null ? undefined : new Date(minute * 60_000)
}

function OpeningHours({
  hours,
  exceptions = [],
  now: nowProp,
  weekStartsOn = 1,
  showStatus = true,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  hours: WeeklyHours
  /** Holidays and other dates with their own hours. Past dates are left out. */
  exceptions?: HoursException[]
  /** The time to judge "open now" and "today" by. Default: the visitor's clock, after hydration. */
  now?: Date
  /** 1 (Monday, the default) or 0 (Sunday). */
  weekStartsOn?: 0 | 1
  /** "Open now · Closes at 19:00" above the week. Default true. */
  showStatus?: boolean
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.showcase
  const now = useNow(nowProp)
  const days = Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7])
  // 2024-01-07 is a Sunday: day names from Intl, in the locale.
  const dayName = (day: Weekday, style: 'long' | 'short' = 'long') =>
    new Intl.DateTimeFormat(locale, { weekday: style }).format(
      new Date(2024, 0, 7 + WEEKDAYS.indexOf(day)),
    )
  const ranges = (list: OpeningRange[] | undefined) => {
    const valid = normalizeRanges(list)
    return valid.length === 0
      ? t.closed
      : // One range per span: on a narrow screen they wrap between ranges, never inside one.
        valid.map((r, i) => (
          <span key={r.open} className="whitespace-nowrap">
            {formatClockTime(locale, r.open)} – {formatClockTime(locale, r.close)}
            {i < valid.length - 1 && ', '}
          </span>
        ))
  }
  const status = now && showStatus ? openingStatus(hours, now, exceptions) : undefined
  const todayKey = now ? WEEKDAYS[now.getDay()] : undefined
  const todayException = now ? exceptions.find((e) => e.date === isoDate(now)) : undefined
  const upcoming = exceptions
    .filter((e) => !now || e.date >= isoDate(now))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div {...props} className={cn('flex flex-col gap-4 text-[14px]', className)}>
      {status && (
        <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusIndicator tone={status.open ? 'success' : 'neutral'} variant="pill">
            {status.open ? t.openNow : t.closedNow}
          </StatusIndicator>
          <span className="text-fg-secondary">
            {status.open
              ? t.closesAt(formatClockTime(locale, status.closes))
              : status.opens &&
                t.opensAt(
                  status.opens.daysAhead === 0
                    ? 'today'
                    : status.opens.daysAhead === 1
                      ? 'tomorrow'
                      : 'later',
                  dayName(status.opens.weekday),
                  formatClockTime(locale, status.opens.time),
                )}
          </span>
        </p>
      )}
      <table className="w-full border-collapse">
        <caption className="sr-only">{t.hours}</caption>
        <tbody>
          {days.map((day) => {
            const isToday = day === todayKey
            const list = isToday && todayException ? todayException.hours : hours[day]
            const closed = normalizeRanges(list).length === 0
            return (
              <tr
                key={day}
                aria-current={isToday ? 'date' : undefined}
                className={cn(
                  'border-b border-border-subtle last:border-b-0',
                  isToday && 'font-medium text-foreground shadow-[inset_2px_0_0_var(--accent)]',
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    'py-2 pr-4 text-start font-normal capitalize',
                    isToday ? 'pl-3 font-medium text-foreground' : 'text-fg-secondary',
                  )}
                >
                  {dayName(day)}
                </th>
                <td
                  className={cn(
                    'py-2 text-end tabular-nums',
                    closed ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  {ranges(list)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {upcoming.length > 0 && (
        <div>
          <p className="m-0 mb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.exceptions}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
            {upcoming.map((e) => {
              const [y, m, d] = e.date.split('-').map(Number)
              const date = new Intl.DateTimeFormat(locale, {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
              }).format(new Date(y, m - 1, d))
              return (
                <li key={e.date} className="flex flex-wrap justify-between gap-x-4">
                  <span className="text-fg-secondary">
                    {date}
                    {e.label && <> · {e.label}</>}
                  </span>
                  <span className="text-foreground tabular-nums">{ranges(e.hours)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

interface ContactItem {
  /** A small icon: `<CarIcon />`. Decorative; the label says what it is. */
  icon?: React.ReactNode
  /** "Access", "Parking". */
  label: string
  value: React.ReactNode
}

/** "+33 4 78 00 00 00" → "tel:+33478000000". */
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

function ContactRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-secondary text-primary-text [&>svg]:size-4"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[12.5px] text-muted-foreground">{label}</p>
        <div className="text-[15px] leading-[1.5] break-words text-foreground">{children}</div>
      </div>
    </li>
  )
}

function ContactDetails({
  address,
  directionsHref,
  phone,
  email,
  items = [],
  className,
  ...props
}: React.ComponentProps<'address'> & {
  /** The postal address, lines as you want them shown (a fragment with <br />, or a string). */
  address?: React.ReactNode
  /** A maps link for the address (https only): Google Maps, Apple Plans, OpenStreetMap. */
  directionsHref?: string
  /** As people read it: "04 78 00 00 00". The link dials the digits. */
  phone?: string
  email?: string
  /** Anything else a visitor needs to come: access, parking, wheelchair access. */
  items?: ContactItem[]
}) {
  const t = useCoreloomI18n().messages.showcase
  const safeDirections =
    directionsHref && /^https:\/\//i.test(directionsHref) ? directionsHref : undefined
  const linkClass =
    'rounded-xs underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring'
  return (
    <address {...props} className={cn('not-italic', className)}>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {!!address && (
          <ContactRow icon={<MapPinIcon />} label={t.address}>
            <div>{address}</div>
            {safeDirections && (
              <a
                href={safeDirections}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  'mt-1 inline-flex items-center gap-1 text-[13.5px] font-medium text-primary-text',
                  linkClass,
                )}
              >
                {t.directions}
                <ArrowUpRightIcon aria-hidden className="size-3.5" />
                <span className="sr-only"> {t.newTab}</span>
              </a>
            )}
          </ContactRow>
        )}
        {phone && (
          <ContactRow icon={<PhoneIcon />} label={t.phone}>
            <a href={telHref(phone)} className={cn('tabular-nums', linkClass)}>
              {phone}
            </a>
          </ContactRow>
        )}
        {email && (
          <ContactRow icon={<MailIcon />} label={t.email}>
            <a href={`mailto:${email}`} className={linkClass}>
              {email}
            </a>
          </ContactRow>
        )}
        {items.map((item) => (
          <ContactRow key={item.label} icon={item.icon} label={item.label}>
            {item.value}
          </ContactRow>
        ))}
      </ul>
    </address>
  )
}

function ContactSection({
  eyebrow,
  title,
  description,
  map,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /**
   * A map or a photo of the place: an `<iframe>` with a `title`, or an `<img>` with its `alt`. It
   * fills the frame. Embedded maps load a third-party site: mind your cookie consent.
   */
  map?: React.ReactNode
  /** ContactDetails, OpeningHours, a booking button. */
  children: React.ReactNode
}) {
  return (
    <section {...props} className={cn('px-5 py-20', className)}>
      <div
        className={cn(
          'mx-auto grid max-w-[1120px] gap-10',
          !!map && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14',
        )}
      >
        <div className="flex min-w-0 flex-col gap-8">
          {[eyebrow, title, description].some(Boolean) && (
            <div>
              {!!eyebrow && (
                <p className="m-0 font-mono text-[11px] tracking-[0.12em] text-primary-text uppercase">
                  {eyebrow}
                </p>
              )}
              {!!title && (
                <h2 className="mt-2.5 mb-0 font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
                  {title}
                </h2>
              )}
              {!!description && (
                <p className="mt-3 mb-0 max-w-[52ch] text-[16px] leading-[1.6] text-fg-secondary">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
        {!!map && (
          <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-border-subtle bg-inset [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:size-full [&>iframe]:border-0 [&>img]:absolute [&>img]:inset-0 [&>img]:size-full [&>img]:object-cover">
            {map}
          </div>
        )}
      </div>
    </section>
  )
}

export {
  ContactDetails,
  type ContactItem,
  ContactSection,
  formatClockTime,
  type HoursException,
  minutesOf,
  OpeningHours,
  type OpeningRange,
  type OpeningStatus,
  openingStatus,
  type Weekday,
  type WeeklyHours,
}
