import { describe, expect, it } from 'vitest'

import { parseLineRanges } from '@/components/ui/code-viewer'
import { diffLines, pairLines } from '@/components/ui/diff-viewer'
import { containerPaths } from '@/components/ui/json-viewer'
import { formatRelative } from '@/components/ui/relative-time'
import { branchIds } from '@/components/ui/tree-view'

const NOW = new Date('2026-10-14T10:00:00Z')
const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000)

describe('formatRelative', () => {
  it('says now under 45 seconds', () => {
    expect(formatRelative(at(-0.5), 'en', NOW)).toBe('now')
    expect(formatRelative(at(0.5), 'en', NOW)).toBe('now')
  })
  it('picks the largest unit that fits', () => {
    expect(formatRelative(at(-5), 'en', NOW)).toBe('5 minutes ago')
    expect(formatRelative(at(-180), 'en', NOW)).toBe('3 hours ago')
    expect(formatRelative(at(-60 * 24), 'en', NOW)).toBe('yesterday')
    expect(formatRelative(at(60 * 24 * 3), 'en', NOW)).toBe('in 3 days')
    expect(formatRelative(at(-60 * 24 * 15), 'en', NOW)).toBe('2 weeks ago')
    expect(formatRelative(at(-60 * 24 * 400), 'en', NOW)).toBe('last year')
  })
  it('speaks the locale and takes strings and timestamps', () => {
    expect(formatRelative(at(-5).toISOString(), 'fr', NOW)).toBe('il y a 5 minutes')
    expect(formatRelative(at(-5).getTime(), 'de', NOW.getTime())).toBe('vor 5 Minuten')
    expect(formatRelative(at(-5), 'en', NOW, 'narrow')).toMatch(/^5\s?m(in\.?)? ago$/)
  })
})

describe('parseLineRanges', () => {
  it('reads single lines and ranges', () => {
    expect([...parseLineRanges('1, 3-5,9')]).toEqual([1, 3, 4, 5, 9])
    expect([...parseLineRanges('7–6')]).toEqual([6, 7])
    expect([...parseLineRanges([2, 4])]).toEqual([2, 4])
  })
  it('skips what it cannot read', () => {
    expect([...parseLineRanges('a, 2, -')]).toEqual([2])
    expect(parseLineRanges(undefined).size).toBe(0)
  })
})

describe('pairLines', () => {
  it('lines up removed and added lines in a run, unchanged lines facing themselves', () => {
    const pairs = pairLines(diffLines('a\nb\nc\nd', 'a\nB\nC\nX\nd'))
    expect(pairs.map((p) => [p.left?.text ?? null, p.right?.text ?? null])).toEqual([
      ['a', 'a'],
      ['b', 'B'],
      ['c', 'C'],
      [null, 'X'],
      ['d', 'd'],
    ])
  })
  it('keeps line numbers on both sides', () => {
    const [, change] = pairLines(diffLines('a\nb', 'a\nc'))
    expect(change.left?.oldLine).toBe(2)
    expect(change.right?.newLine).toBe(2)
  })
})

describe('containerPaths', () => {
  const value = { a: { b: [1, { c: true }] }, 'first name': { x: null }, n: 1 }
  it('lists objects and arrays down to a depth', () => {
    expect(containerPaths(value, 0)).toEqual([])
    expect(containerPaths(value, 1)).toEqual([''])
    expect(containerPaths(value, 2)).toEqual(['', 'a', '["first name"]'])
    expect(containerPaths(value, Infinity)).toEqual(['', 'a', 'a.b', 'a.b[1]', '["first name"]'])
  })
  it('has nothing to open in a plain value', () => {
    expect(containerPaths('text', Infinity)).toEqual([])
  })
})

describe('branchIds', () => {
  it('lists every node with children, in tree order', () => {
    expect(
      branchIds([
        {
          id: 'a',
          label: 'A',
          children: [{ id: 'b', label: 'B', children: [{ id: 'c', label: 'C' }] }],
        },
        { id: 'd', label: 'D', children: [] },
        { id: 'e', label: 'E' },
      ]),
    ).toEqual(['a', 'b'])
  })
})
