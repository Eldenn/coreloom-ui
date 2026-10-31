import { getSchema, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

import { parseAnswer, parseInline, toMarkdown, toNodes } from '@/components/ui/rich-text-ai'

const schema = getSchema([StarterKit.configure({ heading: { levels: [2, 3] } })])
const doc = (answer: string) =>
  schema.nodeFromJSON({ type: 'doc', content: toNodes(parseAnswer(answer)) })
const fromJson = (content: JSONContent[]) => schema.nodeFromJSON({ type: 'doc', content })
const text = (
  t: string,
  ...marks: (string | { type: string; attrs: Record<string, string> })[]
): JSONContent => ({
  type: 'text',
  text: t,
  ...(marks.length ? { marks: marks.map((m) => (typeof m === 'string' ? { type: m } : m)) } : {}),
})
const plain = (s: string) =>
  parseInline(s).map((i) => [i.text, i.marks.join('+'), i.href ?? ''].filter(Boolean).join(':'))

describe('editor AI: emphasis only at word edges', () => {
  it('leaves identifiers, paths, snake_case and maths alone', () => {
    for (const s of [
      'Set MAX_RETRY_COUNT to 3',
      'Open file_name_here.ts',
      '2*3*4 = 24',
      'a snake_case_name',
      'src/*/index.ts and **/*.md',
      'a * b * c',
      'x_1 + y_2',
      '__init__.py',
    ]) {
      expect(parseInline(s), s).toEqual([{ text: s, marks: [] }])
    }
  })

  it('reads **bold**, *em*, _em_, __bold__, ~~strike~~ and `code`', () => {
    expect(plain('**bold** *em* _em_ __b__ ~~gone~~ `x_y*z`')).toEqual([
      'bold:bold',
      ' ',
      'em:italic',
      ' ',
      'em:italic',
      ' ',
      'b:bold',
      ' ',
      'gone:strike',
      ' ',
      'x_y*z:code',
    ])
    expect(plain('**bold with *em* inside**')).toEqual([
      'bold with :bold',
      'em:bold+italic',
      ' inside:bold',
    ])
    expect(plain('(*aside*), then **done**.')).toEqual([
      '(',
      'aside:italic',
      '), then ',
      'done:bold',
      '.',
    ])
  })

  it('needs text just inside the markers, and honours backslash escapes', () => {
    expect(parseInline('** not bold **')).toEqual([{ text: '** not bold **', marks: [] }])
    expect(parseInline('\\*literal\\* and \\_too\\_')).toEqual([
      { text: '*literal* and _too_', marks: [] },
    ])
  })
})

describe('editor AI: links, underline and HTML', () => {
  it('keeps http(s) and mailto links, drops any other address but keeps its text', () => {
    expect(
      parseInline('See [the **docs**](https://example.com/a_b) or [mail](mailto:a@b.co).'),
    ).toEqual([
      { text: 'See ', marks: [] },
      { text: 'the ', marks: [], href: 'https://example.com/a_b' },
      { text: 'docs', marks: ['bold'], href: 'https://example.com/a_b' },
      { text: ' or ', marks: [] },
      { text: 'mail', marks: [], href: 'mailto:a@b.co' },
      { text: '.', marks: [] },
    ])
    expect(parseInline('[click](javascript:alert(1))')[0]).toEqual({ text: 'click', marks: [] })
    expect(parseInline('[x](data:text/html,hi)')).toEqual([{ text: 'x', marks: [] }])
  })

  it('maps <u>…</u> to underline and leaves every other tag as text', () => {
    expect(plain('<u>under</u> <b>bold</b>')).toEqual(['under:underline', ' <b>bold</b>'])
    const node = doc('<img src=x onerror="alert(1)"> <b>hi</b>')
    expect(node.textContent).toBe('<img src=x onerror="alert(1)"> <b>hi</b>')
    expect(node.firstChild!.firstChild!.marks).toHaveLength(0)
  })
})

describe('editor AI: blocks', () => {
  it('reads headings, lists, quotes and code', () => {
    expect(
      parseAnswer('# Title\n\n- one\n- two\n\n1. a\n2) b\n\n> quote').map((b) => b.type),
    ).toEqual(['heading', 'bullets', 'numbers', 'quote'])
    expect(parseAnswer('```\nconst a = 1\n```')).toEqual([{ type: 'code', text: 'const a = 1' }])
    expect(parseAnswer('')).toEqual([])
    expect(parseAnswer('\n\n  \n')).toEqual([])
  })

  it('joins soft line breaks with a space and keeps hard ones (trailing \\ or two spaces)', () => {
    const [soft] = toNodes(parseAnswer('one\ntwo'))
    expect(soft.content).toEqual([text('one two')])
    const [hard] = toNodes(parseAnswer('one\\\ntwo  \nthree'))
    expect(hard.content).toEqual([
      text('one'),
      { type: 'hardBreak' },
      text('two'),
      { type: 'hardBreak' },
      text('three'),
    ])
  })

  it("nests lists by indentation and keeps an ordered list's start", () => {
    const node = doc('3. three\n4. four\n   - sub a\n   - sub b\n     1. deep\n5. five')
    expect(node.childCount).toBe(1)
    const list = node.firstChild!
    expect(list.type.name).toBe('orderedList')
    expect(list.attrs.start).toBe(3)
    expect(list.childCount).toBe(3)
    expect(list.child(1).child(1).type.name).toBe('bulletList')
    expect(list.child(1).child(1).child(1).child(1).type.name).toBe('orderedList')
    expect(() => {
      node.check()
    }).not.toThrow()
  })
})

describe("editor AI: the editor's text goes out and comes back the same", () => {
  it('round-trips marks, links, breaks, nested lists and code', () => {
    const answer =
      '## Plan\n\nShip **faster** with *fewer* `bugs`, ~~later~~ <u>now</u>, see [the docs](https://example.com).\\\nNext line.\n\n- one\n  - nested\n- two\n\n3. third\n4. fourth\n\n> Ship small.\n\n---\n\n```\nnpm run build\n```'
    const node = doc(answer)
    expect(() => {
      node.check()
    }).not.toThrow()
    expect(toMarkdown(node)).toBe(answer)
  })

  it('keeps a link when a paragraph goes out and comes back (fix grammar)', () => {
    const original = fromJson([
      {
        type: 'paragraph',
        content: [
          text('Thanks to everyone who tested '),
          text('the beta', { type: 'link', attrs: { href: 'https://example.com/beta' } }),
          text('.'),
        ],
      },
    ])
    const out = toMarkdown(original)
    expect(out).toBe('Thanks to everyone who tested [the beta](https://example.com/beta).')
    const back = doc(out.replace('Thanks', 'Thank you'))
    const link = back.firstChild!.child(1)
    expect(link.text).toBe('the beta')
    expect(link.marks[0].type.name).toBe('link')
    expect(link.marks[0].attrs.href).toBe('https://example.com/beta')
  })

  it('escapes text that would read as Markdown, but not identifiers', () => {
    const original = fromJson([
      { type: 'paragraph', content: [text('# not a heading')] },
      { type: 'paragraph', content: [text('---')] },
      {
        type: 'paragraph',
        content: [text('1. not a list, *not em*, [not a link](x), MAX_RETRY_COUNT, 2*3')],
      },
      { type: 'paragraph', content: [text('bold ', 'bold'), text('then plain')] },
    ])
    const out = toMarkdown(original)
    expect(out).toContain('MAX_RETRY_COUNT')
    expect(out).toContain('**bold** then plain')
    const back = doc(out)
    expect(back.childCount).toBe(4)
    expect(back.child(0).textContent).toBe('# not a heading')
    expect(back.child(1).textContent).toBe('---')
    expect(back.child(2).textContent).toBe(
      '1. not a list, *not em*, [not a link](x), MAX_RETRY_COUNT, 2*3',
    )
    expect(back.child(2).firstChild!.marks).toHaveLength(0)
    expect(back.child(3).firstChild!.marks.map((m) => m.type.name)).toEqual(['bold'])
  })
})
