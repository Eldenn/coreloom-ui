import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  compareReports,
  hasMajorChangeset,
  parseReport,
  // @ts-expect-error -- a Node build script without types; its exports are checked below.
} from '../build/api-report.mjs'

interface Comparison {
  added: string[]
  removed: string[]
  changed: string[]
  breaking: string[]
}

const parse = parseReport as (text: string) => Map<string, string>
const compare = compareReports as (input: {
  before: string
  after: string
  stable: boolean
}) => Comparison
const majorPending = hasMajorChangeset as (dir: string) => boolean

const report = (...lines: string[]) =>
  ['# @coreloom/button', '', '## src/components/ui/button.tsx', '', '```ts', ...lines, '```'].join(
    '\n',
  )

const BUTTON = report(
  'function Button',
  "Button.size?: 'sm' | 'lg' | undefined",
  'Button.asChild?: boolean | undefined',
  'Button.*: react',
  'function buttonVariants(props?: { size?: string; }) => string',
  'type ButtonProps = {}',
  'ButtonProps.tone?: string | undefined',
)

describe('parseReport', () => {
  it('reads exports and members, ignoring the Markdown around them', () => {
    const entries = parse(BUTTON)
    expect([...entries.keys()]).toEqual([
      'Button',
      'Button.size',
      'Button.asChild',
      'Button.*',
      'buttonVariants',
      'ButtonProps',
      'ButtonProps.tone',
    ])
    expect(entries.get('Button.size')).toBe("?: 'sm' | 'lg' | undefined")
    expect(entries.get('buttonVariants')).toBe('function(props?: { size?: string; }) => string')
    expect(entries.get('Button')).toBe('function')
  })

  it('keeps nested members and i18n keys apart', () => {
    const entries = parse(report('const en: {}', 'en.chat: {}', 'en.chat.send: string'))
    expect(entries.get('en.chat.send')).toBe(': string')
    expect(entries.has('en.chat')).toBe(true)
  })

  it('reads nothing from an empty or unrelated text', () => {
    expect(parse('').size).toBe(0)
    expect(parse('# Title\n\nSome prose: with a colon.').size).toBe(0)
  })
})

describe('compareReports', () => {
  it('finds nothing when the reports match', () => {
    expect(compare({ before: BUTTON, after: BUTTON, stable: true })).toEqual({
      added: [],
      removed: [],
      changed: [],
      breaking: [],
    })
  })

  it('lets a stable item add optional props and widen a type', () => {
    const after = BUTTON.replace(
      "Button.size?: 'sm' | 'lg' | undefined",
      "Button.size?: 'sm' | 'md' | 'lg' | undefined\nButton.loading?: boolean | undefined",
    )
    const result = compare({ before: BUTTON, after, stable: true })
    expect(result.added).toEqual(['Button.loading'])
    expect(result.changed).toEqual(['Button.size'])
    expect(result.breaking).toEqual([])
  })

  it('flags a removed prop or export of a stable item as breaking', () => {
    const after = BUTTON.replace('Button.asChild?: boolean | undefined\n', '').replace(
      /function buttonVariants.*\n/,
      '',
    )
    const result = compare({ before: BUTTON, after, stable: true })
    expect(result.removed).toEqual(['Button.asChild', 'buttonVariants'])
    expect(result.breaking).toEqual(['Button.asChild removed', 'buttonVariants removed'])
  })

  it('flags a new required prop and a prop that became required', () => {
    const after = BUTTON.replace(
      "Button.size?: 'sm' | 'lg' | undefined",
      "Button.size: 'sm' | 'lg'\nButton.label: string",
    )
    expect(compare({ before: BUTTON, after, stable: true }).breaking).toEqual([
      'Button.label added as a required prop',
      'Button.size became required',
    ])
  })

  it('lets a new component have required props, and a type gain required fields', () => {
    const after = `${BUTTON}\nfunction ButtonGroup\nButtonGroup.label: string\nButtonProps.kind: string`
    expect(compare({ before: BUTTON, after, stable: true }).breaking).toEqual([])
  })

  it('reports no breaking change for an experimental item', () => {
    const result = compare({ before: BUTTON, after: report('function Button'), stable: false })
    expect(result.removed).toHaveLength(6)
    expect(result.breaking).toEqual([])
  })
})

describe('hasMajorChangeset', () => {
  const withChangesets = (files: Record<string, string>) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'changesets-'))
    for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text)
    return dir
  }

  it('finds a pending major bump', () => {
    const dir = withChangesets({
      'a.md': "---\n'@coreloom/ui': minor\n---\n\n### Added\n",
      'b.md': "---\n'@coreloom/ui': major\n---\n\n### Removed\n",
    })
    expect(majorPending(dir)).toBe(true)
  })

  it('ignores minor and patch bumps, the README and the word in the text', () => {
    const dir = withChangesets({
      'README.md': "---\n'@coreloom/ui': major\n---\n",
      'a.md': "---\n'@coreloom/ui': patch\n---\n\nA major improvement.\n",
      'config.json': '{}',
    })
    expect(majorPending(dir)).toBe(false)
  })
})
