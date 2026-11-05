// The access code gate's input rules: upper case, the alphabet only, cut at the length.
import { describe, expect, it } from 'vitest'

import {
  CODE_ALPHABET,
  codePattern,
  normalizeCode,
  slotGroups,
} from '@/components/access-code-gate'

describe('normalizeCode', () => {
  it('upper-cases and keeps only the alphabet', () => {
    expect(normalizeCode('h7km-3qpx', CODE_ALPHABET, 8)).toBe('H7KM3QPX')
    expect(normalizeCode(' H7 KM 3Q PX ', CODE_ALPHABET, 8)).toBe('H7KM3QPX')
  })

  it('drops the characters people mix up', () => {
    expect(normalizeCode('O0I1LA', CODE_ALPHABET, 8)).toBe('A')
  })

  it('cuts at the length', () => {
    expect(normalizeCode('ABCDEFGHJK', CODE_ALPHABET, 8)).toBe('ABCDEFGH')
  })

  it('takes any alphabet, and nothing from hostile text', () => {
    expect(normalizeCode('12-34 56', '0123456789', 6)).toBe('123456')
    expect(normalizeCode('<script>alert(1)</script>', '0123456789', 6)).toBe('1')
    expect(normalizeCode('', CODE_ALPHABET, 8)).toBe('')
  })
})

describe('codePattern', () => {
  const accepts = (alphabet: string, text: string) => new RegExp(codePattern(alphabet)).test(text)

  it('accepts the alphabet in either case', () => {
    expect(accepts(CODE_ALPHABET, 'h7KM')).toBe(true)
    expect(accepts(CODE_ALPHABET, '')).toBe(true)
  })

  it('refuses characters outside it', () => {
    expect(accepts(CODE_ALPHABET, 'H0')).toBe(false)
    expect(accepts(CODE_ALPHABET, 'H-')).toBe(false)
  })

  it('escapes characters that mean something in a pattern', () => {
    expect(accepts('A-]^\\', ']^-\\a')).toBe(true)
    expect(accepts('A-]^\\', 'B')).toBe(false)
  })
})

describe('slotGroups', () => {
  it('splits long even codes in two halves', () => {
    expect(slotGroups(8)).toEqual([
      [0, 1, 2, 3],
      [4, 5, 6, 7],
    ])
  })

  it('keeps short or odd codes in one row', () => {
    expect(slotGroups(6)).toEqual([[0, 1, 2, 3, 4, 5]])
    expect(slotGroups(7)).toHaveLength(1)
  })
})
