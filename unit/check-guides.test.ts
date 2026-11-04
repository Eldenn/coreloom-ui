import { describe, expect, it } from 'vitest'

import {
  claimedProps,
  codeIdentifiers,
  propParagraphs,
  staleClaims,
  undocumentedProps,
  // @ts-expect-error -- a Node build script without types; its exports are checked below.
} from '../build/check-guides.mjs'

interface Passage {
  component: string | undefined
  text: string
}

const claims = claimedProps as (text: string) => string[]
const passagesOf = propParagraphs as (markdown: string) => Passage[]
const identifiers = codeIdentifiers as (markdown: string) => Set<string>
const stale = staleClaims as (input: {
  guide: string
  passages: Passage[]
  namesOf: (component?: string) => Set<string> | undefined
  elsewhere: (name: string) => Iterable<string>
}) => string[]
const undocumented = undocumentedProps as (input: {
  guide: string
  markdown: string
  ownProps: string[]
}) => string[]

describe('guide check', () => {
  it('claims the props outside parentheses, cut to their name', () => {
    expect(
      claims(
        '`value` + `onValueChange` (or `defaultValue`), `size` (`sm`, `lg`), `onSearch(query)`, `aria-label`, `Toaster`, `field.TextField`, `toast()`, `action: { label }`, `true`',
      ),
    ).toEqual(['value', 'onValueChange', 'size', 'onSearch'])
  })

  it('splits a paragraph at each **`Name` takes**', () => {
    const markdown =
      '# X\n\nIntro with `ignored`.\n\n**`RunList` takes** `runs`. **`RunTrace` takes** `run` and `spans`.\n\n**The consumer provides** `items`.'
    expect(passagesOf(markdown)).toEqual([
      { component: 'RunList', text: ' `runs`. ' },
      { component: 'RunTrace', text: ' `run` and `spans`.' },
      { component: undefined, text: ' `items`.' },
    ])
  })

  it('reports names the code lacks, unless a component the passage names has them', () => {
    const own = new Set(['value', 'onValueChange'])
    const chat = new Set(['tools'])
    const namesOf = (component?: string) => (component === 'Missing' ? undefined : own)
    const elsewhere = (name: string) => (name === 'Chat' ? chat : [])
    const passages: Passage[] = [
      { component: undefined, text: '`value`, `maxStars` and `Chat`’s `tools`' },
      { component: 'Missing', text: '`value`' },
    ]
    expect(stale({ guide: 'Rating', passages, namesOf, elsewhere })).toEqual([
      'Rating: `maxStars` is not a prop of its components',
      'Rating: no exported component `Missing` in its items',
    ])
  })

  it('reports own props the guide never shows as code, ignoring pass-through props', () => {
    const markdown = '`<Hero title>`\n\n```tsx\n<Hero glow />\n```\n\nThe eyebrow, in prose only.'
    expect(identifiers(markdown).has('glow')).toBe(true)
    expect(
      undocumented({
        guide: 'Hero',
        markdown,
        ownProps: ['title', 'glow', 'eyebrow', 'className', 'contentClassName', 'aria-label'],
      }),
    ).toEqual(['Hero: prop `eyebrow` of Hero is not in the guide'])
  })
})
