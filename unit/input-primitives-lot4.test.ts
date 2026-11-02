import { describe, expect, it } from 'vitest'

import { parseJson } from '@/components/ui/json-input'
import { mentionsIn } from '@/components/ui/mention-textarea'
import { flattenTree } from '@/components/ui/tree-select'

describe('parseJson', () => {
  it('returns the parsed value', () => {
    expect(parseJson('{"a": [1, 2]}')).toEqual({ ok: true, value: { a: [1, 2] } })
  })

  it('says on which line and column it breaks', () => {
    const result = parseJson('{\n  "a": 1,\n  "b": oops\n}')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.at).toEqual({ line: 3, column: 8 })
  })

  it.each([
    ['{"a": 1,}', { line: 1, column: 9 }],
    ['[1, 2', { line: 1, column: 6 }],
    ['{"a": "b}', { line: 1, column: 10 }],
    ['{"a": 1} x', { line: 1, column: 10 }],
    ["{'a': 1}", { line: 1, column: 2 }],
  ])('%s breaks at %o', (text, at) => {
    const result = parseJson(text)
    expect(result.ok ? undefined : result.at).toEqual(at)
  })
})

describe('mentionsIn', () => {
  const people = [
    { value: 'ada', label: 'Ada' },
    { value: 'alan', label: 'Alan' },
  ]

  it('lists known handles once, in order', () => {
    expect(mentionsIn('@alan, can @ada and @alan look?', people)).toEqual(['alan', 'ada'])
  })

  it('ignores unknown handles and emails', () => {
    expect(mentionsIn('ask @bob or mail ada@example.com', people)).toEqual([])
  })

  it('works with another trigger', () => {
    expect(mentionsIn('see #ada', people, '#')).toEqual(['ada'])
  })
})

describe('flattenTree', () => {
  it('gives each node its level, parent and path', () => {
    const flat = flattenTree([
      { value: 'eng', label: 'Engineering', children: [{ value: 'fe', label: 'Frontend' }] },
      { value: 'design', label: 'Design' },
    ])
    expect(flat.map((f) => [f.node.value, f.level, f.parent, f.path.join(' / ')])).toEqual([
      ['eng', 1, undefined, 'Engineering'],
      ['fe', 2, 'eng', 'Engineering / Frontend'],
      ['design', 1, undefined, 'Design'],
    ])
  })
})
