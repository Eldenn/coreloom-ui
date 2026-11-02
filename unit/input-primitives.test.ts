import { describe, expect, it } from 'vitest'

import { countCharacters } from '@/components/ui/character-count'
import { normalizeHex } from '@/components/ui/color-picker'
import {
  applyMask,
  isValidIban,
  isValidLuhn,
  maskLength,
  maskPresets,
} from '@/components/ui/masked-input'
import { parseNumber, stepNumber } from '@/components/ui/number-input'
import { formatTime, parseTime, timeOptions } from '@/components/ui/time-picker'

describe('parseNumber', () => {
  it('reads English and French numbers', () => {
    expect(parseNumber('1,234.5', 'en')).toBe(1234.5)
    expect(parseNumber('1 234,5', 'fr')).toBe(1234.5)
    expect(parseNumber('1 234,5', 'fr')).toBe(1234.5)
    expect(parseNumber('1.234,5', 'de')).toBe(1234.5)
    expect(parseNumber('-12', 'en')).toBe(-12)
    expect(parseNumber('−12', 'en')).toBe(-12)
    expect(parseNumber('.5', 'en')).toBe(0.5)
  })

  it('ignores units around the number and reads percents as fractions', () => {
    expect(parseNumber('2.5 kg', 'en')).toBe(2.5)
    expect(parseNumber('45 %', 'fr', { percent: true })).toBe(0.45)
    expect(parseNumber('15%', 'en', { percent: true })).toBe(0.15)
  })

  it('returns null for empty or unreadable text', () => {
    expect(parseNumber('', 'en')).toBeNull()
    expect(parseNumber('   ', 'en')).toBeNull()
    expect(parseNumber('-', 'en')).toBeNull()
    expect(parseNumber('abc', 'en')).toBeNull()
    expect(parseNumber('1.2.3', 'en')).toBeNull()
    expect(parseNumber('12a4', 'en')).toBeNull()
    expect(parseNumber('Infinity', 'en')).toBeNull()
  })
})

describe('stepNumber', () => {
  it('steps without floating-point noise', () => {
    expect(stepNumber(0.1, 2, { step: 0.1 })).toBe(0.3)
    expect(stepNumber(0.2, 1, { step: 0.1 })).toBe(0.3)
    expect(stepNumber(1.05, -1, { step: 0.05 })).toBe(1)
  })

  it('clamps to the bounds', () => {
    expect(stepNumber(9, 5, { max: 10 })).toBe(10)
    expect(stepNumber(1, -5, { min: 0 })).toBe(0)
  })

  it('starts an empty field at the bound it moves from, or at 0', () => {
    expect(stepNumber(null, 1, { min: 5 })).toBe(5)
    expect(stepNumber(null, -1, { max: 20 })).toBe(20)
    expect(stepNumber(null, 1)).toBe(0)
  })
})

describe('parseTime', () => {
  it('reads 24-hour times in several shapes', () => {
    expect(parseTime('14:30')).toBe('14:30')
    expect(parseTime('9:05')).toBe('09:05')
    expect(parseTime('14h30')).toBe('14:30')
    expect(parseTime('14h')).toBe('14:00')
    expect(parseTime('14.30')).toBe('14:30')
    expect(parseTime('1430')).toBe('14:30')
    expect(parseTime('930')).toBe('09:30')
    expect(parseTime('7')).toBe('07:00')
  })

  it('reads 12-hour times', () => {
    expect(parseTime('2:30 pm')).toBe('14:30')
    expect(parseTime('2pm')).toBe('14:00')
    expect(parseTime('12 a.m.')).toBe('00:00')
    expect(parseTime('12:15 PM')).toBe('12:15')
    expect(parseTime('11 am')).toBe('11:00')
  })

  it('rejects impossible or unreadable times', () => {
    expect(parseTime('')).toBeUndefined()
    expect(parseTime('24:00')).toBeUndefined()
    expect(parseTime('12:60')).toBeUndefined()
    expect(parseTime('13 pm')).toBeUndefined()
    expect(parseTime('0 am')).toBeUndefined()
    expect(parseTime('1:5')).toBeUndefined()
    expect(parseTime('noon')).toBeUndefined()
    expect(parseTime('12345')).toBeUndefined()
  })
})

describe('formatTime and timeOptions', () => {
  it("shows the time in the locale's clock", () => {
    expect(formatTime('14:30', 'en-US')).toMatch(/^2:30\sPM$/)
    expect(formatTime('14:30', 'fr')).toBe('14:30')
    expect(formatTime('09:05', 'fr')).toBe('09:05')
    expect(formatTime(undefined, 'fr')).toBe('')
    expect(formatTime('nope', 'fr')).toBe('')
  })

  it('lists times every step between the bounds', () => {
    expect(timeOptions(30, '09:00', '11:00')).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00'])
    expect(timeOptions(60)).toHaveLength(24)
    expect(timeOptions(15, '23:30')).toEqual(['23:30', '23:45'])
  })
})

describe('applyMask', () => {
  it('groups typed or pasted characters and drops what does not fit', () => {
    expect(applyMask('4970101234567890', '9999 9999 9999 9999').formatted).toBe(
      '4970 1012 3456 7890',
    )
    expect(applyMask('4970 1012-3456', '9999 9999 9999 9999')).toEqual({
      formatted: '4970 1012 3456',
      raw: '497010123456',
    })
    expect(applyMask('ab123cd', 'aa-999-aa').formatted).toBe('AB-123-CD')
    expect(applyMask('1b', 'aa-999-aa').raw).toBe('B')
    expect(applyMask('', '9999').formatted).toBe('')
  })

  it('never ends on a separator', () => {
    expect(applyMask('4970', '9999 9999').formatted).toBe('4970')
  })

  it('sizes the IBAN mask by country', () => {
    const { mask } = maskPresets.iban
    expect(maskLength(mask, 'FR')).toBe(27)
    expect(maskLength(mask, 'DE')).toBe(22)
    expect(applyMask('fr7630006000011234567890189', mask).formatted).toBe(
      'FR76 3000 6000 0112 3456 7890 189',
    )
  })
})

describe('number checks', () => {
  it('checks IBANs by length and mod 97', () => {
    expect(isValidIban('FR7630006000011234567890189')).toBe(true)
    expect(isValidIban('DE89370400440532013000')).toBe(true)
    expect(isValidIban('GB82 WEST 1234 5698 7654 32')).toBe(true)
    expect(isValidIban('FR7630006000011234567890188')).toBe(false)
    expect(isValidIban('FR763000600001123456789018')).toBe(false)
    expect(isValidIban('not an iban')).toBe(false)
  })

  it('checks Luhn numbers (cards, SIREN, SIRET)', () => {
    expect(isValidLuhn('4970101234567893')).toBe(true)
    expect(isValidLuhn('4970101234567890')).toBe(false)
    expect(isValidLuhn('732829320')).toBe(true)
    expect(isValidLuhn('73282932000074')).toBe(true)
    expect(isValidLuhn('')).toBe(false)
    expect(isValidLuhn('12a4')).toBe(false)
  })
})

describe('normalizeHex and countCharacters', () => {
  it('reads short and long hex colours', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('14b8a6')).toBe('#14b8a6')
    expect(normalizeHex('#12345')).toBeUndefined()
    expect(normalizeHex('red')).toBeUndefined()
  })

  it('counts what people see as characters', () => {
    expect(countCharacters('café')).toBe(4)
    expect(countCharacters('👍🏽 ok')).toBe(4)
    expect(countCharacters('')).toBe(0)
  })
})
