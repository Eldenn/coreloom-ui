'use client'

// Coreloom UI — RichTextAi. The AI panel of RichTextEditor: ask for an edit, or pick a quick action
// (improve, shorten, translate…), watch the answer stream in, then replace the selection or insert
// it below. The app sends the request to its model through `onRequest`; nothing here calls an API.
// The model's text is read as light Markdown and inserted as text nodes, never as HTML.
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { type Editor, Extension, type JSONContent } from '@tiptap/react'
import {
  ArrowUpIcon,
  ChevronRightIcon,
  ExpandIcon,
  LanguagesIcon,
  RotateCcwIcon,
  ShrinkIcon,
  SparklesIcon,
  SpellCheckIcon,
  SquareIcon,
  TextQuoteIcon,
  WandSparklesIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** What the person asked for: a quick action, or "custom" with their own `prompt`. */
type RichTextAiAction =
  'improve' | 'shorten' | 'lengthen' | 'fixGrammar' | 'translate' | 'summarise' | 'custom'

/** One request, without the text it applies to. `language` (BCP 47) is the target of "translate". */
interface RichTextAiCommand {
  action: RichTextAiAction
  prompt?: string
  language?: string
}

type RichTextAiRequest = RichTextAiCommand & {
  /** The selection as light Markdown (headings, lists, bold…), or the whole document when nothing is selected. */
  text: string
  /** Whether `text` is the selection or the whole document. */
  scope: 'selection' | 'document'
  /** Aborted when the person presses Stop, closes the panel or asks again: pass it to fetch / streamText. */
  signal: AbortSignal
}

interface RichTextAiOptions {
  /** Sends the request to your model. Return the text pieces as they stream (each one is appended), or the whole text. */
  onRequest: (request: RichTextAiRequest) => AsyncIterable<string> | Promise<string>
  /** The quick actions offered, in this order. Default: all of them. */
  actions?: Exclude<RichTextAiAction, 'custom'>[]
  /** Languages "Translate" offers, as BCP 47 codes, named in the reader's language. Default: en, fr, es, de. */
  languages?: string[]
  /** Opens the panel on mount; with a command, runs it right away (a "Draft with AI" page). */
  defaultOpen?: boolean | RichTextAiCommand
}

const QUICK_ACTIONS: Exclude<RichTextAiAction, 'custom'>[] = [
  'improve',
  'fixGrammar',
  'shorten',
  'lengthen',
  'summarise',
  'translate',
]
const ICONS = {
  improve: WandSparklesIcon,
  fixGrammar: SpellCheckIcon,
  shorten: ShrinkIcon,
  lengthen: ExpandIcon,
  summarise: TextQuoteIcon,
  translate: LanguagesIcon,
}

// ——— Text in and out: the editor's content as light Markdown, and the model's answer back to nodes.
// Emphasis follows CommonMark's flanking rules, a little stricter: `*` and `_` only open and close
// at word edges, so MAX_RETRY_COUNT, file_name.ts, __init__.py, src/*/x.ts and 2*3*4 stay as written. Links keep only
// http(s) and mailto addresses; underline travels as <u>…</u>, the one tag read back (as a mark).

type Mark = 'bold' | 'italic' | 'code' | 'strike' | 'underline'
/** A run of text with its marks; a lone "\n" is a hard line break. */
interface Inline {
  text: string
  marks: Mark[]
  href?: string
}
interface ListItem {
  inline: Inline[]
  lists: ListBlock[]
}
interface ListBlock {
  type: 'bullets' | 'numbers'
  start: number
  items: ListItem[]
}
type Block =
  | { type: 'paragraph' | 'quote'; inline: Inline[] }
  | { type: 'heading'; level: 2 | 3; inline: Inline[] }
  | ListBlock
  | { type: 'code'; text: string }
  | { type: 'rule' }

const WORD = /[\p{L}\p{N}]/u
const SPACE = /\s/
const SAFE_HREF = /^(https?:\/\/|mailto:)/i
const ESCAPABLE = /[\\`*_~[\]()<>#+\-.!|]/
const DELIMITERS = ['**', '__', '~~', '*', '_'] as const
const MARK_OF: Record<(typeof DELIMITERS)[number], Mark> = {
  '**': 'bold',
  __: 'bold',
  '~~': 'strike',
  '*': 'italic',
  _: 'italic',
}

const isWord = (c: string | undefined) => c !== undefined && WORD.test(c)
const withMark = (marks: Mark[], mark: Mark) => (marks.includes(mark) ? marks : [...marks, mark])
// An opener follows the start, a space or punctuation, and is followed by text (or an opening mark or
// bracket, not a slash or a dot, so globs like src/*/x.ts stay as written); a closer mirrors it.
const OPENS_ON = /[\p{L}\p{N}*_~`'"([{“‘<]/u
const canOpen = (s: string, i: number, n: number) =>
  !isWord(s[i - 1]) && i + n < s.length && OPENS_ON.test(s[i + n])
// A closer followed by a dot or slash and more word (__init__.py, *x*/y) is part of a name, not a closer.
const canClose = (s: string, i: number, n: number) =>
  i > 0 &&
  !SPACE.test(s[i - 1]) &&
  !isWord(s[i + n]) &&
  !(/[./]/.test(s[i + n] ?? '') && isWord(s[i + n + 1]))

function findCloser(s: string, from: number, delimiter: string) {
  for (let j = from + 1; j < s.length; j++) {
    if (s[j] === '\\') {
      j++
      continue
    }
    if (!s.startsWith(delimiter, j)) continue
    // A single * or _ doesn't close inside a ** or __ run.
    if (delimiter.length === 1 && (s[j + 1] === delimiter || s[j - 1] === delimiter)) continue
    if (canClose(s, j, delimiter.length)) return j
  }
  return -1
}

function parseInline(s: string, marks: Mark[] = [], href?: string): Inline[] {
  const out: Inline[] = []
  let text = ''
  const push = (t: string, m: Mark[] = marks) =>
    t && out.push({ text: t, marks: m, ...(href ? { href } : {}) })
  const flush = () => {
    push(text)
    text = ''
  }
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\' && ESCAPABLE.test(s[i + 1] ?? '')) {
      text += s[i + 1]
      i += 2
      continue
    }
    if (c === '\n') {
      flush()
      out.push({ text: '\n', marks: [] })
      i++
      continue
    }
    if (c === '`') {
      const end = s.indexOf('`', i + 1)
      if (end > i + 1) {
        flush()
        push(s.slice(i + 1, end), withMark(marks, 'code'))
        i = end + 1
        continue
      }
    }
    if (s.startsWith('<u>', i)) {
      const end = s.indexOf('</u>', i + 3)
      if (end > i + 3) {
        flush()
        out.push(...parseInline(s.slice(i + 3, end), withMark(marks, 'underline'), href))
        i = end + 4
        continue
      }
    }
    if (c === '[' && !href) {
      const link = /^\[([^\]\n]+)\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/.exec(s.slice(i))
      if (link) {
        flush()
        // An address outside the allowlist (javascript:, data:…) keeps its text, not the link.
        out.push(...parseInline(link[1], marks, SAFE_HREF.test(link[2]) ? link[2] : undefined))
        i += link[0].length
        continue
      }
    }
    const delimiter = DELIMITERS.find((d) => s.startsWith(d, i))
    if (delimiter && canOpen(s, i, delimiter.length)) {
      const end = findCloser(s, i + delimiter.length, delimiter)
      if (end > 0) {
        flush()
        out.push(
          ...parseInline(
            s.slice(i + delimiter.length, end),
            withMark(marks, MARK_OF[delimiter]),
            href,
          ),
        )
        i = end + delimiter.length
        continue
      }
    }
    text += c
    i++
  }
  flush()
  return out
}

