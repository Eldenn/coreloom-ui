import { describe, expect, it } from 'vitest'

import { compareEvalRuns, type EvalCaseResult, summarizeEvalRun } from '@/components/ai-evals'
import {
  canMoveTo,
  type FileManagerItem,
  fileManagerPath,
  fileTypeOf,
  selectRange,
  sortFileItems,
} from '@/components/file-manager'
import { filterConversations, formatInboxTime, type InboxConversation } from '@/components/inbox'
import {
  normalizeRange,
  parseSheetValue,
  parseTsv,
  pasteIntoRows,
  type SheetColumn,
  type SheetRow,
  toTsv,
} from '@/components/spreadsheet'

const evalCase = (id: string, score: number, passed: boolean, extra = {}): EvalCaseResult => ({
  id,
  name: id,
  input: 'q',
  output: 'a',
  score,
  passed,
  ...extra,
})

describe('summarizeEvalRun', () => {
  it('counts passes, failures and errors, and averages the score', () => {
    const s = summarizeEvalRun({
      cases: [
        evalCase('a', 1, true, { latencyMs: 100, cost: 0.01 }),
        evalCase('b', 0.5, false, { latencyMs: 300 }),
        evalCase('c', 0, true, { error: 'timeout', latencyMs: 200, cost: 0.02 }),
        evalCase('d', 0.9, true, { latencyMs: 400 }),
      ],
    })
    expect(s).toMatchObject({ total: 4, passed: 2, failed: 1, errored: 1, passRate: 0.5 })
    expect(s.meanScore).toBeCloseTo(0.6)
    expect(s.cost).toBeCloseTo(0.03)
    expect(s.latencyMs).toBe(250)
  })
  it('is all zeros for an empty run, without NaN', () => {
    expect(summarizeEvalRun({ cases: [] })).toMatchObject({ passRate: 0, meanScore: 0 })
    expect(summarizeEvalRun({ cases: [] }).cost).toBeUndefined()
  })
  it('treats a NaN score as 0', () => {
    expect(summarizeEvalRun({ cases: [evalCase('a', Number.NaN, false)] }).meanScore).toBe(0)
  })
})

describe('compareEvalRuns', () => {
  const baseline = {
    cases: [
      evalCase('pass-to-fail', 0.9, true),
      evalCase('fail-to-pass', 0.2, false),
      evalCase('drop', 0.9, true),
      evalCase('small-drop', 0.9, true),
      evalCase('gone', 1, true),
    ],
  }
  const candidate = {
    cases: [
      evalCase('pass-to-fail', 0.88, false),
      evalCase('fail-to-pass', 0.21, true),
      evalCase('drop', 0.7, true),
      evalCase('small-drop', 0.87, true),
      evalCase('new', 1, true),
    ],
  }
  it('finds regressions, improvements, new and removed cases', () => {
    const rows = compareEvalRuns(baseline, candidate)
    expect(rows.map((r) => [r.id, r.change])).toEqual([
      ['pass-to-fail', 'regressed'],
      ['fail-to-pass', 'improved'],
      ['drop', 'regressed'],
      ['small-drop', 'unchanged'],
      ['new', 'added'],
      ['gone', 'removed'],
    ])
    expect(rows[2]?.delta).toBeCloseTo(-0.2)
  })
  it('honours the tolerance', () => {
    const rows = compareEvalRuns(baseline, candidate, { tolerance: 0.25 })
    expect(rows.find((r) => r.id === 'drop')?.change).toBe('unchanged')
  })
  it('counts a case that now errors as a regression', () => {
    const rows = compareEvalRuns(
      { cases: [evalCase('a', 1, true)] },
      { cases: [evalCase('a', 1, true, { error: 'crash' })] },
    )
    expect(rows[0]?.change).toBe('regressed')
  })
})

const f = (
  id: string,
  parentId: string | null,
  kind: 'file' | 'folder' = 'file',
  extra: Partial<FileManagerItem> = {},
): FileManagerItem => ({ id, name: id, kind, parentId, ...extra })

