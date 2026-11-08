import { describe, expect, it } from 'vitest'

import { blogCategories, type BlogPost, readingTime } from '@/components/blog'
import { changeKinds, type ChangelogEntry, filterChangelog } from '@/components/changelog'
import {
  type CartLine,
  cartTotals,
  defaultSelection,
  findVariant,
  formatMoney,
  isValueAvailable,
  type Product,
} from '@/components/commerce'
import { type ComparisonGroup, differingFeatures } from '@/components/comparison-table'
import {
  acceptAll,
  type ConsentCategory,
  parseConsent,
  rejectAll,
} from '@/components/cookie-consent'
import { isEmail } from '@/components/newsletter'
import { levelBars } from '@/components/voice-agent'

describe('comparison table', () => {
  const groups: ComparisonGroup[] = [
    {
      id: 'a',
      name: 'A',
      features: [
        { id: 'same', name: 'Same', values: { free: true, pro: true } },
        { id: 'value', name: 'Value', values: { free: '1 GB', pro: '10 GB' } },
        // A missing plan reads as not included, so it equals false.
        { id: 'missing', name: 'Missing', values: { free: false } },
        { id: 'null', name: 'Null', values: { free: null, pro: false } },
      ],
    },
    { id: 'b', name: 'B', features: [{ id: 'all', name: 'All', values: { free: 'x', pro: 'x' } }] },
  ]

  it('keeps only the rows that differ, and drops groups left empty', () => {
    const result = differingFeatures(groups, ['free', 'pro'])
    expect(result.map((g) => g.id)).toEqual(['a'])
    expect(result[0].features.map((f) => f.id)).toEqual(['value'])
  })

  it('compares only the plans given', () => {
    expect(differingFeatures(groups, ['free'])).toEqual([])
  })
})

describe('changelog', () => {
  const entries: ChangelogEntry[] = [
    {
      id: '2',
      date: new Date(2026, 9, 2),
      title: 'Two',
      changes: [
        { kind: 'fixed', text: 'a' },
        { kind: 'new', text: 'b' },
      ],
    },
    { id: '1', date: new Date(2026, 8, 1), title: 'One', changes: [{ kind: 'new', text: 'c' }] },
    { id: '0', date: new Date(2026, 7, 1), title: 'Prose only' },
  ]

  it('lists the kinds an entry uses, in a fixed order', () => {
    expect(changeKinds(entries[0])).toEqual(['new', 'fixed'])
    expect(changeKinds(entries[2])).toEqual([])
  })

  it('filters entries by kind, keeping only matching changes', () => {
    const fixes = filterChangelog(entries, ['fixed'])
    expect(fixes.map((e) => e.id)).toEqual(['2'])
    expect(fixes[0].changes).toEqual([{ kind: 'fixed', text: 'a' }])
    // No kinds: everything, untouched (entries without changes included).
    expect(filterChangelog(entries, [])).toBe(entries)
  })
})

describe('blog', () => {
  it('estimates reading time, at least one minute', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime('word '.repeat(460))).toBe(2)
    expect(readingTime('  spaced\n\nout\twords  ', 1)).toBe(3)
  })

  it('lists categories once, in order of appearance', () => {
    const post = (id: string, category?: string): BlogPost => ({
      id,
      title: id,
      href: `/${id}`,
      category,
      date: new Date(2026, 9, 1),
      authors: [],
    })
    expect(
      blogCategories([post('a', 'Design'), post('b'), post('c', 'Code'), post('d', 'Design')]),
    ).toEqual(['Design', 'Code'])
  })
})

describe('newsletter', () => {
  it('accepts plausible addresses and refuses the rest', () => {
    expect(isEmail('ada@coreloom.dev')).toBe(true)
    expect(isEmail('  ada@coreloom.dev  ')).toBe(true)
    expect(isEmail('ada@coreloom')).toBe(false)
    expect(isEmail('ada coreloom@x.dev')).toBe(false)
    expect(isEmail('')).toBe(false)
    expect(isEmail('@x.dev')).toBe(false)
  })
})

describe('cookie consent', () => {
  const categories: ConsentCategory[] = [
    { id: 'necessary', name: 'Necessary', required: true },
    { id: 'analytics', name: 'Analytics' },
    { id: 'marketing', name: 'Marketing' },
  ]

  it('accepts or rejects everything, required categories always on', () => {
    expect(acceptAll(categories)).toEqual({ necessary: true, analytics: true, marketing: true })
    expect(rejectAll(categories)).toEqual({ necessary: true, analytics: false, marketing: false })
  })

  it('reads stored choices back, dropping unknown ids and forcing required ones', () => {
    expect(parseConsent('{"analytics":true,"ads":true,"necessary":false}', categories)).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    })
    expect(parseConsent({ marketing: 'yes' }, categories)).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  })

  it('gives null for anything unreadable or from other categories', () => {
    expect(parseConsent(null, categories)).toBeNull()
    expect(parseConsent('not json', categories)).toBeNull()
    expect(parseConsent('[true]', categories)).toBeNull()
    expect(parseConsent('42', categories)).toBeNull()
    expect(parseConsent('{"ads":true}', categories)).toBeNull()
    expect(parseConsent('{"__proto__":{"analytics":true}}', categories)).toBeNull()
  })
})