/** Reads a model's answer as light Markdown: paragraphs (hard breaks with a trailing \ or two spaces), ## headings,
 *  - and 1. lists (nested by indentation), > quotes, ``` code, **bold**, *italic*, ~~strike~~, `code`, [links](https://…). */
function parseAnswer(answer: string): Block[] {
  const blocks: Block[] = []
  const lines = answer.replace(/\r\n?/g, '\n').split('\n')
  let para = ''
  let open: { list: ListBlock; indent: number }[] = []
  const flush = () => {
    if (para.trim()) blocks.push({ type: 'paragraph', inline: parseInline(para.trim()) })
    para = ''
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      flush()
      open = []
      const code: string[] = []
      while (++i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i])
      blocks.push({ type: 'code', text: code.join('\n') })
      continue
    }
    if (!trimmed) {
      // A blank line ends a paragraph; a list carries on if the next item follows.
      flush()
      continue
    }
    const indent = line.length - line.trimStart().length
    const item = /^(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(trimmed)
    if (item) {
      flush()
      const type = item[1] ? 'bullets' : 'numbers'
      const entry: ListItem = { inline: parseInline(item[3]), lists: [] }
      while (open.length && open[open.length - 1].indent > indent) open.pop()
      let top = open.at(-1)
      if (top?.indent === indent && top.list.type !== type) {
        open.pop()
        top = open.at(-1)
      }
      if (top?.indent === indent) top.list.items.push(entry)
      else {
        const list: ListBlock = { type, start: item[2] ? Number(item[2]) : 1, items: [entry] }
        if (top) top.list.items[top.list.items.length - 1].lists.push(list)
        else {
          blocks.push(list)
          open = []
        }
        open.push({ list, indent })
      }
      continue
    }
    const top = open.at(-1)
    if (top && indent > top.indent) {
      // An indented line under an item continues it.
      const last = top.list.items[top.list.items.length - 1]
      last.inline.push({ text: ' ', marks: [] }, ...parseInline(trimmed))
      continue
    }
    open = []
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    const quote = /^>\s?(.*)$/.exec(trimmed)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush()
      blocks.push({ type: 'rule' })
    } else if (heading) {
      flush()
      blocks.push({
        type: 'heading',
        level: heading[1].length <= 2 ? 2 : 3,
        inline: parseInline(heading[2]),
      })
    } else if (quote) {
      flush()
      const last = blocks.at(-1)
      if (last?.type === 'quote')
        last.inline.push({ text: ' ', marks: [] }, ...parseInline(quote[1]))
      else blocks.push({ type: 'quote', inline: parseInline(quote[1]) })
    } else {
      // A line ending in a backslash or two spaces breaks the line; any other line break is a space.
      const hard = /(\\|\s{2,})$/.test(line) && !/\\\\$/.test(line)
      const body = hard ? trimmed.replace(/\\$/, '').trimEnd() : trimmed
      para += body + (hard ? '\n' : ' ')
    }
  }
  flush()
  return blocks
}

