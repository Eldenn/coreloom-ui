import { describe, expect, it } from 'vitest'

import { artifactFilename, type DiffLine, diffLines } from '@/components/ai-artifact'

/** Each line as "+text", "-text" or " text", so the cases read like a unified diff. */
const unified = (lines: DiffLine[]) =>
  lines.map((l) => (l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ' ') + l.text)

describe('diffLines', () => {
  it('keeps identical texts as equal lines, numbered on both sides', () => {
    const lines = diffLines('a\nb', 'a\nb')
    expect(lines).toEqual([
      { type: 'equal', text: 'a', oldLine: 1, newLine: 1 },
      { type: 'equal', text: 'b', oldLine: 2, newLine: 2 },
    ])
  })

  it('finds a changed line in the middle, removal before addition', () => {
    expect(unified(diffLines('a\nb\nc', 'a\nB\nc'))).toEqual([' a', '-b', '+B', ' c'])
  })

  it('numbers added and removed lines on their own side only', () => {
    const lines = diffLines('a\nb\nc', 'a\nc\nd')
    expect(lines).toEqual([
      { type: 'equal', text: 'a', oldLine: 1, newLine: 1 },
      { type: 'remove', text: 'b', oldLine: 2 },
      { type: 'equal', text: 'c', oldLine: 3, newLine: 2 },
      { type: 'add', text: 'd', newLine: 3 },
    ])
  })

  it('handles empty texts on either side', () => {
    expect(diffLines('', '')).toEqual([])
    expect(unified(diffLines('', 'a\nb'))).toEqual(['+a', '+b'])
    expect(unified(diffLines('a', ''))).toEqual(['-a'])
  })

  it('treats Windows and old Mac line endings as newlines', () => {
    expect(unified(diffLines('a\r\nb', 'a\rb\nc'))).toEqual([' a', ' b', '+c'])
  })

  it('keeps lines that moved as common when the rest allows it', () => {
    expect(unified(diffLines('x\na\nb\nc', 'a\nb\nc\nx'))).toEqual(['-x', ' a', ' b', ' c', '+x'])
  })

  it('keeps blank lines and whitespace as they are', () => {
    expect(unified(diffLines('a\n\n  b', 'a\n\n b'))).toEqual([' a', ' ', '-  b', '+ b'])
  })

  it('falls back to a full rewrite of the middle when the texts are huge', () => {
    const a = Array.from({ length: 2100 }, (_, i) => `a${i}`)
    const b = Array.from({ length: 2100 }, (_, i) => `b${i}`)
    const lines = diffLines(['head', ...a, 'tail'].join('\n'), ['head', ...b, 'tail'].join('\n'))
    expect(lines).toHaveLength(2 + 4200)
    expect(lines[0]).toMatchObject({ type: 'equal', text: 'head' })
    expect(lines[1]).toMatchObject({ type: 'remove', text: 'a0' })
    expect(lines[2101]).toMatchObject({ type: 'add', text: 'b0' })
    expect(lines.at(-1)).toMatchObject({
      type: 'equal',
      text: 'tail',
      oldLine: 2102,
      newLine: 2102,
    })
  })
})

describe('artifactFilename', () => {
  it('uses the given file name as it is', () => {
    expect(artifactFilename({ title: 'x', kind: 'code', filename: 'Button.tsx' })).toBe(
      'Button.tsx',
    )
  })

  it('slugs the title and picks the extension from the kind or language', () => {
    expect(artifactFilename({ title: 'Release notes — v2', kind: 'markdown' })).toBe(
      'release-notes-v2.md',
    )
    expect(artifactFilename({ title: 'Fetch users', kind: 'code', language: 'TypeScript' })).toBe(
      'fetch-users.ts',
    )
    expect(artifactFilename({ title: 'Query', kind: 'code', language: 'brainfuck' })).toBe(
      'query.txt',
    )
    expect(artifactFilename({ title: 'Lettre à Léa', kind: 'text' })).toBe('lettre-a-lea.txt')
  })

  it('falls back to "artifact" when the title has nothing usable', () => {
    expect(artifactFilename({ title: '¿¡…!?', kind: 'markdown' })).toBe('artifact.md')
    expect(artifactFilename({ title: '../../etc/passwd', kind: 'text' })).toBe('etc-passwd.txt')
  })
})
