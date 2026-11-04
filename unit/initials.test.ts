// initials(): what an avatar shows without a picture.
import { describe, expect, it } from 'vitest'

import { initials } from '@/lib/initials'

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
    expect(initials('Grace Brewster Murray Hopper')).toBe('GB')
  })
  it('upper-cases and keeps one-word names to one letter', () => {
    expect(initials('lin')).toBe('L')
  })
  it('ignores leading, trailing and repeated spaces', () => {
    expect(initials('  Ada   Lovelace ')).toBe('AL')
  })
  it('returns nothing for an empty or blank name', () => {
    expect(initials('')).toBe('')
    expect(initials('   ')).toBe('')
  })
  it('keeps letters outside ASCII', () => {
    expect(initials('élodie ünal')).toBe('ÉÜ')
  })
})
