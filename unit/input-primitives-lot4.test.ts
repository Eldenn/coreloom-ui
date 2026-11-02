import { describe, expect, it } from 'vitest'

import { parseJson } from '@/components/ui/json-input'
import { mentionsIn } from '@/components/ui/mention-textarea'
import { parseRRule, type Recurrence, toRRule } from '@/components/ui/recurrence-input'
import { formatOffset, timeZoneOffset } from '@/components/ui/timezone-select'
import { flattenTree } from '@/components/ui/tree-select'

describe('parseJson', () => {
  it('returns the parsed value', () => {
    expect(parseJson('{"a": [1, 2]}')).toEqual({ ok: true, value: { a: [1, 2] } })
  })

  it('says on which line and column it breaks', () => {
    const result = parseJson('{\n  "a": 1,\n  "b": oops\n}')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.at).toEqual({ line: 3, column: 8 })
  })

  it.each([
    ['{"a": 1,}', { line: 1, column: 9 }],
    ['[1, 2', { line: 1, column: 6 }],
    ['{"a": "b}', { line: 1, column: 10 }],
    ['{"a": 1} x', { line: 1, column: 10 }],
    ["{'a': 1}", { line: 1, column: 2 }],
  ])('%s breaks at %o', (text, at) => {
    const result = parseJson(text)
    expect(result.ok ? undefined : result.at).toEqual(at)
  })
})

describe('mentionsIn', () => {
  const people = [
    { value: 'ada', label: 'Ada' },
    { value: 'alan', label: 'Alan' },
  ]

  it('lists known handles once, in order', () => {
    expect(mentionsIn('@alan, can @ada and @alan look?', people)).toEqual(['alan', 'ada'])
  })

  it('ignores unknown handles and emails', () => {
    expect(mentionsIn('ask @bob or mail ada@example.com', people)).toEqual([])
  })

  it('works with another trigger', () => {
    expect(mentionsIn('see #ada', people, '#')).toEqual(['ada'])
  })
})

describe('flattenTree', () => {
  it('gives each node its level, parent and path', () => {
    const flat = flattenTree([
      { value: 'eng', label: 'Engineering', children: [{ value: 'fe', label: 'Frontend' }] },
      { value: 'design', label: 'Design' },
    ])
    expect(flat.map((f) => [f.node.value, f.level, f.parent, f.path.join(' / ')])).toEqual([
      ['eng', 1, undefined, 'Engineering'],
      ['fe', 2, 'eng', 'Engineering / Frontend'],
      ['design', 1, undefined, 'Design'],
    ])
  })
})

describe('toRRule and parseRRule', () => {
  const cases: [Recurrence, string][] = [
    [{ frequency: 'day', interval: 1, end: { type: 'never' } }, 'FREQ=DAILY'],
    [
      { frequency: 'week', interval: 2, weekdays: [3, 1], end: { type: 'after', count: 10 } },
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=10',
    ],
    [
      { frequency: 'month', interval: 1, monthDay: 15, end: { type: 'on', date: '2026-12-31' } },
      'FREQ=MONTHLY;BYMONTHDAY=15;UNTIL=20261231',
    ],
  ]
  it.each(cases)('%o ⇄ %s', (rule, rrule) => {
    expect(toRRule(rule)).toBe(rrule)
    const back = parseRRule(`RRULE:${rrule}`)
    expect(back && toRRule(back)).toBe(rrule)
  })

  it('refuses what it cannot show', () => {
    expect(parseRRule('FREQ=HOURLY')).toBeUndefined()
    expect(parseRRule('FREQ=WEEKLY;BYSETPOS=-1')).toBeUndefined()
    expect(parseRRule('FREQ=WEEKLY;BYDAY=XX')).toBeUndefined()
  })
})

describe('time zones', () => {
  it('works out offsets with daylight saving', () => {
    expect(timeZoneOffset('Europe/Paris', new Date('2026-07-01T12:00:00Z'))).toBe(120)
    expect(timeZoneOffset('Europe/Paris', new Date('2026-01-15T12:00:00Z'))).toBe(60)
    expect(timeZoneOffset('Asia/Kolkata', new Date('2026-01-15T12:00:00Z'))).toBe(330)
    expect(timeZoneOffset('America/New_York', new Date('2026-01-15T12:00:00Z'))).toBe(-300)
    expect(timeZoneOffset('UTC')).toBe(0)
  })

  it('formats offsets', () => {
    expect(formatOffset(330)).toBe('UTC+05:30')
    expect(formatOffset(-300)).toBe('UTC−05:00')
    expect(formatOffset(0)).toBe('UTC')
  })
})
