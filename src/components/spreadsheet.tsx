'use client'

// Coreloom UI — Spreadsheet (block). An editable grid that behaves like a spreadsheet: move with
// the arrows, type to replace a cell or press Enter (F2) to edit it, select a range with Shift or
// by dragging, copy, cut and paste ranges as tab-separated text (to and from Excel, Google Sheets,
// Numbers), clear with Delete, undo with Ctrl/⌘+Z. The status bar sums the numbers selected.
// Controlled: you keep `rows` and save them in `onRowsChange`. No formulas: values are text or
// numbers. For a few hundred rows; for more, page them or use DataTable.
import * as React from 'react'

import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type SheetValue = string | number | null

interface SheetColumn {
  id: string
  title: string
  /** number: right-aligned, parsed from what people type or paste ("1 234,5", "1,234.5"). */
  type?: 'text' | 'number'
  /** In pixels. Default 140 (number 110). */
  width?: number
  readOnly?: boolean
  /** How the value shows (a currency, a unit); editing and copying use the raw value. */
  format?: (value: SheetValue, locale: string) => string
}

type SheetRow = { id: string } & Record<string, SheetValue>

interface SheetCell {
  row: number
  col: number
}

interface SheetRange {
  top: number
  left: number
  bottom: number
  right: number
}

/** The rectangle between two cells, whichever way round they are. */
function normalizeRange(a: SheetCell, b: SheetCell): SheetRange {
  return {
    top: Math.min(a.row, b.row),
    left: Math.min(a.col, b.col),
    bottom: Math.max(a.row, b.row),
    right: Math.max(a.col, b.col),
  }
}

/**
 * Tab-separated text (what spreadsheets put on the clipboard) as rows of cells. Quoted cells may
 * hold tabs, line breaks and doubled quotes; a final line break doesn't add an empty row.
 */
function parseTsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  let i = 0
  const src = text.replace(/\r\n?/g, '\n')
  while (i < src.length) {
    const ch = src.charAt(i)
    if (quoted) {
      if (ch === '"' && src.charAt(i + 1) === '"') {
        cell += '"'
        i += 2
        continue
      }
      if (ch === '"') {
        quoted = false
        i++
        continue
      }
      cell += ch
      i++
      continue
    }
    if (ch === '"' && cell === '') {
      quoted = true
      i++
      continue
    }
    if (ch === '\t') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
    i++
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/** Rows of cells as tab-separated text; cells with a tab, a line break or a quote are quoted. */
function toTsv(cells: readonly (readonly string[])[]) {
  return cells
    .map((r) => r.map((c) => (/[\t\n\r"]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join('\t'))
    .join('\n')
}

/**
 * What someone typed or pasted, as the column's value: `null` when empty; for number columns a
 * number when it reads as one in either convention ("1,234.5", "1 234,5", "1.234,5"), otherwise
 * the text as typed (so nothing is lost).
 */
function parseSheetValue(raw: string, type: SheetColumn['type'] = 'text'): SheetValue {
  const text = raw.trim()
  if (text === '') return null
  if (type !== 'number') return raw
  let s = text.replace(/[\s']/g, '')
  const comma = s.lastIndexOf(',')
  const dot = s.lastIndexOf('.')
  if (comma >= 0 && dot >= 0) {
    // The last separator is the decimal one.
    s = comma > dot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (comma >= 0) {
    // "1,234" with groups of three is a thousands separator; "3,5" is a decimal comma.
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.')
  } else if (/^-?\d{1,3}(\.\d{3}){2,}$/.test(s)) s = s.replace(/\./g, '')
  const n = Number(s)
  return s !== '' && Number.isFinite(n) && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? n : raw
}

/** A value as text to edit or copy. */
const rawText = (v: SheetValue | undefined) => (v === null || v === undefined ? '' : String(v))

/**
 * `matrix` written into `rows` from `at`, skipping read-only columns' cells and cutting what falls
 * past the last column. Rows past the end are added with `createRow` when given, else cut too.
 */
function pasteIntoRows(
  rows: readonly SheetRow[],
  columns: readonly SheetColumn[],
  at: SheetCell,
  matrix: readonly (readonly string[])[],
  createRow?: (index: number) => SheetRow,
): SheetRow[] {
  const next = rows.map((r) => ({ ...r }))
  matrix.forEach((cells, dr) => {
    const r = at.row + dr
    if (r >= next.length) {
      if (!createRow) return
      while (next.length <= r) next.push(createRow(next.length))
    }
    const row = next.at(r)
    if (!row) return
    cells.forEach((raw, dc) => {
      const col = columns.at(at.col + dc)
      if (!col || col.readOnly) return
      row[col.id] = parseSheetValue(raw, col.type)
    })
  })
  return next
}

const HISTORY = 100

function Spreadsheet({
  columns,
  rows,
  onRowsChange,
  createRow,
  readOnly = false,
  rowHeaders = true,
  'aria-label': ariaLabel,
  className,
}: {
  columns: SheetColumn[]
  rows: SheetRow[]
  /** Every edit, paste, cut, clear, undo and redo, with the new rows. */
  onRowsChange?: (rows: SheetRow[]) => void
  /** Lets a paste add rows past the end; returns an empty row with a new id. */
  createRow?: (index: number) => SheetRow
  readOnly?: boolean
  /** Shows row numbers. Default true. */
  rowHeaders?: boolean
  'aria-label'?: string
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.spreadsheet
  const baseId = React.useId()
  const [active, setActive] = React.useState<SheetCell>({ row: 0, col: 0 })
  const [anchor, setAnchor] = React.useState<SheetCell>({ row: 0, col: 0 })
  const [editing, setEditing] = React.useState<{ cell: SheetCell; draft: string } | null>(null)
  const [announce, setAnnounce] = React.useState('')
  const [dragging, setDragging] = React.useState(false)
  const history = React.useRef<{ undo: SheetRow[][]; redo: SheetRow[][] }>({ undo: [], redo: [] })
  const gridRef = React.useRef<HTMLTableElement>(null)
  // Set while an edit is being saved or cancelled, so the input's blur doesn't save it twice.
  const closing = React.useRef(false)
  const editable = !readOnly && onRowsChange !== undefined

  const lastRow = rows.length - 1
  const lastCol = columns.length - 1
  // Keep the cursor inside the grid when rows go away.
  const cur = {
    row: Math.min(active.row, Math.max(0, lastRow)),
    col: Math.min(active.col, lastCol),
  }
  const range = normalizeRange(anchor, cur)
  const inRange = (r: number, c: number) =>
    r >= range.top && r <= range.bottom && c >= range.left && c <= range.right
  const multi = range.top !== range.bottom || range.left !== range.right
  const cellCount = (range.bottom - range.top + 1) * (range.right - range.left + 1)

  const commit = (next: SheetRow[], message?: string) => {
    if (!onRowsChange) return
    history.current.undo = [...history.current.undo.slice(-HISTORY + 1), rows]
    history.current.redo = []
    onRowsChange(next)
    if (message) setAnnounce(message)
  }

  // Focus moves now, not on the next frame: the next key press must land on the new cell.
  const focusCell = (cell: SheetCell) => {
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-cell="${String(cell.row)}:${String(cell.col)}"]`)
      ?.focus()
  }

  const moveTo = (cell: SheetCell, extend = false) => {
    const next = {
      row: Math.max(0, Math.min(lastRow, cell.row)),
      col: Math.max(0, Math.min(lastCol, cell.col)),
    }
    setActive(next)
    if (!extend) setAnchor(next)
    focusCell(next)
  }

  const startEdit = (cell: SheetCell, draft?: string) => {
    const col = columns.at(cell.col)
    const row = rows.at(cell.row)
    if (!editable || !col || !row || col.readOnly) return
    closing.current = false
    setEditing({ cell, draft: draft ?? rawText(row[col.id]) })
  }

  // The input takes focus as it mounts (keys typed right after must reach it), caret at the end.
  const focusInput = React.useCallback((el: HTMLInputElement | null) => {
    if (!el || el.ownerDocument.activeElement === el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  const finishEdit = (move?: { row: number; col: number }) => {
    if (!editing || closing.current) return
    closing.current = true
    const { cell, draft } = editing
    const col = columns.at(cell.col)
    const row = rows.at(cell.row)
    setEditing(null)
    if (col && row) {
      const value = parseSheetValue(draft, col.type)
      const before = row[col.id] as SheetValue | undefined
      if (value !== (before ?? null))
        commit(rows.map((r, i) => (i === cell.row ? { ...r, [col.id]: value } : r)))
    }
    moveTo(move ? { row: cell.row + move.row, col: cell.col + move.col } : cell)
  }

  const cancelEdit = () => {
    if (!editing || closing.current) return
    closing.current = true
    const { cell } = editing
    setEditing(null)
    moveTo(cell)
  }

  const clearRange = (message?: string) => {
    if (!editable) return
    const next = rows.map((r, i) => {
      if (i < range.top || i > range.bottom) return r
      const copy = { ...r }
      for (let c = range.left; c <= range.right; c++) {
        const col = columns.at(c)
        if (col && !col.readOnly) copy[col.id] = null
      }
      return copy
    })
    commit(next, message ?? t.cleared(cellCount))
  }

  const rangeText = () =>
    toTsv(
      rows
        .slice(range.top, range.bottom + 1)
        .map((r) => columns.slice(range.left, range.right + 1).map((c) => rawText(r[c.id]))),
    )

  const undo = (redo = false) => {
    if (!onRowsChange) return
    const h = history.current
    const from = redo ? h.redo : h.undo
    const prev = from.pop()
    if (!prev) return
    ;(redo ? h.undo : h.redo).push(rows)
    onRowsChange(prev)
    setAnnounce(redo ? t.redone : t.undone)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (editing) return
    const mod = e.metaKey || e.ctrlKey
    const { row, col } = cur
    const go = (cell: SheetCell) => {
      e.preventDefault()
      moveTo(cell, e.shiftKey)
    }
    switch (e.key) {
      case 'ArrowUp':
        go({ row: mod ? 0 : row - 1, col })
        return
      case 'ArrowDown':
        go({ row: mod ? lastRow : row + 1, col })
        return
      case 'ArrowLeft':
        go({ row, col: mod ? 0 : col - 1 })
        return
      case 'ArrowRight':
        go({ row, col: mod ? lastCol : col + 1 })
        return
      case 'Home':
        go({ row: mod ? 0 : row, col: 0 })
        return
      case 'End':
        go({ row: mod ? lastRow : row, col: lastCol })
        return
      case 'PageDown':
        go({ row: row + 10, col })
        return
      case 'PageUp':
        go({ row: row - 10, col })
        return
      case 'Tab':
        // Tab moves along the row and leaves the grid at either end.
        if ((e.shiftKey && col === 0) || (!e.shiftKey && col === lastCol)) return
        e.preventDefault()
        moveTo({ row, col: col + (e.shiftKey ? -1 : 1) })
        return
      case 'Enter':
      case 'F2':
        e.preventDefault()
        startEdit(cur)
        return
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        clearRange()
        return
      case 'Escape':
        if (multi) {
          e.preventDefault()
          setAnchor(cur)
        }
        return
    }
    if (mod && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault()
      setAnchor({ row: 0, col: 0 })
      setActive({ row: lastRow, col: lastCol })
      focusCell({ row: lastRow, col: lastCol })
      setAnnounce(t.selectedAll)
      return
    }
    if (mod && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault()
      undo(e.shiftKey)
      return
    }
    if (mod && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault()
      undo(true)
      return
    }
    // A printable key starts editing with that character, replacing the value.
    if (e.key.length === 1 && !mod && !e.altKey) {
      const column = columns.at(col)
      if (editable && column && !column.readOnly) {
        e.preventDefault()
        setAnchor(cur)
        startEdit(cur, e.key)
      }
    }
  }

  const onCopy = (e: React.ClipboardEvent, cut = false) => {
    if (editing) return
    e.preventDefault()
    e.clipboardData.setData('text/plain', rangeText())
    if (cut && editable) clearRange(t.cut(cellCount))
    else setAnnounce(t.copied(cellCount))
  }

  const onPaste = (e: React.ClipboardEvent) => {
    if (editing || !editable) return
    e.preventDefault()
    const matrix = parseTsv(e.clipboardData.getData('text/plain'))
    if (matrix.length === 0) return
    // One value pasted over a range fills the range, as spreadsheets do.
    const fill =
      matrix.length === 1 && matrix[0]?.length === 1 && multi
        ? Array.from({ length: range.bottom - range.top + 1 }, () =>
            Array.from({ length: range.right - range.left + 1 }, () => matrix[0]?.[0] ?? ''),
          )
        : matrix
    const at = { row: range.top, col: range.left }
    const next = pasteIntoRows(rows, columns, at, fill, createRow)
    const height = Math.min(fill.length, next.length - at.row)
    const width = Math.min(Math.max(...fill.map((r) => r.length)), columns.length - at.col)
    commit(next, t.pasted(height * width))
    setAnchor(at)
    setActive({ row: at.row + height - 1, col: at.col + width - 1 })
  }

  // The status bar: how many cells, and the sum and average of the numbers among them.
  const numbers: number[] = []
  for (let r = range.top; r <= range.bottom; r++)
    for (let c = range.left; c <= range.right; c++) {
      const col = columns.at(c)
      const v = col ? rows.at(r)?.[col.id] : undefined
      if (typeof v === 'number') numbers.push(v)
    }
  const sum = numbers.reduce((a, b) => a + b, 0)

  const display = (col: SheetColumn, v: SheetValue | undefined) => {
    if (v === null || v === undefined) return ''
    if (col.format) return col.format(v, locale)
    return typeof v === 'number' ? formatNumber(v) : v
  }

  if (columns.length === 0) return null

  return (
    <div
      data-slot="spreadsheet"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <table
          ref={gridRef}
          role="grid"
          aria-label={ariaLabel ?? t.label}
          aria-rowcount={rows.length + 1}
          aria-colcount={columns.length + (rowHeaders ? 1 : 0)}
          aria-multiselectable
          aria-readonly={!editable || undefined}
          aria-describedby={`${baseId}-help`}
          onKeyDown={onKeyDown}
          onCopy={onCopy}
          onCut={(e) => {
            onCopy(e, true)
          }}
          onPaste={onPaste}
          onMouseUp={() => {
            setDragging(false)
          }}
          onMouseLeave={() => {
            setDragging(false)
          }}
          className="w-max min-w-full table-fixed border-separate border-spacing-0 text-[13px]"
        >
          <colgroup>
            {rowHeaders && <col style={{ width: 48 }} />}
            {columns.map((c) => (
              <col key={c.id} style={{ width: c.width ?? (c.type === 'number' ? 110 : 140) }} />
            ))}
          </colgroup>
          <thead>
            <tr role="row" aria-rowindex={1}>
              {rowHeaders && (
                <th
                  role="columnheader"
                  scope="col"
                  aria-colindex={1}
                  className="sticky top-0 left-0 z-20 border-r border-b border-border bg-secondary"
                >
                  <span className="sr-only">{t.rowNumber}</span>
                </th>
              )}
              {columns.map((c, ci) => (
                <th
                  key={c.id}
                  role="columnheader"
                  scope="col"
                  aria-colindex={ci + 1 + (rowHeaders ? 1 : 0)}
                  className={cn(
                    'sticky top-0 z-10 truncate border-r border-b border-border bg-secondary px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase',
                    c.type === 'number' ? 'text-right' : 'text-left',
                    ci >= range.left && ci <= range.right && 'bg-primary-subtle text-primary-text',
                  )}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id} role="row" aria-rowindex={ri + 2}>
                {rowHeaders && (
                  <th
                    role="rowheader"
                    scope="row"
                    aria-colindex={1}
                    className={cn(
                      'sticky left-0 z-10 border-r border-b border-border bg-secondary px-2 text-right font-mono text-[11px] font-normal text-muted-foreground tabular-nums',
                      ri >= range.top &&
                        ri <= range.bottom &&
                        'bg-primary-subtle text-primary-text',
                    )}
                  >
                    {ri + 1}
                  </th>
                )}
                {columns.map((col, ci) => {
                  const isActive = cur.row === ri && cur.col === ci
                  const isEditing = editing?.cell.row === ri && editing.cell.col === ci
                  const selected = inRange(ri, ci)
                  const value = row[col.id]
                  const invalid = col.type === 'number' && typeof value === 'string'
                  return (
                    <td
                      key={col.id}
                      role="gridcell"
                      data-cell={`${String(ri)}:${String(ci)}`}
                      aria-colindex={ci + 1 + (rowHeaders ? 1 : 0)}
                      aria-selected={selected}
                      aria-readonly={col.readOnly ?? undefined}
                      aria-invalid={invalid || undefined}
                      tabIndex={isActive && !isEditing ? 0 : -1}
                      onMouseDown={(e) => {
                        if (isEditing || e.button !== 0) return
                        if (editing) finishEdit()
                        e.preventDefault()
                        const cell = { row: ri, col: ci }
                        setActive(cell)
                        if (!e.shiftKey) setAnchor(cell)
                        setDragging(true)
                        focusCell(cell)
                      }}
                      onMouseEnter={() => {
                        if (dragging) setActive({ row: ri, col: ci })
                      }}
                      onDoubleClick={() => {
                        startEdit({ row: ri, col: ci })
                      }}
                      className={cn(
                        'relative h-8 truncate border-r border-b border-border-subtle px-2.5 outline-none select-none',
                        col.type === 'number' && 'text-right font-mono text-[12.5px] tabular-nums',
                        col.readOnly ? 'bg-inset text-fg-secondary' : 'text-foreground',
                        selected && multi && 'bg-primary-subtle',
                        invalid && 'text-destructive',
                        // A corner mark as well as the colour, as spreadsheets flag a cell.
                        invalid &&
                          !isEditing &&
                          'after:absolute after:top-0 after:left-0 after:border-4 after:border-transparent after:border-t-destructive after:border-l-destructive',
                        isActive &&
                          'z-[1] shadow-[inset_0_0_0_2px_var(--color-primary)] focus-visible:shadow-[inset_0_0_0_2px_var(--color-ring)]',
                        isEditing && 'p-0',
                      )}
                    >
                      {isEditing ? (
                        <input
                          ref={focusInput}
                          aria-label={t.editCell(col.title, ri + 1)}
                          value={editing.draft}
                          inputMode={col.type === 'number' ? 'decimal' : undefined}
                          onChange={(e) => {
                            setEditing({ cell: editing.cell, draft: e.target.value })
                          }}
                          onBlur={() => {
                            finishEdit()
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              finishEdit({ row: e.shiftKey ? -1 : 1, col: 0 })
                            } else if (e.key === 'Tab') {
                              e.preventDefault()
                              finishEdit({ row: 0, col: e.shiftKey ? -1 : 1 })
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              cancelEdit()
                            }
                          }}
                          className={cn(
                            'h-full w-full bg-background px-2.5 text-foreground outline-none',
                            'shadow-[inset_0_0_0_2px_var(--color-ring)]',
                            col.type === 'number' && 'text-right font-mono text-[12.5px]',
                          )}
                        />
                      ) : (
                        display(col, value)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="m-0 px-4 py-6 text-center text-[13px] text-muted-foreground">{t.empty}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border-subtle bg-secondary/60 px-3 py-1.5 font-mono text-[11.5px] text-fg-secondary">
        <span>
          {columns[cur.col]?.title} {cur.row + 1}
        </span>
        {multi && <span>{t.cells(cellCount)}</span>}
        {numbers.length > 1 && (
          <>
            <span>{t.sum(formatNumber(Math.round(sum * 1e6) / 1e6))}</span>
            <span>{t.average(formatNumber(Math.round((sum / numbers.length) * 100) / 100))}</span>
          </>
        )}
      </div>
      <p id={`${baseId}-help`} className="sr-only">
        {editable ? t.help : t.helpReadOnly}
      </p>
      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  )
}

export {
  normalizeRange,
  parseSheetValue,
  parseTsv,
  pasteIntoRows,
  type SheetCell,
  type SheetColumn,
  type SheetRange,
  type SheetRow,
  type SheetValue,
  Spreadsheet,
  toTsv,
}
