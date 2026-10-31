import { describe, expect, it } from 'vitest'

import { validateEmail } from '@/components/login-form'
import { formatBytes } from '@/components/ui/file-upload'
import { en } from '@/lib/i18n'

// Intl puts a no-break space before some units; compare with plain spaces.
const bytes = (n: number, locale: string) => formatBytes(n, locale).replace(/\s/g, ' ')

describe('formatBytes', () => {
  it('picks the largest unit and keeps one decimal below 10', () => {
    expect(bytes(78, 'en')).toBe('78 B')
    expect(bytes(1536, 'en')).toBe('1.5 kB')
    expect(bytes(2.3 * 1024 * 1024, 'en')).toBe('2.3 MB')
    expect(bytes(15 * 1024 * 1024, 'en')).toBe('15 MB')
  })

  it('speaks French', () => {
    expect(bytes(78, 'fr')).toBe('78 o')
    expect(bytes(2.3 * 1024 * 1024, 'fr')).toBe('2,3 Mo')
  })
})

describe('validateEmail', () => {
  it('accepts addresses and trims them', () => {
    expect(validateEmail('ada@acme.dev')).toBeUndefined()
    expect(validateEmail('  ada@acme.dev ')).toBeUndefined()
  })

  it('asks for an address, then for a valid one', () => {
    expect(validateEmail('')).toBe(en.auth.emailRequired)
    expect(validateEmail('   ')).toBe(en.auth.emailRequired)
    for (const text of ['ada', 'ada@', 'ada@acme', '@acme.dev', 'ada lovelace@acme.dev'])
      expect(validateEmail(text), text).toBe(en.auth.emailInvalid)
  })
})
