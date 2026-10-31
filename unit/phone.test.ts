import { describe, expect, it } from 'vitest'

import { isValidPhone, parsePhone, PHONE_COUNTRIES } from '@/components/ui/phone-input'

describe('parsePhone', () => {
  it('splits an E.164 number into country and national number', () => {
    const { country, national } = parsePhone('+33612345678')
    expect(country?.code).toBe('FR')
    expect(national).toBe('612345678')
  })

  it('prefers the longest matching dial code', () => {
    // +352 (Luxembourg) starts like +35 and +3: the longest wins.
    expect(parsePhone('+352621123456').country?.code).toBe('LU')
    expect(parsePhone('+351912345678').country?.code).toBe('PT')
  })

  it('breaks shared dial codes with the preferred country', () => {
    expect(parsePhone('+14165550123').country?.code).toBe('US')
    expect(parsePhone('+14165550123', 'CA').country?.code).toBe('CA')
    // A preference that doesn't share the code is ignored.
    expect(parsePhone('+33612345678', 'CA').country?.code).toBe('FR')
  })

  it('ignores formatting characters', () => {
    expect(parsePhone('+33 6 12-34.56 78')).toMatchObject({ national: '612345678' })
  })

  it('returns only digits, and no country, for a national number', () => {
    expect(parsePhone('06 12 34 56 78')).toEqual({ national: '0612345678' })
  })

  it('returns no country for an unknown code', () => {
    expect(parsePhone('+999123456').country).toBeUndefined()
  })
})

describe('isValidPhone', () => {
  it('accepts numbers of a valid length for their country', () => {
    expect(isValidPhone('+33612345678')).toBe(true)
    expect(isValidPhone('+12025550123')).toBe(true)
    expect(isValidPhone('+447911123456')).toBe(true)
  })

  it('refuses numbers too short or too long', () => {
    expect(isValidPhone('+3361234567')).toBe(false)
    expect(isValidPhone('+336123456789')).toBe(false)
  })

  it('refuses national numbers and unknown codes', () => {
    expect(isValidPhone('0612345678')).toBe(false)
    expect(isValidPhone('+999123456789')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('PHONE_COUNTRIES', () => {
  it('has one entry per country, each with a sane length range', () => {
    const codes = PHONE_COUNTRIES.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of PHONE_COUNTRIES) {
      expect(c.dial, c.code).toMatch(/^\d{1,3}$/)
      expect(c.length[0], c.code).toBeLessThanOrEqual(c.length[1])
    }
  })
})