const markJson = (i: Inline) => [
  ...i.marks.map((type) => ({ type })),
  ...(i.href ? [{ type: 'link', attrs: { href: i.href } }] : []),
]
const textNodes = (inline: Inline[]): JSONContent[] =>
  inline
    .filter((i) => i.text)
    .map((i) =>
      i.text === '\n'
        ? { type: 'hardBreak' }
        : {
            type: 'text',
            text: i.text,
            ...(i.marks.length || i.href ? { marks: markJson(i) } : {}),
          },
    )
const paragraph = (inline: Inline[]): JSONContent => {
  // Trailing hard breaks would leave an empty line at the end of the paragraph.
  while (inline.length && inline[inline.length - 1].text === '\n') inline = inline.slice(0, -1)
  const content = textNodes(inline)
  return content.length ? { type: 'paragraph', content } : { type: 'paragraph' }
}
const listNode = (b: ListBlock): JSONContent => ({
  type: b.type === 'bullets' ? 'bulletList' : 'orderedList',
  ...(b.type === 'numbers' && b.start !== 1 ? { attrs: { start: b.start } } : {}),
  content: b.items.map((item) => ({
    type: 'listItem',
    content: [paragraph(item.inline), ...item.lists.map(listNode)],
  })),
})

function toNodes(blocks: Block[]): JSONContent[] {
  return blocks.map((b): JSONContent => {
    switch (b.type) {
      case 'heading':
        return { type: 'heading', attrs: { level: b.level }, content: textNodes(b.inline) }
      case 'quote':
        return { type: 'blockquote', content: [paragraph(b.inline)] }
      case 'bullets':
      case 'numbers':
        return listNode(b)
      case 'code':
        return b.text
          ? { type: 'codeBlock', content: [{ type: 'text', text: b.text }] }
          : { type: 'codeBlock' }
      case 'rule':
        return { type: 'horizontalRule' }
      default:
        return paragraph(b.inline)
    }
  })
}

// Characters that would read as Markdown are escaped, except * _ ~ inside a word, which never do.
const escapeText = (text: string) =>
  text.replace(/[\\`*_~[\]]|<(?=\/?u>)/g, (c: string, i: number) =>
    /[*_~]/.test(c) && isWord(text[i - 1]) && isWord(text[i + 1]) ? c : `\\${c}`,
  )

function inlineMarkdown(node: ProseMirrorNode) {
  let out = ''
  node.forEach((child) => {
    if (child.type.name === 'hardBreak') out += '\\\n'
    if (!child.isText) return
    const raw = child.text ?? ''
    const names = child.marks.map((m) => m.type.name)
    // Spaces stay outside the markers: "**bold **" wouldn't close.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the pattern matches any string.
    const [, lead, core, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw)!
    if (!core) {
      out += raw
      return
    }
    let text = names.includes('code') ? `\`${core}\`` : escapeText(core)
    if (names.includes('italic')) text = `*${text}*`
    if (names.includes('bold')) text = `**${text}**`
    if (names.includes('strike')) text = `~~${text}~~`
    if (names.includes('underline')) text = `<u>${text}</u>`
    const link = child.marks.find((m) => m.type.name === 'link')
    if (link) text = `[${text}](${String(link.attrs.href)})`
    out += lead + text + trail
  })
  return out
}

