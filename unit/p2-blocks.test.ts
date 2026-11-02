import { describe, expect, it } from 'vitest'

import { filterAuditEvents } from '@/components/audit-log'
import { dayDiff, ganttColumns, ganttRange, shiftTask } from '@/components/gantt'
import { fillTemplate, templateVariables } from '@/components/prompt-manager'
import {
  averageUptime,
  dayStatus,
  formatIncidentDuration,
  isResolved,
  overallStatus,
} from '@/components/status-page'
import { isHttpsUrl } from '@/components/webhooks'

const d = (month: number, day: number, year = 2026) => new Date(year, month - 1, day)

describe('gantt dates', () => {
  it('counts whole days, across a daylight-saving change', () => {
    expect(dayDiff(d(10, 20), d(10, 30))).toBe(10)
    // Europe changes the clock on the last Sunday of October: still one day.
    expect(dayDiff(d(10, 24), d(10, 26))).toBe(2)
    expect(dayDiff(d(10, 26), d(10, 24))).toBe(-2)
    expect(dayDiff(new Date(2026, 9, 14, 23, 59), new Date(2026, 9, 15, 0, 1))).toBe(1)
  })

  it('pads the range and aligns it to weeks (Monday) or months', () => {
    const tasks = [{ id: 'a', name: 'A', start: d(10, 14), end: d(10, 20) }]
    const week = ganttRange(tasks, 'week')
    expect(week.start.getDay()).toBe(1)
    expect(week.end.getDay()).toBe(0)
    expect(week.start <= d(10, 7)).toBe(true)
    const month = ganttRange(tasks, 'month')
    expect(month.start).toEqual(d(9, 1))
    expect(month.end).toEqual(d(11, 30))
  })

  it('includes today and milestones, and has a range with no tasks', () => {
    const range = ganttRange(
      [{ id: 'm', name: 'M', start: d(12, 1), end: d(1, 1), milestone: true }],
      'day',
      d(10, 1),
    )
    expect(range.start <= d(10, 1)).toBe(true)
    expect(range.end >= d(12, 1)).toBe(true)
    // A milestone's end is ignored, so a nonsense one doesn't stretch the range back.
    expect(range.start > d(1, 1)).toBe(true)
    const empty = ganttRange([], 'week', d(10, 14))
    expect(dayDiff(empty.start, empty.end)).toBeGreaterThan(30)
  })

  it('builds one column per unit and bands that add up to the range', () => {
    const range = { start: d(9, 28), end: d(11, 1) }
    const week = ganttColumns(range, 'week', 'en')
    expect(week.total).toBe(35)
    expect(week.units).toHaveLength(5)
    expect(week.units.every((u) => u.days === 7)).toBe(true)
    expect(week.bands.map((b) => b.label)).toEqual([
      'September 2026',
      'October 2026',
      'November 2026',
    ])
    expect(week.bands.reduce((n, b) => n + b.days, 0)).toBe(35)
    const day = ganttColumns(range, 'day', 'fr')
    expect(day.units).toHaveLength(35)
    expect(day.units[0]?.label).toBe('28')
  })

  it('moves and resizes, never past the other end', () => {
    const task = { start: d(10, 10), end: d(10, 14) }
    expect(shiftTask(task, 'move', 3)).toEqual({ start: d(10, 13), end: d(10, 17) })
    expect(shiftTask(task, 'end', -2)).toEqual({ start: d(10, 10), end: d(10, 12) })
    expect(shiftTask(task, 'end', -9)).toEqual({ start: d(10, 10), end: d(10, 10) })
    expect(shiftTask(task, 'start', 9)).toEqual({ start: d(10, 14), end: d(10, 14) })
    expect(shiftTask({ ...task, milestone: true }, 'move', 1)).toEqual({
      start: d(10, 11),
      end: d(10, 11),
    })
  })
})

