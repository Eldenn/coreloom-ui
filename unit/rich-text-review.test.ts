import { Slice } from '@tiptap/pm/model'
import { getSchema, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

import { parseAnswer, toNodes } from '@/components/ui/rich-text-ai'
import { suggestChanges } from '@/components/ui/rich-text-review'

const schema = getSchema([StarterKit.configure({ heading: { levels: [2, 3] } })])
const md = (answer: string) =>
  schema.nodeFromJSON({ type: 'doc', content: toNodes(parseAnswer(answer)) })
const fromJson = (content: JSONContent[]) => schema.nodeFromJSON({ type: 'doc', content })

/** Each change as "old → new" in plain text, so the cases read like the review bar. */
function changes(before: string, after: string) {
  const a = md(before)
  return suggestChanges(a, md(after)).map((c) => {
    const old = a.textBetween(c.from, c.to, '|')
    const next = c.content.textBetween(0, c.content.size, '|')
    return `${c.block ? 'block ' : ''}${old} → ${next}`
  })
}

/** Accepting every change, from the end, gives the new document. */
function acceptAll(before: string, after: string) {
  let doc = md(before)
  for (const c of suggestChanges(doc, md(after)).reverse())
    doc = doc.replace(c.from, c.to, new Slice(c.content, 0, 0))
  return doc
}

describe('editor review: word-level changes', () => {
  it('finds nothing when the text is the same', () => {
    expect(changes('Same text here.', 'Same text here.')).toEqual([])
    expect(changes('One\n\nTwo', 'One\n\nTwo')).toEqual([])
  })

  it('reports each changed word in place, and keeps the rest', () => {
    expect(
      changes('our new release make the build faster', 'our new release makes the build faster'),
    ).toEqual(['make → makes'])
  })

  it('joins changes split by a single space', () => {
    expect(changes('the quick brown fox', 'a fast brown fox')).toEqual(['the quick → a fast'])
  })

  it('keeps separate changes apart', () => {
    expect(
      changes('people was reporting since last month', 'people were reporting over the past month'),
    ).toEqual(['was → were', 'since last → over the past'])
  })

  it('handles pure insertions and deletions', () => {
    expect(changes('fixes bugs', 'fixes small bugs')).toEqual([' → small '])
    expect(changes('fixes many small bugs', 'fixes small bugs')).toEqual(['many  → '])
  })

  it('separates punctuation from words', () => {
    expect(changes('Faster builds.', 'Faster builds!')).toEqual(['. → !'])
  })

  it('treats a new mark as a change and keeps it in the content', () => {
    const before = md('builds faster now')
    const [change] = suggestChanges(before, md('builds **faster** now'))
    expect(before.textBetween(change.from, change.to)).toBe('faster')
    expect(change.content.firstChild?.marks.map((m) => m.type.name)).toEqual(['bold'])
  })

  it('accepting every change gives the suggested document', () => {
    const cases: [string, string][] = [
      ['our new release make the build faster', 'Our new release makes builds **faster**.'],
      ['One\n\nTwo\n\nThree', 'One\n\n## Two\n\nThree and more'],
      ['- a\n- b\n- c', '- a\n- B\n- c\n- d'],
      ['Intro\n\n1. first\n2. second', 'Intro, rewritten\n\n- first\n- second'],
      ['Gone\n\nKept', 'Kept'],
      ['', 'New text'],
    ]
    for (const [before, after] of cases)
      expect(acceptAll(before, after).toJSON(), `${before} → ${after}`).toEqual(md(after).toJSON())
  })
})

describe('editor review: block-level changes', () => {
  it('compares paragraphs in the same place word by word', () => {
    expect(changes('First one.\n\nSecond one.', 'First one!\n\nSecond two.')).toEqual([
      '. → !',
      'one → two',
    ])
  })

  it('replaces a block whose kind changed as a whole', () => {
    expect(changes('Title\n\nBody', '## Title\n\nBody')).toEqual(['block Title → Title'])
  })

  it('inserts and removes whole blocks', () => {
    expect(changes('One\n\nThree', 'One\n\nTwo\n\nThree')).toEqual(['block  → Two'])
    expect(changes('One\n\nTwo\n\nThree', 'One\n\nThree')).toEqual(['block Two → '])
  })

  it('looks inside lists item by item', () => {
    expect(changes('- flaky pickers\n- toasts', '- flaky date pickers\n- toasts')).toEqual([
      ' → date ',
    ])
    expect(changes('- a\n- b', '- a\n- b\n- c')).toEqual(['block  → c'])
  })

  it('keeps links and code as marks of the new words', () => {
    const before = fromJson([
      { type: 'paragraph', content: [{ type: 'text', text: 'see the docs' }] },
    ])
    const after = fromJson([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'see the ' },
          {
            type: 'text',
            text: 'docs',
            marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          },
        ],
      },
    ])
    const [change] = suggestChanges(before, after)
    expect(change.content.firstChild?.marks[0].attrs.href).toBe('https://example.com')
  })

  it('stays quick on a long document with one change', () => {
    const paragraphs = Array.from(
      { length: 400 },
      (_, i) => `Paragraph ${i} with some words in it.`,
    )
    const changed = [...paragraphs]
    changed[200] = 'Paragraph 200 with other words in it.'
    const started = performance.now()
    expect(changes(paragraphs.join('\n\n'), changed.join('\n\n'))).toEqual(['some → other'])
    expect(performance.now() - started).toBeLessThan(1000)
  })
})