// A paragraph that starts like a heading, a list item or a quote is escaped so it stays a paragraph.
const escapeStart = (text: string) =>
  text
    .replace(/^(#{1,6}\s|[-+*]\s|>|```|-(?=-{2,}\s*$))/, '\\$1')
    .replace(/^(\d+)([.)]\s)/, '$1\\$2')

function blockMarkdown(node: ProseMirrorNode): string {
  const children = () => {
    const parts: string[] = []
    node.forEach((c) => parts.push(blockMarkdown(c)))
    return parts
  }
  switch (node.type.name) {
    case 'paragraph':
      return escapeStart(inlineMarkdown(node))
    case 'heading':
      return `${'#'.repeat(Number(node.attrs.level) || 2)} ${inlineMarkdown(node)}`
    case 'bulletList':
    case 'orderedList': {
      const start = Number(node.attrs.start) || 1
      const items: string[] = []
      node.forEach((item, _, i) => {
        const [first = '', ...rest] = blockMarkdown(item).split('\n')
        const marker = node.type.name === 'bulletList' ? '- ' : `${start + i}. `
        items.push([marker + first, ...rest.map((l) => `  ${l}`)].join('\n'))
      })
      return items.join('\n')
    }
    case 'listItem':
      return children().join('\n')
    case 'blockquote':
      return children()
        .join('\n\n')
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n')
    case 'codeBlock':
      return `\`\`\`\n${node.textContent}\n\`\`\``
    case 'horizontalRule':
      return '---'
    default:
      return node.textContent
  }
}

function toMarkdown(doc: ProseMirrorNode) {
  const blocks: string[] = []
  doc.forEach((child) => blocks.push(blockMarkdown(child)))
  return blocks.filter((b) => b.trim()).join('\n\n')
}

// ——— The selection stays painted while focus is in the panel (the browser hides it otherwise).

interface Range {
  from: number
  to: number
}
const highlightKey = new PluginKey<DecorationSet>('coreloomAiSelection')

const AiSelectionHighlight = Extension.create({
  name: 'coreloomAiSelection',
  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: highlightKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, set) {
            const range = tr.getMeta(highlightKey) as Range | null | undefined
            if (range === null) return DecorationSet.empty
            if (range)
              return DecorationSet.create(tr.doc, [
                Decoration.inline(range.from, range.to, { class: 'rte-ai-selection' }),
              ])
            return set.map(tr.mapping, tr.doc)
          },
        },
        props: { decorations: (state) => highlightKey.getState(state) },
      }),
    ]
  },
})

/** Content styles for the highlight, added to the editor's content when AI is on. */
const AI_CONTENT =
  '[&_.rte-ai-selection]:rounded-[2px] [&_.rte-ai-selection]:bg-primary-subtle [&_.rte-ai-selection]:text-foreground'

/** The selection as the highlight tracks it (positions follow edits made meanwhile), or null for the whole document. */
function currentRange(editor: Editor): Range | null {
  const found = highlightKey.getState(editor.state)?.find()[0]
  return found ? { from: found.from, to: found.to } : null
}

// ——— The preview: the same blocks that will be inserted, drawn as React text (no HTML).