describe('status page', () => {
  it('reads a day’s status from its uptime unless it is given', () => {
    expect(dayStatus({ date: d(10, 1), uptime: 100 })).toBe('operational')
    expect(dayStatus({ date: d(10, 1), uptime: 99.9 })).toBe('operational')
    expect(dayStatus({ date: d(10, 1), uptime: 99.5 })).toBe('degraded')
    expect(dayStatus({ date: d(10, 1), uptime: 97 })).toBe('partial')
    expect(dayStatus({ date: d(10, 1), uptime: 80 })).toBe('major')
    expect(dayStatus({ date: d(10, 1) })).toBeUndefined()
    expect(dayStatus({ date: d(10, 1), uptime: 100, status: 'maintenance' })).toBe('maintenance')
  })

  it('takes the worst component state', () => {
    expect(overallStatus([])).toBe('operational')
    expect(overallStatus([{ status: 'operational' }, { status: 'maintenance' }])).toBe(
      'maintenance',
    )
    expect(overallStatus([{ status: 'degraded' }, { status: 'major' }])).toBe('major')
  })

  it('averages only the days with data', () => {
    expect(
      averageUptime([
        { date: d(10, 1), uptime: 100 },
        { date: d(10, 2), uptime: 99 },
        { date: d(10, 3) },
      ]),
    ).toBe(99.5)
    expect(averageUptime([{ date: d(10, 1) }])).toBeUndefined()
  })

  it('is resolved when the latest update says so, whatever the order', () => {
    const updates = [
      { stage: 'resolved' as const, message: '', at: new Date(2026, 9, 2, 15) },
      { stage: 'investigating' as const, message: '', at: new Date(2026, 9, 2, 14) },
    ]
    expect(isResolved({ updates })).toBe(true)
    expect(isResolved({ updates: [...updates].reverse() })).toBe(true)
    expect(isResolved({ updates: updates.slice(1) })).toBe(false)
    expect(isResolved({ updates: [] })).toBe(false)
  })

  it('formats durations in the locale', () => {
    expect(formatIncidentDuration(77 * 60_000, 'en')).toBe('1 hr 17 min')
    expect(formatIncidentDuration(45 * 60_000, 'en')).toBe('45 min')
    expect(formatIncidentDuration(10_000, 'en')).toBe('1 min')
    expect(formatIncidentDuration((26 * 60 + 5) * 60_000, 'en')).toBe('1 day 2 hr')
  })
})

describe('webhooks', () => {
  it('accepts https URLs only', () => {
    expect(isHttpsUrl('https://hooks.acme.dev/x')).toBe(true)
    expect(isHttpsUrl('http://hooks.acme.dev/x')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('hooks.acme.dev')).toBe(false)
    expect(isHttpsUrl('')).toBe(false)
  })
})

describe('audit log', () => {
  const events = [
    {
      id: '1',
      actor: { name: 'Ada' },
      action: 'member.invited',
      target: 'linus@acme.dev',
      at: d(10, 14),
      ip: '92.184.10.7',
    },
    { id: '2', actor: { name: 'Grace' }, action: 'api_key.revoked', target: 'CI', at: d(10, 13) },
  ]
  it('filters by text (action label too), actor and action', () => {
    expect(filterAuditEvents(events, { query: 'LINUS' }).map((e) => e.id)).toEqual(['1'])
    expect(filterAuditEvents(events, { query: '92.184' }).map((e) => e.id)).toEqual(['1'])
    expect(
      filterAuditEvents(events, {
        query: 'revoked the',
        actionLabel: (a) => (a === 'api_key.revoked' ? 'revoked the API key' : a),
      }).map((e) => e.id),
    ).toEqual(['2'])
    expect(filterAuditEvents(events, { actor: 'Grace' }).map((e) => e.id)).toEqual(['2'])
    expect(filterAuditEvents(events, { action: 'member.invited', actor: 'Grace' })).toEqual([])
    expect(filterAuditEvents(events, { query: '  ' })).toHaveLength(2)
  })
})

describe('prompt variables', () => {
  it('finds each variable once, in order, with or without spaces', () => {
    expect(templateVariables('Hi {{name}}, {{ topic }} and {{name}} again')).toEqual([
      'name',
      'topic',
    ])
    expect(templateVariables('{{user.first_name}} {{a-b}}')).toEqual(['user.first_name', 'a-b'])
    expect(templateVariables('No {{ }} or {{1abc}} or {single}')).toEqual([])
  })

  it('fills known variables and leaves the rest', () => {
    expect(fillTemplate('Hi {{name}}, about {{ topic }}', { name: 'Ada', topic: 'billing' })).toBe(
      'Hi Ada, about billing',
    )
    expect(fillTemplate('Hi {{name}} {{missing}}', { name: 'Ada' })).toBe('Hi Ada {{missing}}')
    expect(fillTemplate('{{name}}', { name: '' })).toBe('')
    // Values are text: a value that looks like a variable or a replacement pattern stays as typed.
    expect(fillTemplate('{{a}}', { a: '{{b}} $& $1' })).toBe('{{b}} $& $1')
    expect(fillTemplate('{{constructor}} {{__proto__}}', {})).toBe('{{constructor}} {{__proto__}}')
  })
})
