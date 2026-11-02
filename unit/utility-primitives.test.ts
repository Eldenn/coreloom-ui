import { describe, expect, it } from 'vitest'

import { splitDuration } from '@/components/ui/countdown'
import { fileKind } from '@/components/ui/file-card'
import { formatValue } from '@/components/ui/format'
import { formatHotkey, matchesHotkey, parseHotkey } from '@/components/ui/keyboard-shortcuts'
import { fitCount } from '@/components/ui/overflow-list'
import { maskSecret } from '@/components/ui/secret-value'

const key = (init: Partial<KeyboardEvent> & { key: string }) =>
  ({
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    code: '',
    ...init,
  }) as KeyboardEvent

describe('maskSecret', () => {
  it('keeps the asked characters in clear', () => {
    expect(maskSecret('cl_live_abcdef1234', 3, 4)).toBe('cl_••••••••••••1234')
    expect(maskSecret('abcdef', 0, 0)).toBe('••••••••••••')
  })
  it('hides short values whole', () => {
    expect(maskSecret('abc', 2, 2)).toBe('•••')
  })
})

describe('formatValue', () => {
  it('writes each format for the locale', () => {
    expect(formatValue(1234.5, 'en', { format: 'currency', currency: 'EUR' })).toBe('€1,234.50')
    expect(formatValue(0.1275, 'en', { format: 'percent' })).toBe('12.8%')
    expect(formatValue(0.042, 'en', { format: 'percent', signDisplay: 'exceptZero' })).toBe('+4.2%')
    expect(formatValue(1_284_000, 'en', { format: 'compact' })).toBe('1.3M')
    expect(formatValue(48213.6, 'en', { format: 'integer' })).toBe('48,214')
  })
  it('writes bytes with a space before the unit', () => {
    expect(formatValue(3_480_000_000, 'en', { format: 'bytes' })).toBe('3.5 GB')
    expect(formatValue(512, 'en', { format: 'bytes' })).toBe('512 B')
    expect(formatValue(2048, 'en', { format: 'bytes', base: 1024 })).toBe('2 kB')
    expect(formatValue(1_500_000, 'fr', { format: 'bytes' })).toMatch(/^1,5\s?Mo$/)
  })
})

describe('fileKind', () => {
  it('reads the MIME type, then the extension', () => {
    expect(fileKind('x', 'image/png')).toBe('image')
    expect(fileKind('Q3.final.PDF')).toBe('pdf')
    expect(fileKind('data.csv')).toBe('spreadsheet')
    expect(fileKind('api.ts')).toBe('code')
    expect(fileKind('README')).toBe('other')
  })
})

describe('fitCount', () => {
  it('shows everything when it fits', () => {
    expect(fitCount([50, 50, 50], 170, 10, 30)).toBe(3)
  })
  it('keeps room for the indicator', () => {
    // 50 + 10 + 50 + 10 + 30 = 150 fits; a third item would not.
    expect(fitCount([50, 50, 50, 50], 160, 10, 30)).toBe(2)
    expect(fitCount([200, 50], 100, 10, 30)).toBe(0)
  })
})

describe('hotkeys', () => {
  it('parses combinations and sequences', () => {
    expect(parseHotkey('mod+shift+K')).toEqual([
      { key: 'k', mod: true, ctrl: false, meta: false, alt: false, shift: true },
    ])
    expect(parseHotkey('g i').map((s) => s.key)).toEqual(['g', 'i'])
    expect(parseHotkey('mod++')[0]?.key).toBe('+')
    expect(parseHotkey('esc')[0]?.key).toBe('escape')
  })
  it('matches mod as ⌘ on Apple and Ctrl elsewhere', () => {
    const step = parseHotkey('mod+k').at(0)
    if (!step) throw new Error('no step')
    expect(matchesHotkey(key({ key: 'k', metaKey: true }), step, true)).toBe(true)
    expect(matchesHotkey(key({ key: 'k', ctrlKey: true }), step, true)).toBe(false)
    expect(matchesHotkey(key({ key: 'k', ctrlKey: true }), step, false)).toBe(true)
  })
  it('ignores Shift for symbols and reads the physical key under Alt', () => {
    const question = parseHotkey('shift+?').at(0)
    const altK = parseHotkey('alt+k').at(0)
    if (!question || !altK) throw new Error('no step')
    expect(matchesHotkey(key({ key: '?', shiftKey: true }), question, false)).toBe(true)
    expect(matchesHotkey(key({ key: '˚', altKey: true, code: 'KeyK' }), altK, true)).toBe(true)
  })
  it('draws keys per platform', () => {
    expect(formatHotkey('mod+shift+k', true)).toEqual([['⌘', '⇧', 'K']])
    expect(formatHotkey('mod+shift+k', false)).toEqual([['Ctrl', 'Shift', 'K']])
    expect(formatHotkey('g i', false)).toEqual([['G'], ['I']])
    expect(formatHotkey('esc', false)).toEqual([['Esc']])
  })
})

describe('splitDuration', () => {
  it('splits and rounds seconds up', () => {
    expect(splitDuration(((2 * 24 + 5) * 3600 + 14 * 60 + 7) * 1000 - 300)).toEqual({
      days: 2,
      hours: 5,
      minutes: 14,
      seconds: 7,
    })
    expect(splitDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})