function InlineText({ inline }: { inline: Inline[] }) {
  return inline.map((i, k) => {
    // eslint-disable-next-line @eslint-react/no-array-index-key -- runs parsed from the text: no ids, rebuilt from the text on every render.
    if (i.text === '\n') return <br key={k} />
    let node: React.ReactNode = i.text
    if (i.marks.includes('code'))
      node = (
        <code className="rounded-[4px] bg-secondary px-1 py-0.5 font-mono text-[12.5px]">
          {node}
        </code>
      )
    if (i.marks.includes('italic')) node = <em>{node}</em>
    if (i.marks.includes('bold')) node = <strong className="font-semibold">{node}</strong>
    if (i.marks.includes('strike')) node = <s>{node}</s>
    if (i.marks.includes('underline')) node = <u className="underline-offset-2">{node}</u>
    if (i.href)
      node = (
        <a
          href={i.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-primary-text underline underline-offset-4"
        >
          {node}
        </a>
      )
    // eslint-disable-next-line @eslint-react/no-array-index-key -- see the <br> above.
    return <React.Fragment key={k}>{node}</React.Fragment>
  })
}

const Caret = () => (
  <span
    aria-hidden
    className="ml-0.5 inline-block h-[1em] w-[6px] translate-y-[2px] animate-pulse rounded-[1px] bg-primary"
  />
)

function PreviewList({ list, caret }: { list: ListBlock; caret: React.ReactNode }) {
  const List = list.type === 'bullets' ? 'ul' : 'ol'
  return (
    <List
      start={list.type === 'numbers' && list.start !== 1 ? list.start : undefined}
      className={cn('pl-5', list.type === 'bullets' ? 'list-disc' : 'list-decimal')}
    >
      {list.items.map((item, j) => {
        const last = j === list.items.length - 1
        return (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- items parsed from the text: no ids, rebuilt from the text on every render.
          <li key={j}>
            <InlineText inline={item.inline} />
            {last && !item.lists.length && caret}
            {item.lists.map((nested, n) => (
              <PreviewList
                // eslint-disable-next-line @eslint-react/no-array-index-key -- nested lists parsed from the text: no ids.
                key={n}
                list={nested}
                caret={last && n === item.lists.length - 1 ? caret : null}
              />
            ))}
          </li>
        )
      })}
    </List>
  )
}

function Preview({ blocks, streaming }: { blocks: Block[]; streaming: boolean }) {
  if (!blocks.length)
    return streaming ? (
      <p>
        <Caret />
      </p>
    ) : null
  return blocks.map((b, k) => (
    <PreviewBlock
      // eslint-disable-next-line @eslint-react/no-array-index-key -- blocks parsed from the text: no ids, and a stream only adds to the end.
      key={k}
      block={b}
      caret={streaming && k === blocks.length - 1 ? <Caret /> : null}
    />
  ))
}

function PreviewBlock({ block: b, caret }: { block: Block; caret: React.ReactNode }) {
  switch (b.type) {
    case 'heading':
      return (
        <p
          className={cn(
            'font-display font-semibold text-foreground',
            b.level === 2 ? 'text-[16px]' : 'text-[14.5px]',
          )}
        >
          <InlineText inline={b.inline} />
          {caret}
        </p>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-primary pl-3 text-fg-secondary">
          <InlineText inline={b.inline} />
          {caret}
        </blockquote>
      )
    case 'bullets':
    case 'numbers':
      return <PreviewList list={b} caret={caret} />
    case 'rule':
      return <hr className="border-border" />
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-md bg-surface p-2.5 font-mono text-[12.5px]">
          {b.text}
          {caret}
        </pre>
      )
    default:
      return (
        <p>
          <InlineText inline={b.inline} />
          {caret}
        </p>
      )
  }
}

// ——— The toolbar button and its panel.

type Status = 'idle' | 'streaming' | 'done' | 'error'

const isAsyncIterable = (v: unknown): v is AsyncIterable<string> =>
  typeof (v as AsyncIterable<string> | null)?.[Symbol.asyncIterator] === 'function'

