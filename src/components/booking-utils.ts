// Coreloom UI — Booking helpers. The pure side of the Booking block: day keys, slot grouping by
// part of the day, durations, the first day that can be booked, and the .ics file of a booked
// appointment. Exported for tests and for apps that build their own booking screens.

/** A time someone can book. `start` is ISO 8601 with its offset: "2026-10-15T09:30:00+02:00". */
interface BookingSlot {
  start: string
  /** `false` shows the time as taken (struck through, not selectable). Default `true`. */
  available?: boolean
}

type DayPeriod = 'morning' | 'afternoon' | 'evening'

/** "2026-10-15" for a calendar day, from the date's own (local) year, month and day. */
function dateKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** The hour (0–23) of an instant in a time zone (the browser's when none). */
function hourIn(instant: Date, timeZone?: string) {
  const hour = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone })
    .formatToParts(instant)
    .find((part) => part.type === 'hour')?.value
  return Number(hour ?? instant.getHours())
}

/** Morning before noon, afternoon before 5 pm, evening after. */
function periodOf(start: string, timeZone?: string): DayPeriod {
  const hour = hourIn(new Date(start), timeZone)
  if (hour < 12) return 'morning'
  return hour < 17 ? 'afternoon' : 'evening'
}

/**
 * Slots grouped by part of the day, in time order. Slots whose `start` isn't a date are dropped:
 * they come from the app's callback, and one bad row shouldn't break the list.
 */
function groupSlots(slots: readonly BookingSlot[], timeZone?: string) {
  const valid = slots
    .filter((slot) => !Number.isNaN(Date.parse(slot.start)))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
  const groups: { period: DayPeriod; slots: BookingSlot[] }[] = []
  for (const slot of valid) {
    const period = periodOf(slot.start, timeZone)
    const last = groups.at(-1)
    if (last?.period === period) last.slots.push(slot)
    else groups.push({ period, slots: [slot] })
  }
  return groups
}

/** "45 min", "1 h", "1 h 30 min" in the locale's words. */
function formatBookingDuration(minutes: number, locale: string) {
  const whole = Math.max(0, Math.round(minutes))
  const unit = (value: number, name: 'hour' | 'minute') =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: name, unitDisplay: 'short' }).format(value)
  const h = Math.floor(whole / 60)
  const m = whole % 60
  if (h === 0) return unit(m, 'minute')
  return m === 0 ? unit(h, 'hour') : `${unit(h, 'hour')} ${unit(m, 'minute')}`
}

/** Midnight of the same day. */
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** `date` plus `days` calendar days. */
function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** The first day from `from` to `to` that isn't unavailable, or `from` when none is. */
function firstOpenDay(from: Date, to: Date, isUnavailable?: (date: Date) => boolean) {
  for (let day = startOfDay(from); day <= to; day = addDays(day, 1)) {
    if (!isUnavailable?.(day)) return day
  }
  return startOfDay(from)
}

/** An instant as iCalendar UTC: 20261015T073000Z. */
function icsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/** Text escaped for an iCalendar value: backslash, semicolon, comma and line breaks. */
function icsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * An .ics file (iCalendar) for one appointment, for an "Add to calendar" link. `uid` should be
 * stable for the booking (its reference) so that importing twice updates rather than duplicates.
 */
function bookingIcs({
  uid,
  title,
  start,
  minutes,
  location,
  description,
  stamp = new Date(),
}: {
  uid: string
  title: string
  start: string
  minutes: number
  location?: string
  description?: string
  /** When the file was made (DTSTAMP). Default: now. */
  stamp?: Date
}) {
  const from = new Date(start)
  const to = new Date(from.getTime() + minutes * 60_000)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coreloom UI//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${icsText(uid)}`,
    `DTSTAMP:${icsDate(stamp)}`,
    `DTSTART:${icsDate(from)}`,
    `DTEND:${icsDate(to)}`,
    `SUMMARY:${icsText(title)}`,
    ...(location ? [`LOCATION:${icsText(location)}`] : []),
    ...(description ? [`DESCRIPTION:${icsText(description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.join('\r\n')}\r\n`
}

export {
  addDays,
  bookingIcs,
  type BookingSlot,
  dateKey,
  type DayPeriod,
  firstOpenDay,
  formatBookingDuration,
  groupSlots,
  periodOf,
  startOfDay,
}