describe('shop', () => {
  const product: Product = {
    id: 'throw',
    name: 'Throw',
    images: [],
    price: 89,
    options: [
      {
        id: 'color',
        name: 'Colour',
        values: [
          { value: 'sand', label: 'Sand' },
          { value: 'ink', label: 'Ink' },
        ],
      },
      {
        id: 'size',
        name: 'Size',
        values: [
          { value: 's', label: 'S' },
          { value: 'l', label: 'L' },
        ],
      },
    ],
    variants: [
      { id: 'sand-s', options: { color: 'sand', size: 's' }, price: 89, stock: 0 },
      { id: 'sand-l', options: { color: 'sand', size: 'l' }, price: 119, stock: 2 },
      { id: 'ink-s', options: { color: 'ink', size: 's' }, price: 89 },
      { id: 'ink-l', options: { color: 'ink', size: 'l' }, price: 119, stock: 0 },
    ],
  }

  it('finds the variant of a complete selection', () => {
    expect(findVariant(product, { color: 'ink', size: 'l' })?.id).toBe('ink-l')
    expect(findVariant(product, { color: 'ink' })).toBeUndefined()
    expect(findVariant(product, { color: 'red', size: 's' })).toBeUndefined()
  })

  it('says which values lead to a variant in stock', () => {
    expect(isValueAvailable(product, { color: 'sand', size: 's' }, 'size', 's')).toBe(false)
    expect(isValueAvailable(product, { color: 'sand', size: 's' }, 'size', 'l')).toBe(true)
    expect(isValueAvailable(product, { color: 'sand', size: 'l' }, 'color', 'ink')).toBe(false)
    // No stock given means no limit.
    expect(isValueAvailable(product, { color: 'sand', size: 's' }, 'color', 'ink')).toBe(true)
    expect(
      isValueAvailable({ ...product, variants: undefined, stock: 0 }, {}, 'color', 'sand'),
    ).toBe(false)
  })

  it('starts from the first variant in stock', () => {
    expect(defaultSelection(product)).toEqual({ color: 'sand', size: 'l' })
    expect(defaultSelection({ ...product, variants: undefined })).toEqual({
      color: 'sand',
      size: 's',
    })
  })

  const lines: CartLine[] = [
    { id: 'a', name: 'A', unitPrice: 0.1, quantity: 1 },
    { id: 'b', name: 'B', unitPrice: 0.2, quantity: 1 },
    { id: 'c', name: 'C', unitPrice: 19.99, quantity: 3 },
  ]

  it('sums in cents', () => {
    const totals = cartTotals(lines)
    expect(totals.subtotal).toBe(60.27)
    expect(totals.total).toBe(60.27)
    expect(totals.count).toBe(5)
    expect(totals.shipping).toBeNull()
  })

  it('applies a discount, shipping and tax on top', () => {
    const totals = cartTotals(lines, {
      discount: { type: 'percent', value: 10 },
      shipping: 4.9,
      taxRate: 0.2,
    })
    expect(totals.discount).toBe(6.03)
    expect(totals.tax).toBe(10.85)
    expect(totals.total).toBe(69.99)
  })

  it('takes the included tax out of the prices, and frees shipping above a threshold', () => {
    const totals = cartTotals([{ id: 'x', name: 'X', unitPrice: 120, quantity: 1 }], {
      shipping: 6.9,
      freeShippingFrom: 100,
      taxRate: 0.2,
      taxIncluded: true,
    })
    expect(totals.tax).toBe(20)
    expect(totals.shipping).toBe(0)
    expect(totals.total).toBe(120)
  })

  it('never takes off more than the subtotal, nor counts negative quantities', () => {
    const totals = cartTotals(
      [{ id: 'x', name: 'X', unitPrice: 10, quantity: -2 }, ...lines.slice(0, 1)],
      {
        discount: { type: 'amount', value: 50 },
        shipping: 5,
      },
    )
    expect(totals.subtotal).toBe(0.1)
    expect(totals.discount).toBe(0.1)
    // An empty (fully discounted) cart ships for free.
    expect(totals.total).toBe(0)
    expect(totals.count).toBe(1)
  })

  it('formats money for the locale', () => {
    expect(formatMoney(12.5, 'EUR', 'en')).toBe('€12.50')
    expect(formatMoney(24, 'EUR', 'en')).toBe('€24')
    expect(formatMoney(12.5, 'EUR', 'fr').replace(/\s/g, ' ')).toBe('12,50 €')
  })
})

describe('voice level', () => {
  it('scales a fixed shape by the level, never flat, clamped to 0..1', () => {
    const quiet = levelBars(0, 8)
    expect(quiet).toHaveLength(8)
    expect(quiet.every((h) => h === 0.08)).toBe(true)
    const loud = levelBars(1, 9)
    expect(Math.max(...loud)).toBeLessThanOrEqual(1)
    // The middle moves most.
    expect(loud[4]).toBeGreaterThan(loud[0])
    expect(levelBars(5, 9)).toEqual(loud)
    expect(levelBars(Number.NaN, 3)).toEqual(levelBars(0, 3))
  })
})