describe('file manager helpers', () => {
  const items = [
    f('a', null, 'folder'),
    f('b', 'a', 'folder'),
    f('c', 'b', 'folder'),
    f('x.txt', 'c'),
    f('root.md', null),
  ]
  it('builds the path from the root', () => {
    expect(fileManagerPath(items, 'c').map((i) => i.id)).toEqual(['a', 'b', 'c'])
    expect(fileManagerPath(items, null)).toEqual([])
    expect(fileManagerPath(items, 'missing')).toEqual([])
  })
  it('survives a cycle in parentId', () => {
    const loop = [f('p', 'q', 'folder'), f('q', 'p', 'folder')]
    expect(fileManagerPath(loop, 'p').map((i) => i.id)).toEqual(['q', 'p'])
  })
  it('refuses moving a folder into itself or below it, or where it already is', () => {
    expect(canMoveTo(items, ['a'], 'c')).toBe(false)
    expect(canMoveTo(items, ['b'], 'b')).toBe(false)
    expect(canMoveTo(items, ['root.md'], null)).toBe(false)
    expect(canMoveTo(items, ['root.md'], 'c')).toBe(true)
    expect(canMoveTo(items, ['c'], null)).toBe(true)
    expect(canMoveTo(items, [], 'a')).toBe(false)
  })
  it('sorts folders first and names the way people count', () => {
    const list = [
      f('file 10', null),
      f('file 2', null),
      f('Zeta', null, 'folder'),
      f('alpha', null, 'folder'),
    ]
    expect(sortFileItems(list, 'name', 'asc').map((i) => i.id)).toEqual([
      'alpha',
      'Zeta',
      'file 2',
      'file 10',
    ])
    expect(sortFileItems(list, 'name', 'desc').map((i) => i.id)).toEqual([
      'Zeta',
      'alpha',
      'file 10',
      'file 2',
    ])
    const sized = [f('s', null, 'file', { size: 5 }), f('l', null, 'file', { size: 50 })]
    expect(sortFileItems(sized, 'size', 'desc').map((i) => i.id)).toEqual(['l', 's'])
  })
  it('selects a range in either direction', () => {
    const order = ['1', '2', '3', '4']
    expect(selectRange(order, '3', '1')).toEqual(['1', '2', '3'])
    expect(selectRange(order, '2', '4')).toEqual(['2', '3', '4'])
    expect(selectRange(order, undefined, '2')).toEqual(['2'])
    expect(selectRange(order, '1', 'nope')).toEqual([])
  })
  it('reads the type from the MIME type, then the extension', () => {
    expect(fileTypeOf({ kind: 'file', name: 'a', mimeType: 'image/png' })).toBe('image')
    expect(fileTypeOf({ kind: 'file', name: 'Report.PDF' })).toBe('pdf')
    expect(fileTypeOf({ kind: 'file', name: 'data.csv' })).toBe('spreadsheet')
    expect(fileTypeOf({ kind: 'file', name: '.env' })).toBe('file')
    expect(fileTypeOf({ kind: 'folder', name: 'x.png' })).toBe('folder')
  })
})

const conv = (id: string, extra: Partial<InboxConversation> = {}): InboxConversation => ({
  id,
  subject: `Subject ${id}`,
  contact: { id: `k${id}`, name: `Contact ${id}` },
  status: 'open',
  updatedAt: '2026-10-14T08:00:00Z',
  messages: [],
  ...extra,
})

describe('inbox helpers', () => {
  const all = [
    conv('1', { unread: true, updatedAt: '2026-10-14T09:00:00Z' }),
    conv('2', { assignee: { id: 'me', name: 'Me' } }),
    conv('3', { status: 'closed', labels: ['Billing'] }),
    conv('4', {
      status: 'pending',
      messages: [
        {
          id: 'm',
          author: { id: 'k', name: 'K' },
          kind: 'incoming',
          body: 'My invoice is wrong',
          sentAt: '2026-10-14T08:00:00Z',
        },
      ],
    }),
  ]
  const ids = (list: InboxConversation[]) => list.map((c) => c.id)
  it('filters by status, then by unread, mine and unassigned', () => {
    expect(ids(filterConversations(all, { status: 'open' }))).toEqual(['1', '2'])
    expect(ids(filterConversations(all, { filter: 'unread' }))).toEqual(['1'])
    expect(ids(filterConversations(all, { filter: 'mine', currentUserId: 'me' }))).toEqual(['2'])
    expect(ids(filterConversations(all, { filter: 'mine' }))).toEqual([])
    expect(ids(filterConversations(all, { filter: 'unassigned', status: 'all' }))).toEqual([
      '1',
      '3',
      '4',
    ])
  })
  it('searches subjects, labels and message bodies, ignoring case', () => {
    expect(ids(filterConversations(all, { query: 'billing' }))).toEqual(['3'])
    expect(ids(filterConversations(all, { query: '  INVOICE ' }))).toEqual(['4'])
    expect(ids(filterConversations(all, { query: 'subject 2' }))).toEqual(['2'])
  })
  it('formats list times: hour today, weekday this week, date before', () => {
    const now = new Date('2026-10-14T15:00:00')
    expect(formatInboxTime(new Date('2026-10-14T09:05:00'), now, 'en-GB')).toBe('09:05')
    expect(formatInboxTime(new Date('2026-10-12T09:05:00'), now, 'en')).toBe('Mon')
    expect(formatInboxTime(new Date('2026-09-01T09:05:00'), now, 'en')).toBe('Sep 1')
    expect(formatInboxTime(new Date('2025-09-01T09:05:00'), now, 'en')).toBe('Sep 1, 2025')
  })
})

