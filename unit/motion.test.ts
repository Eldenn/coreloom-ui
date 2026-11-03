import { describe, expect, it } from 'vitest'

import { mergeItems } from '@/components/ui/animated-list'
import { assembleOffset } from '@/components/ui/logo'
import { scrambleFrame } from '@/components/ui/text-effects'

const el = (key: string) => ({ key, props: {}, type: 'div' }) as unknown as React.ReactElement

describe('mergeItems', () => {
  const items = (...keys: string[]) =>
    keys.map((key) => ({ key, node: el(key), phase: 'idle' as const }))

  it('marks new items as entering and keeps the others', () => {
    const merged = mergeItems(items('a', 'b'), [el('a'), el('c'), el('b')])
    expect(merged.map((i) => [i.key, i.phase])).toEqual([
      ['a', 'idle'],
      ['c', 'enter'],
      ['b', 'idle'],
    ])
  })

  it('keeps removed items where they were, leaving', () => {
    const merged = mergeItems(items('a', 'b', 'c'), [el('a'), el('c')])
    expect(merged.map((i) => [i.key, i.phase])).toEqual([
      ['a', 'idle'],
      ['b', 'exit'],
      ['c', 'idle'],
    ])
  })

  it('puts a removed first item first', () => {
    const merged = mergeItems(items('a', 'b'), [el('b')])
    expect(merged.map((i) => i.key)).toEqual(['a', 'b'])
  })

  it('brings back an item that was leaving', () => {
    const leaving = [{ key: 'a', node: el('a'), phase: 'exit' as const }]
    expect(mergeItems(leaving, [el('a')])[0]?.phase).toBe('enter')
  })

  it('handles an empty list both ways', () => {
    expect(mergeItems([], [])).toEqual([])
    expect(mergeItems(items('a'), []).map((i) => i.phase)).toEqual(['exit'])
  })
})

describe('scrambleFrame', () => {
  it('is the text at the end and keeps its length on the way', () => {
    expect(scrambleFrame('ACCESS GRANTED', 1, 5)).toBe('ACCESS GRANTED')
    expect(scrambleFrame('ACCESS GRANTED', 0.3, 5)).toHaveLength(14)
  })

  it('settles letters from the left and keeps spaces', () => {
    const frame = scrambleFrame('AB CD', 0.4, 1)
    expect(frame.slice(0, 2)).toBe('AB')
    expect(frame.charAt(2)).toBe(' ')
  })

  it('is the same for the same tick', () => {
    expect(scrambleFrame('hello', 0.2, 3)).toBe(scrambleFrame('hello', 0.2, 3))
  })

  it('handles an empty text', () => {
    expect(scrambleFrame('', 0.5, 1)).toBe('')
  })
})

describe('assembleOffset', () => {
  it('places each part around the logo, the same every time', () => {
    const a = assembleOffset(0, 4)
    expect(assembleOffset(0, 4)).toEqual(a)
    expect(assembleOffset(1, 4)).not.toEqual(a)
    for (let i = 0; i < 4; i++) {
      const { x, y, r } = assembleOffset(i, 4)
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(41)
      expect(Math.abs(r)).toBe(12)
    }
  })

  it('copes with a single part', () => {
    expect(Number.isFinite(assembleOffset(0, 0).x)).toBe(true)
  })
})
