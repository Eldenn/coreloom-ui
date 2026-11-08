// Booking's pure side: day keys, slots grouped by part of the day, durations, the first day that
// can be booked and the calendar file.
import { describe, expect, it } from 'vitest'

import {
  addDays,
  bookingIcs,
  dateKey,
  firstOpenDay,
  formatBookingDuration,
  groupSlots,
  periodOf,
} from '@/components/booking-utils'

describe('dateKey', () => {
  it('writes the local calendar day with padded month and day', () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('periodOf and groupSlots', () => {
  it('reads the hour in the place’s time zone', () => {
    // 10:30 UTC is 12:30 in Paris (summer time) and 06:30 in New York.
    expect(periodOf('2026-10-15T10:30:00Z', 'Europe/Paris')).toBe('afternoon')
    expect(periodOf('2026-10-15T10:30:00Z', 'America/New_York')).toBe('morning')
    expect(periodOf('2026-10-15T17:00:00+02:00', 'Europe/Paris')).toBe('evening')
  })

  it('sorts the slots, groups them and drops the ones that are not dates', () => {
    const groups = groupSlots(
      [
        { start: '2026-10-15T14:00:00+02:00' },
        { start: 'not a date' },
        { start: '2026-10-15T09:00:00+02:00', available: false },
        { start: '2026-10-15T09:45:00+02:00' },
        { start: '2026-10-15T18:15:00+02:00' },
      ],
      'Europe/Paris',
    )
    expect(groups.map((g) => [g.period, g.slots.map((s) => s.start.slice(11, 16))])).toEqual([
      ['morning', ['09:00', '09:45']],
      ['afternoon', ['14:00']],
      ['evening', ['18:15']],
    ])
    expect(groupSlots([], 'Europe/Paris')).toEqual([])
  })
})

describe('formatBookingDuration', () => {
  // Intl puts a no-break space between a number and its unit.
  const plain = (minutes: number, locale: string) =>
    formatBookingDuration(minutes, locale).replace(/\s/g, ' ')
  it('says minutes, hours, or both, in the locale', () => {
    expect(plain(45, 'en')).toBe('45 min')
    expect(plain(60, 'fr')).toBe('1 h')
    expect(plain(90, 'fr')).toBe('1 h 30 min')
    expect(plain(-5, 'en')).toBe('0 min')
  })
})

describe('firstOpenDay', () => {
  const sunday = new Date(2026, 9, 18)
  it('skips unavailable days', () => {
    const closedSundays = (d: Date) => d.getDay() === 0
    expect(firstOpenDay(sunday, addDays(sunday, 30), closedSundays)).toEqual(new Date(2026, 9, 19))
  })

  it('falls back to the first day when every day is closed', () => {
    expect(firstOpenDay(sunday, addDays(sunday, 3), () => true)).toEqual(sunday)
  })
})

describe('bookingIcs', () => {
  it('writes one event in UTC with escaped text and CRLF line ends', () => {
    const ics = bookingIcs({
      uid: 'RDV-4821',
      title: 'Follow-up, osteopathy',
      start: '2026-10-15T09:45:00+02:00',
      minutes: 45,
      location: '12 rue Vauban; Lyon',
      description: 'Line one\nLine two',
      stamp: new Date('2026-10-14T08:00:00Z'),
    })
    const lines = ics.split('\r\n')
    expect(lines).toContain('DTSTART:20261015T074500Z')
    expect(lines).toContain('DTEND:20261015T083000Z')
    expect(lines).toContain('DTSTAMP:20261014T080000Z')
    expect(lines).toContain('SUMMARY:Follow-up\\, osteopathy')
    expect(lines).toContain(String.raw`LOCATION:12 rue Vauban\; Lyon`)
    expect(lines).toContain('DESCRIPTION:Line one\\nLine two')
    expect(lines[0]).toBe('BEGIN:VCALENDAR')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('leaves out the place and the description when there are none', () => {
    const ics = bookingIcs({ uid: 'x', title: 'T', start: '2026-10-15T09:00:00Z', minutes: 30 })
    expect(ics).not.toContain('LOCATION')
    expect(ics).not.toContain('DESCRIPTION')
  })
})
