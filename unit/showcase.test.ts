import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import { minutesOf, openingStatus, type WeeklyHours } from '@/components/contact-section'
import { initialsOf } from '@/components/practitioner-card'
import { contrastRatio } from '@/lib/accent'

const week: WeeklyHours = {
  monday: [
    { open: '09:00', close: '12:30' },
    { open: '14:00', close: '19:00' },
  ],
  wednesday: [{ open: '09:00', close: '12:30' }],
  saturday: [{ open: '09:00', close: '13:00' }],
}
// 2026-10-12 is a Monday.
const at = (day: number, h: number, m = 0) => new Date(2026, 9, day, h, m)

describe('minutesOf', () => {
  it('reads 24-hour times', () => {
    expect(minutesOf('09:30')).toBe(570)
    expect(minutesOf('9:05')).toBe(545)
    expect(minutesOf(' 00:00 ')).toBe(0)
    expect(minutesOf('24:00')).toBe(1440)
  })
  it('refuses anything else', () => {
    for (const bad of ['24:01', '25:00', '9h30', '09:60', '', '9', '09:3', '-1:00', '0x10:00'])
      expect(minutesOf(bad), bad).toBeNull()
  })
})

describe('openingStatus', () => {
  it('is open inside a range, until its close', () => {
    expect(openingStatus(week, at(12, 10))).toEqual({ open: true, closes: '12:30' })
    expect(openingStatus(week, at(12, 9, 0))).toEqual({ open: true, closes: '12:30' })
  })
  it('is closed at the closing minute, and opens later the same day', () => {
    expect(openingStatus(week, at(12, 12, 30))).toEqual({
      open: false,
      opens: { time: '14:00', daysAhead: 0, weekday: 'monday' },
    })
  })
  it('looks ahead to the next open day', () => {
    // Monday evening → Wednesday morning (Tuesday is closed).
    expect(openingStatus(week, at(12, 19, 30))).toEqual({
      open: false,
      opens: { time: '09:00', daysAhead: 2, weekday: 'wednesday' },
    })
    // Saturday afternoon → Monday.
    expect(openingStatus(week, at(17, 15))).toMatchObject({
      opens: { daysAhead: 2, weekday: 'monday' },
    })
  })
  it('joins back-to-back ranges', () => {
    const h: WeeklyHours = {
      monday: [
        { open: '12:00', close: '18:00' },
        { open: '09:00', close: '12:00' },
      ],
    }
    expect(openingStatus(h, at(12, 10))).toEqual({ open: true, closes: '18:00' })
  })
  it('lets an exception close a day or change its hours', () => {
    const closed = [{ date: '2026-10-12', label: 'Holiday' }]
    expect(openingStatus(week, at(12, 10), closed)).toMatchObject({
      open: false,
      opens: { weekday: 'wednesday' },
    })
    const late = [{ date: '2026-10-13', hours: [{ open: '18:00', close: '21:00' }] }]
    expect(openingStatus(week, at(13, 19), late)).toEqual({ open: true, closes: '21:00' })
  })
  it('ignores broken and backwards ranges, and says nothing when it never opens', () => {
    const h: WeeklyHours = {
      monday: [
        { open: '18:00', close: '09:00' },
        { open: 'nine', close: '12:00' },
      ],
    }
    expect(openingStatus(h, at(12, 10))).toEqual({ open: false })
    expect(openingStatus({}, at(12, 10))).toEqual({ open: false })
  })
})

describe('initialsOf', () => {
  it('takes two initials, without the title', () => {
    expect(initialsOf('Claire Morel')).toBe('CM')
    expect(initialsOf('Dr Paul Lefèvre')).toBe('PL')
    expect(initialsOf('Dr. Ana María de la Cruz')).toBe('AM')
    expect(initialsOf('élise')).toBe('É')
    expect(initialsOf('  ')).toBe('')
  })
})

describe('surfaces.css', () => {
  const css = fs.readFileSync('src/styles/surfaces.css', 'utf8')
  const blocks = [...css.matchAll(/([^{}/]+)\{([^}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    vars: Object.fromEntries(
      [...m[2].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((v) => [v[1], v[2]]),
    ),
  }))
  const tokens = [
    '--bg-base',
    '--bg-1',
    '--surface-1',
    '--surface-2',
    '--surface-hover',
    '--surface-inset',
    '--fg-1',
    '--fg-2',
    '--fg-muted',
    '--fg-faint',
    '--border-subtle',
    '--border',
    '--border-strong',
  ]

  it('has both presets in both themes, with every surface token', () => {
    for (const name of ['mineral', 'bone'])
      for (const theme of ['dark', 'light']) {
        const block = blocks.find(
          (b) =>
            b.selector.includes(`[data-surface='${name}']`) &&
            b.selector.includes(`[data-theme='${theme}']`),
        )
        expect(block, `${name} ${theme}`).toBeDefined()
        for (const token of tokens)
          expect(block?.vars[token], `${name} ${theme} ${token}`).toMatch(/^#[0-9a-f]{6}$/)
      }
  })

  it('keeps readable text on every surface of each preset', () => {
    for (const { selector, vars } of blocks) {
      const surfaces = tokens.slice(0, 6).map((t) => vars[t])
      for (const text of ['--fg-1', '--fg-2', '--fg-muted'])
        for (const bg of surfaces)
          expect(
            contrastRatio(vars[text], bg),
            `${selector} ${text} on ${bg}`,
          ).toBeGreaterThanOrEqual(4.5)
    }
  })
})
