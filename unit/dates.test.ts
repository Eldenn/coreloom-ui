import { de, enUS, es, fr } from 'date-fns/locale'
import { describe, expect, it } from 'vitest'

import { parseTypedDate } from '@/components/ui/date-picker'

const ymd = (date: Date | undefined) =>
  date && [date.getFullYear(), date.getMonth() + 1, date.getDate()]

describe('parseTypedDate', () => {
  it("reads the locale's numeric order", () => {
    expect(ymd(parseTypedDate('14/10/2026', fr))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('10/14/2026', enUS))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('14.10.2026', de))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('14/10/2026', es))).toEqual([2026, 10, 14])
  })

  it('takes any separator, and two-digit years as this century', () => {
    expect(ymd(parseTypedDate('14 10 26', fr))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('14-10-2026', fr))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('1/2/2027', fr))).toEqual([2027, 2, 1])
  })

  it('reads ISO dates in every locale', () => {
    for (const locale of [enUS, fr, de, es])
      expect(ymd(parseTypedDate('2026-10-14', locale))).toEqual([2026, 10, 14])
  })

  it('reads the long forms', () => {
    expect(ymd(parseTypedDate('Oct 14, 2026', enUS))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('October 14th, 2026', enUS))).toEqual([2026, 10, 14])
    expect(ymd(parseTypedDate('14 oct. 2026', fr))).toEqual([2026, 10, 14])
  })

  it("refuses dates that don't exist instead of rolling them over", () => {
    expect(parseTypedDate('31/02/2026', fr)).toBeUndefined()
    expect(parseTypedDate('29/02/2026', fr)).toBeUndefined()
    expect(parseTypedDate('2026-13-01', fr)).toBeUndefined()
    expect(parseTypedDate('00/10/2026', fr)).toBeUndefined()
  })

  it('accepts the 29th of February in leap years', () => {
    expect(ymd(parseTypedDate('29/02/2028', fr))).toEqual([2028, 2, 29])
  })

  it('returns undefined for empty or unreadable text', () => {
    for (const text of ['', '  ', 'tomorrow', '14/10', '14/10/2026/1'])
      expect(parseTypedDate(text, fr), text).toBeUndefined()
  })
})
