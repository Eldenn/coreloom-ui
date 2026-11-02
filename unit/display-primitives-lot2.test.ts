import { describe, expect, it } from 'vitest'

import { findMatches } from '@/components/ui/highlight'

describe('findMatches', () => {
  it('ignores case and accents, and keeps the original positions', () => {
    const text = 'Écoles et universités'
    expect(findMatches(text, 'ecole')).toEqual([[0, 5]])
    expect(findMatches(text, 'UNIVERSITES')).toEqual([[10, 21]])
  })
  it('finds every occurrence of every term, in order, merging overlaps', () => {
    expect(findMatches('abcabc', 'bc')).toEqual([
      [1, 3],
      [4, 6],
    ])
    expect(findMatches('export exports', ['export', 'ports'])).toEqual([
      [0, 6],
      [7, 14],
    ])
    expect(findMatches('abcdef', ['abc', 'cde'])).toEqual([[0, 5]])
  })
  it('splits a query string on spaces and skips empty terms', () => {
    expect(findMatches('Set up single sign-on', '  sign   set ')).toEqual([
      [0, 3],
      [14, 18],
    ])
    expect(findMatches('anything', '   ')).toEqual([])
    expect(findMatches('', 'a')).toEqual([])
  })
  it('handles accented characters written as two code points', () => {
    const text = 'Café crème'
    expect(findMatches(text, 'cafe')).toEqual([[0, 5]])
    expect(findMatches(text, 'creme')).toEqual([[6, 11]])
  })
})