function RichTextAi({
  editor,
  options,
  open,
  onOpenChange,
  shortcut,
  disabled,
}: {
  editor: Editor
  options: RichTextAiOptions
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Shown in the button's tooltip: "⌘J" or "Ctrl+J". */
  shortcut: string
  disabled?: boolean
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.editor
  const contentId = React.useId()
  const translateId = React.useId()
  const [prompt, setPrompt] = React.useState('')
  const [status, setStatus] = React.useState<Status>('idle')
  const [answer, setAnswer] = React.useState('')
  const [errorText, setErrorText] = React.useState<string | null>(null)
  const [stopped, setStopped] = React.useState(false)
  const [last, setLast] = React.useState<RichTextAiCommand | null>(null)
  const [scope, setScope] = React.useState<'selection' | 'document'>('document')
  const [hasText, setHasText] = React.useState(true)
  const [translateOpen, setTranslateOpen] = React.useState(false)
  // The selection was edited away while the panel was open (a reload, a controlled value): nothing to replace.
  const [lost, setLost] = React.useState(false)
  const scopeRef = React.useRef<'selection' | 'document'>('document')
  const controller = React.useRef<AbortController | null>(null)
  const runId = React.useRef(0)
  const answerRef = React.useRef('')
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const stopRef = React.useRef<HTMLButtonElement>(null)
  const primaryRef = React.useRef<HTMLButtonElement>(null)
  const retryRef = React.useRef<HTMLButtonElement>(null)
  const discardRef = React.useRef<HTMLButtonElement>(null)
  const refocusEditor = React.useRef(true)
  const initial = React.useRef(typeof options.defaultOpen === 'object' ? options.defaultOpen : null)
  const actions = options.actions ?? QUICK_ACTIONS
  const languages = options.languages ?? ['en', 'fr', 'es', 'de']
  const names = React.useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: 'language' })
    } catch {
      return null
    }
  }, [locale])

  // The panel sits under the selection, or under the button when the whole document is in play.
  const anchor = React.useRef({
    getBoundingClientRect: () => {
      const range = currentRange(editor)
      if (!range || editor.isDestroyed)
        return buttonRef.current?.getBoundingClientRect() ?? new DOMRect()
      const start = editor.view.coordsAtPos(range.from)
      const end = editor.view.coordsAtPos(range.to)
      const left = start.top === end.top ? start.left : editor.view.dom.getBoundingClientRect().left
      return new DOMRect(
        left,
        start.top,
        Math.max(1, (start.top === end.top ? end.right : left) - left),
        end.bottom - start.top,
      )
    },
  })

  const sourceText = () => {
    const range = currentRange(editor)
    const doc = editor.state.doc
    return toMarkdown(range ? doc.cut(range.from, range.to) : doc)
  }

  /** The range to work on: the selection, the whole document, or null when the selection is gone. */
  const target = (): Range | null => {
    const range = currentRange(editor)
    if (range) return range
    return scopeRef.current === 'selection' ? null : { from: 0, to: editor.state.doc.content.size }
  }

  const run = async (command: RichTextAiCommand) => {
    if (!target()) {
      setLost(true)
      return
    }
    controller.current?.abort()
    const ac = new AbortController()
    controller.current = ac
    const id = ++runId.current
    const live = () => id === runId.current && !ac.signal.aborted
    setLast(command)
    setAnswer('')
    answerRef.current = ''
    setErrorText(null)
    setStopped(false)
    setTranslateOpen(false)
    setStatus('streaming')
    try {
      const result = options.onRequest({
        ...command,
        text: sourceText(),
        scope: scopeRef.current,
        signal: ac.signal,
      })
      if (isAsyncIterable(result)) {
        for await (const chunk of result) {
          if (!live()) break
          answerRef.current += chunk
          setAnswer(answerRef.current)
        }
      } else {
        const full = await result
        if (live()) {
          answerRef.current = full
          setAnswer(full)
        }
      }
      if (!live()) return
      if (answerRef.current.trim()) setStatus('done')
      else {
        setErrorText(null)
        setStatus('error')
      }
    } catch (error) {
      if (!live()) return
      setErrorText(error instanceof Error && error.message ? error.message : null)
      setStatus('error')
    }
  }

  const stop = () => {
    controller.current?.abort()
    runId.current++
    setStopped(true)
    setStatus(answerRef.current.trim() ? 'done' : 'idle')
  }

  const reset = () => {
    controller.current?.abort()
    runId.current++
    answerRef.current = ''
    setAnswer('')
    setStatus('idle')
    setErrorText(null)
    setStopped(false)
    setPrompt('')
    setTranslateOpen(false)
    setLost(false)
  }

  // Opening takes the selection (or the whole document); closing lets go of it and of any stream.
  React.useEffect(() => {
    if (editor.isDestroyed) return
    if (open) {
      const { from, to, empty } = editor.state.selection
      const range = empty ? null : { from, to }
      editor.view.dispatch(editor.state.tr.setMeta(highlightKey, range))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the editor's selection (an external system) when the panel opens.
      setScope(range ? 'selection' : 'document')
      scopeRef.current = range ? 'selection' : 'document'
      setLost(false)
      setHasText(range ? true : !editor.isEmpty)
      refocusEditor.current = true
      if (initial.current) void run(initial.current)
      // Closing or unmounting stops the stream. (The initial command is dropped on close, not here,
      // so a Strict Mode remount runs it again instead of leaving it aborted.)
      return () => {
        controller.current?.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- a run counter, not a DOM ref: bumping its latest value is what cancels the run.
        runId.current++
      }
    }
    initial.current = null
    reset()
    editor.view.dispatch(editor.state.tr.setMeta(highlightKey, null))
    // run and reset read refs and setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editor])

  // Watch the selection while the panel is open: if edits elsewhere remove it, say so instead of guessing.
  React.useEffect(() => {
    if (!open || scope !== 'selection') return
    const check = () => {
      setLost(!currentRange(editor))
    }
    editor.on('transaction', check)
    return () => {
      editor.off('transaction', check)
    }
  }, [open, scope, editor])

  // Buttons that disappear (or turn off) take focus with them: hand it to what replaces them.
  React.useEffect(() => {
    if (!open || document.activeElement === inputRef.current) return
    const next = lost
      ? discardRef.current
        ? discardRef
        : inputRef
      : status === 'streaming'
        ? stopRef
        : status === 'done'
          ? primaryRef
          : status === 'error'
            ? retryRef
            : inputRef
    next.current?.focus()
  }, [status, open, lost])

  const close = () => {
    onOpenChange(false)
  }

  const nodes = () => toNodes(parseAnswer(answerRef.current))

  const replace = () => {
    const range = target()
    if (!range) {
      setLost(true)
      return
    }
    const blocks = parseAnswer(answerRef.current)
    const $from = editor.state.doc.resolve(range.from)
    const $to = editor.state.doc.resolve(range.to)
    // One paragraph inside one paragraph stays inline: the sentence is rewritten, not split.
    const inline =
      scopeRef.current === 'selection' &&
      blocks.length === 1 &&
      blocks[0].type === 'paragraph' &&
      $from.sameParent($to) &&
      $from.parent.isTextblock
    const content = inline && blocks[0].type === 'paragraph' ? textNodes(blocks[0].inline) : nodes()
    editor.view.dispatch(editor.state.tr.setMeta(highlightKey, null))
    editor.chain().focus().insertContentAt(range, content).run()
    refocusEditor.current = false
    close()
  }

  const insertBelow = () => {
    const range = target()
    if (!range) {
      setLost(true)
      return
    }
    const doc = editor.state.doc
    const $to = doc.resolve(range.to)
    const at = scopeRef.current === 'selection' && $to.depth >= 1 ? $to.after(1) : doc.content.size
    editor.view.dispatch(editor.state.tr.setMeta(highlightKey, null))
    editor.chain().focus().insertContentAt(at, nodes()).run()
    refocusEditor.current = false
    close()
  }

  const label = (action: Exclude<RichTextAiAction, 'custom'>) => t.aiActionLabels[action]
  const languageName = (code: string) => names?.of(code) ?? code
  const busy = status === 'streaming'
  const showResult = status !== 'idle'
  const blocks = React.useMemo(() => parseAnswer(answer), [answer])
  const summarising = last?.action === 'summarise'
  const announcement = busy
    ? t.aiWriting
    : status === 'done'
      ? stopped
        ? t.aiStopped
        : t.aiDone
      : ''

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={anchor} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.ai}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? contentId : undefined}
            aria-keyshortcuts={shortcut.startsWith('⌘') ? 'Meta+J' : 'Control+J'}
            disabled={disabled}
            onClick={() => {
              onOpenChange(!open)
            }}
            className="h-8 gap-1 px-2 has-[>svg]:px-2"
          >
            <SparklesIcon className="text-primary-text" />
            <span className="font-medium">{t.aiShort}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t.ai}
          <span className="ml-2 font-mono text-muted-foreground">{shortcut}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        id={contentId}
        aria-label={t.aiPanel}
        side="bottom"
        // Under the selection it starts where the text does; under the button it lines up with its right edge.
        align={scope === 'selection' ? 'start' : 'end'}
        collisionPadding={16}
        className="flex w-[min(calc(100vw-2rem),28rem)] flex-col gap-3 p-3"
        onInteractOutside={(e) => {
          // The AI button toggles the panel itself; anything else outside closes it without stealing focus back.
          if (buttonRef.current?.contains(e.target as Node)) e.preventDefault()
          else refocusEditor.current = false
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          if (refocusEditor.current && !editor.isDestroyed) editor.view.focus()
        }}
      >
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const text = prompt.trim()
            if (text && !busy && !lost) void run({ action: 'custom', prompt: text })
          }}
        >
          <Input
            ref={inputRef}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
            }}
            placeholder={t.aiPrompt}
            aria-label={t.aiPromptLabel}
            className="h-9 min-w-0 flex-1"
          />
          <Button
            type="submit"
            size="icon"
            aria-label={t.aiSend}
            disabled={!prompt.trim() || busy || lost}
            className="shrink-0"
          >
            <ArrowUpIcon />
          </Button>
        </form>
        <p className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {scope === 'selection' ? t.aiScopeSelection : t.aiScopeDocument}
        </p>
        <p role="status" className="sr-only">
          {announcement}
        </p>

        {lost && (
          <p
            role="alert"
            className="rounded-md border border-border bg-secondary px-3 py-2 text-[13px] text-foreground"
          >
            {t.aiSelectionLost}
          </p>
        )}

        {!showResult &&
          (hasText ? (
            <div role="group" aria-label={t.aiActions} className="-mx-1 flex flex-col">
              {actions.map((action) => {
                const Icon = ICONS[action]
                if (action === 'translate')
                  return (
                    <React.Fragment key={action}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-expanded={translateOpen}
                        aria-controls={translateOpen ? translateId : undefined}
                        onClick={() => {
                          setTranslateOpen((o) => !o)
                        }}
                        className="h-8 justify-start"
                      >
                        <Icon />
                        {label(action)}
                        <ChevronRightIcon
                          className={cn(
                            'ml-auto transition-transform duration-120',
                            translateOpen && 'rotate-90',
                          )}
                        />
                      </Button>
                      {translateOpen && (
                        <div
                          id={translateId}
                          role="group"
                          aria-label={t.aiLanguages}
                          className="ml-6 flex flex-col border-l border-border-subtle pl-1"
                        >
                          {languages.map((code) => (
                            <Button
                              key={code}
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void run({ action: 'translate', language: code })}
                              disabled={lost}
                              className="h-8 justify-start"
                            >
                              {t.aiTranslateTo(languageName(code))}
                            </Button>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  )
                return (
                  <Button
                    key={action}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void run({ action })}
                    disabled={lost}
                    className="h-8 justify-start"
                  >
                    <Icon />
                    {label(action)}
                  </Button>
                )
              })}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">{t.aiEmpty}</p>
          ))}

        {showResult && (
          <>
            {(answer || busy) && (
              <div
                role="region"
                aria-label={stopped ? `${t.aiSuggestion} · ${t.aiStopped}` : t.aiSuggestion}
                aria-busy={busy || undefined}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable; axe requires it.
                tabIndex={0}
                data-slot="rich-text-ai-preview"
                className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-md border border-border-subtle bg-inset px-3 py-2.5 text-[13.5px] leading-[1.6] break-words text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <Preview blocks={blocks} streaming={busy} />
              </div>
            )}
            {status === 'error' && (
              <div
                role="alert"
                className="rounded-md bg-destructive-subtle px-3 py-2 text-[13px] text-destructive"
              >
                <p className="font-medium">{t.aiError}</p>
                {errorText && <p className="mt-0.5">{errorText}</p>}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {busy && (
                <>
                  <span
                    className="mr-auto flex items-center gap-2 text-[13px] text-muted-foreground"
                    aria-hidden
                  >
                    <Spinner role="presentation" aria-label={undefined} />
                    {t.aiWriting}
                  </span>
                  <Button ref={stopRef} type="button" variant="secondary" size="sm" onClick={stop}>
                    <SquareIcon className="fill-current" />
                    {t.aiStop}
                  </Button>
                </>
              )}
              {status === 'done' && (
                <>
                  <Button
                    ref={summarising ? undefined : primaryRef}
                    type="button"
                    size="sm"
                    variant={summarising ? 'outline' : 'default'}
                    onClick={replace}
                    disabled={lost}
                  >
                    {scope === 'selection' ? t.aiReplace : t.aiReplaceAll}
                  </Button>
                  <Button
                    ref={summarising ? primaryRef : undefined}
                    type="button"
                    size="sm"
                    variant={summarising ? 'default' : 'outline'}
                    onClick={insertBelow}
                    disabled={lost}
                  >
                    {t.aiInsert}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => last && void run(last)}
                    disabled={lost}
                  >
                    <RotateCcwIcon />
                    {t.aiRetry}
                  </Button>
                  <Button ref={discardRef} type="button" size="sm" variant="ghost" onClick={close}>
                    {t.aiDiscard}
                  </Button>
                </>
              )}
              {status === 'error' && (
                <>
                  <Button
                    ref={retryRef}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => last && void run(last)}
                    disabled={lost}
                  >
                    <RotateCcwIcon />
                    {t.aiRetry}
                  </Button>
                  <Button
                    ref={discardRef}
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={close}
                    className="ml-auto"
                  >
                    {t.aiDiscard}
                  </Button>
                </>
              )}
            </div>
            {status === 'done' && <p className="text-[12px] text-muted-foreground">{t.aiHint}</p>}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export {
  AI_CONTENT,
  AiSelectionHighlight,
  parseAnswer,
  parseInline,
  RichTextAi,
  type RichTextAiAction,
  type RichTextAiCommand,
  type RichTextAiOptions,
  type RichTextAiRequest,
  toMarkdown,
  toNodes,
}