describe('spreadsheet: TSV', () => {
  it('splits tabs and lines, without an extra row for the final line break', () => {
    expect(parseTsv('a\tb\nc\td\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
    expect(parseTsv('a\r\nb')).toEqual([['a'], ['b']])
    expect(parseTsv('')).toEqual([])
    expect(parseTsv('a\t\tc')).toEqual([['a', '', 'c']])
  })
  it('reads quoted cells with tabs, line breaks and doubled quotes', () => {
    expect(parseTsv('"line 1\nline 2"\t"say ""hi"""\tplain')).toEqual([
      ['line 1\nline 2', 'say "hi"', 'plain'],
    ])
  })
  it('round-trips through toTsv', () => {
    const cells = [
      ['a\tb', 'x'],
      ['multi\nline', '"q"'],
      ['', 'last'],
    ]
    expect(parseTsv(toTsv(cells))).toEqual(cells)
  })
})

describe('spreadsheet: values', () => {
  it('reads numbers in either convention', () => {
    expect(parseSheetValue('1,234.5', 'number')).toBe(1234.5)
    expect(parseSheetValue('1 234,5', 'number')).toBe(1234.5)
    expect(parseSheetValue('1.234,5', 'number')).toBe(1234.5)
    expect(parseSheetValue('3,5', 'number')).toBe(3.5)
    expect(parseSheetValue('1,234', 'number')).toBe(1234)
    expect(parseSheetValue('1.234.567', 'number')).toBe(1234567)
    expect(parseSheetValue('-42', 'number')).toBe(-42)
    expect(parseSheetValue('1e3', 'number')).toBe(1000)
    expect(parseSheetValue('1 234', 'number')).toBe(1234)
  })
  it('keeps what isn’t a number as typed, and empty as null', () => {
    expect(parseSheetValue('six', 'number')).toBe('six')
    expect(parseSheetValue('12abc', 'number')).toBe('12abc')
    expect(parseSheetValue('Infinity', 'number')).toBe('Infinity')
    expect(parseSheetValue('  ', 'number')).toBeNull()
    expect(parseSheetValue('  ', 'text')).toBeNull()
    expect(parseSheetValue(' 12 ', 'text')).toBe(' 12 ')
  })
  it('normalizes a range drawn either way', () => {
    expect(normalizeRange({ row: 4, col: 1 }, { row: 2, col: 3 })).toEqual({
      top: 2,
      left: 1,
      bottom: 4,
      right: 3,
    })
  })
})

describe('spreadsheet: paste', () => {
  const columns: SheetColumn[] = [
    { id: 'id', title: 'ID', readOnly: true },
    { id: 'name', title: 'Name' },
    { id: 'qty', title: 'Qty', type: 'number' },
  ]
  const rows: SheetRow[] = [
    { id: 'r1', name: 'a', qty: 1 },
    { id: 'r2', name: 'b', qty: 2 },
  ]
  it('writes from the cell, skips read-only columns and cuts past the last column', () => {
    const next = pasteIntoRows(rows, columns, { row: 0, col: 0 }, [['X', 'new', '7', 'extra']])
    expect(next[0]).toEqual({ id: 'r1', name: 'new', qty: 7 })
    expect(rows[0]).toEqual({ id: 'r1', name: 'a', qty: 1 })
  })
  it('cuts past the last row, or adds rows with createRow', () => {
    const matrix = [['c'], ['d'], ['e']]
    expect(pasteIntoRows(rows, columns, { row: 1, col: 1 }, matrix)).toHaveLength(2)
    const grown = pasteIntoRows(rows, columns, { row: 1, col: 1 }, matrix, (i) => ({
      id: `n${String(i)}`,
    }))
    expect(grown.map((r) => [r.id, r.name])).toEqual([
      ['r1', 'a'],
      ['r2', 'c'],
      ['n2', 'd'],
      ['n3', 'e'],
    ])
  })
})
