import { describe, expect, it } from 'vitest'

import { formatMinutes, parseDuration } from '@/components/ui/duration-input'
import { parseKeyValueLines } from '@/components/ui/key-value-editor'
import { parseMonth, toMonthValue } from '@/components/ui/month-picker'
import { passwordStrength } from '@/components/ui/password-strength'
import { toWeekValue, weekRange } from '@/components/ui/week-picker'

describe('parseDuration', () => {
  it.each([
    ['90', 90],
    ['1:30', 90],
    ['1h30', 90],
    ['1 h 30 min', 90],
    ['1.5h', 90],
    ['1,5 h', 90],
    ['2 hours 5 minutes', 125],
    ['45 min', 45],
    ['1 Std. 20 Min.', 80],
    ['2h', 120],
  ])('%s → %d minutes', (text, minutes) => {
    expect(parseDuration(text)).toBe(minutes)
  })
  it.each(['', 'soon', '1h and a bit', '1:75', '3 days'])('rejects %j', (text) => {
    expect(parseDuration(text)).toBeUndefined()
  })
  it('formats back', () => {
    const units = { hour: 'h', minute: 'min' }
    expect(formatMinutes(90, units)).toBe('1 h 30 min')
    expect(formatMinutes(120, units)).toBe('2 h')
    expect(formatMinutes(5, units)).toBe('5 min')
  })
})

describe('months and weeks', () => {
  it('reads and writes months', () => {
    expect(parseMonth('2026-03')).toEqual({ year: 2026, month: 3 })
    expect(parseMonth('2026-13')).toBeUndefined()
    expect(toMonthValue(2026, 3)).toBe('2026-03')
  })
  it('turns days into ISO weeks and back', () => {
    expect(toWeekValue(new Date(2026, 10, 2))).toBe('2026-W45')
    // 1 January 2027 is a Friday: it belongs to the last week of 2026.
    expect(toWeekValue(new Date(2027, 0, 1))).toBe('2026-W53')
    const range = weekRange('2026-W45')
    expect(range?.from.getDate()).toBe(2)
    expect(range?.to.getDate()).toBe(8)
    expect(weekRange('2025-W53')).toBeUndefined()
  })
})

describe('parseKeyValueLines', () => {
  it('reads .env and header lines', () => {
    expect(parseKeyValueLines('A=1\n# note\nexport B="two"')).toEqual([
      { key: 'A', value: '1' },
      { key: 'B', value: 'two' },
    ])
    expect(parseKeyValueLines('Accept: text/html')).toEqual([{ key: 'Accept', value: 'text/html' }])
  })
  it('leaves plain text alone', () => {
    expect(parseKeyValueLines('Authorization')).toBeUndefined()
    expect(parseKeyValueLines('one\ntwo')).toBeUndefined()
  })
})

describe('passwordStrength', () => {
  it.each([
    ['', 0],
    ['abc', 1],
    ['password123!', 1],
    ['sunflower7', 1],
    ['Sunflower7', 2],
    ['Sunflower-77', 4],
    ['sunflower-77-garden', 4],
    ['Sunflower7!', 3],
  ])('%j → %d', (password, score) => {
    expect(passwordStrength(password)).toBe(score)
  })
})
