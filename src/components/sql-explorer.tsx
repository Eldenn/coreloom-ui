'use client'

// Coreloom UI — SqlExplorer (block). Query a database from the browser: the schema as a tree
// (tables, then their columns and types; Enter inserts a name), query tabs, a SQL editor with
// completion from that schema (CodeMirror), Run with Mod-Enter (the selection, else everything),
// Cancel, and the result in a virtual table with its row count, time and CSV export. Your
// `onRun(sql, { signal })` sends the query to your API and returns the rows.
import { MySQL, PostgreSQL, sql as sqlLanguage, SQLite, StandardSQL } from '@codemirror/lang-sql'
import { Prec } from '@codemirror/state'
import { type EditorView, keymap } from '@codemirror/view'
import type { ColumnDef } from '@tanstack/react-table'
import { DownloadIcon, PlayIcon, PlusIcon, SquareIcon, TableIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { CodeEditor } from '@/components/ui/code-editor'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Kbd } from '@/components/ui/kbd'
import { TreeView, type TreeViewNode } from '@/components/ui/tree-view'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SqlColumn {
  name: string
  /** The column's type as the database names it: `text`, `int8`, `timestamptz`. */
  type: string
  primaryKey?: boolean
}

interface SqlTable {
  name: string
  kind?: 'table' | 'view'
  columns: SqlColumn[]
}

interface SqlResult {
  /** Column names, in order. */
  columns: string[]
  /** One array per row, in column order. */
  rows: unknown[][]
  /** Rows the query affected or matched, when it differs from `rows.length` (an UPDATE, a limit). */
  rowCount?: number
  /** How long the database took, in ms. */
  durationMs?: number
}

interface SqlQuery {
  id: string
  name: string
  sql: string
}

type SqlDialect = 'standard' | 'postgres' | 'mysql' | 'sqlite'

type RunState =
  | { status: 'idle' }
  | { status: 'running'; controller: AbortController }
  | { status: 'done'; result: SqlResult }
  | { status: 'error'; error: string }

const DIALECTS = { standard: StandardSQL, postgres: PostgreSQL, mysql: MySQL, sqlite: SQLite }
const IDLE: RunState = { status: 'idle' }

/** A cell as text: NULL for null and undefined, JSON for objects. */
function sqlCellText(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return value.toString()
  if (value instanceof Date) return value.toISOString()
  // JSON.stringify gives undefined for these: a database never sends them anyway.
  if (typeof value === 'function' || typeof value === 'symbol') return ''
  return JSON.stringify(value)
}

/**
 * A result as CSV (RFC 4180): quoted when needed, NULL as an empty cell. Text starting with = + - @
 * gets a leading ' so a spreadsheet doesn't run it as a formula.
 */
function sqlResultToCsv(result: SqlResult): string {
  const cell = (value: unknown) => {
    if (value === null || value === undefined) return ''
    let text = sqlCellText(value)
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [result.columns, ...result.rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  // Some browsers start the download after the click returns: free the URL a moment later.
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

function schemaNodes(tables: readonly SqlTable[]): TreeViewNode[] {
  return tables.map((tb) => ({
    id: tb.name,
    label: tb.name,
    icon: <TableIcon aria-hidden />,
    children: tb.columns.map((c) => ({
      id: `${tb.name}.${c.name}`,
      label: c.name,
      meta: <span className="font-mono text-[11px] text-muted-foreground">{c.type}</span>,
    })),
  }))
}

function ResultView({ state, queryName }: { state: RunState; queryName: string }) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.sqlExplorer
  const columns = React.useMemo<ColumnDef<unknown[]>[]>(() => {
    if (state.status !== 'done') return []
    return state.result.columns.map((name, i) => ({
      id: `${String(i)}:${name}`,
      accessorFn: (row) => row[i],
      header: ({ column }) => <DataTableColumnHeader column={column} title={name} />,
      cell: ({ getValue }) => {
        const value = getValue()
        return value === null || value === undefined ? (
          <span className="font-mono text-[12px] text-muted-foreground">NULL</span>
        ) : (
          <span className="font-mono text-[12.5px] whitespace-nowrap">{sqlCellText(value)}</span>
        )
      },
    }))
  }, [state])

  if (state.status === 'idle')
    return <p className="m-0 p-4 text-[13px] text-muted-foreground">{t.idle}</p>
  if (state.status === 'running')
    return <p className="m-0 p-4 text-[13px] text-muted-foreground">{t.running}</p>
  if (state.status === 'error')
    return (
      <pre className="m-4 rounded-md border border-destructive/40 bg-destructive-subtle px-3 py-2.5 font-mono text-[12.5px] whitespace-pre-wrap text-destructive">
        {state.error}
      </pre>
    )
  const { result } = state
  return (
    <div className="flex min-h-0 flex-col gap-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-[12.5px] text-fg-secondary">
          {t.rows(formatNumber(result.rowCount ?? result.rows.length))}
          {result.durationMs !== undefined && ` · ${t.duration(formatNumber(result.durationMs))}`}
        </p>
        <Button
          size="sm"
          variant="outline"
          disabled={!result.columns.length}
          onClick={() => {
            downloadCsv(sqlResultToCsv(result), `${queryName || 'query'}.csv`)
          }}
        >
          <DownloadIcon />
          {t.exportCsv}
        </Button>
      </div>
      {result.columns.length > 0 && (
        <DataTable
          columns={columns}
          data={result.rows}
          emptyText={t.noRows}
          virtual={{ height: 300, rowHeight: 37, label: t.results }}
        />
      )}
    </div>
  )
}

function QueryTabs({
  queries,
  activeId,
  onSelect,
  onClose,
  onAdd,
}: {
  queries: SqlQuery[]
  activeId: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onAdd: () => void
}) {
  const t = useCoreloomI18n().messages.sqlExplorer
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-1.5">
      <ul aria-label={t.queries} className="m-0 flex list-none gap-1 p-0">
        {queries.map((q) => (
          <li
            key={q.id}
            className="group flex items-center rounded-md has-aria-[current]:bg-secondary"
          >
            <button
              type="button"
              aria-current={q.id === activeId || undefined}
              className="cursor-pointer rounded-md px-2.5 py-1 text-[12.5px] whitespace-nowrap text-fg-secondary outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring aria-[current]:font-medium aria-[current]:text-foreground"
              onClick={() => {
                onSelect(q.id)
              }}
            >
              {q.name}
            </button>
            {queries.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6"
                aria-label={t.closeQuery(q.name)}
                onClick={() => {
                  onClose(q.id)
                }}
              >
                <XIcon />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="icon-sm" aria-label={t.newQuery} onClick={onAdd}>
        <PlusIcon />
      </Button>
    </div>
  )
}

function useQueries(defaultQueries: SqlQuery[] | undefined, firstName: (n: number) => string) {
  const [queries, setQueries] = React.useState<SqlQuery[]>(
    () => defaultQueries ?? [{ id: 'q1', name: firstName(1), sql: '' }],
  )
  const [activeId, setActiveId] = React.useState(queries[0].id)
  const [runs, setRuns] = React.useState<Partial<Record<string, RunState>>>({})
  const counter = React.useRef(queries.length)
  const active = queries.find((q) => q.id === activeId) ?? queries[0]
  return {
    queries,
    active,
    run: runs[active.id] ?? IDLE,
    setRun: (id: string, state: RunState) => {
      setRuns((r) => ({ ...r, [id]: state }))
    },
    select: setActiveId,
    edit: (sql: string) => {
      setQueries((qs) => qs.map((q) => (q.id === active.id ? { ...q, sql } : q)))
    },
    add: () => {
      counter.current += 1
      const q = { id: `q${String(counter.current)}`, name: firstName(counter.current), sql: '' }
      setQueries((qs) => [...qs, q])
      setActiveId(q.id)
    },
    close: (id: string) => {
      const index = queries.findIndex((q) => q.id === id)
      const rest = queries.filter((q) => q.id !== id)
      setQueries(rest)
      if (id === active.id) setActiveId(rest[Math.max(0, index - 1)].id)
    },
  }
}

const RUN_EVENT = 'coreloom-sql-run'
// Mod-Enter in the editor: an event the explorer listens for, so the keymap never changes.
const runKeymap = Prec.highest(
  keymap.of([
    {
      key: 'Mod-Enter',
      run: (view) => {
        view.dom.dispatchEvent(new CustomEvent(RUN_EVENT, { bubbles: true }))
        return true
      },
    },
  ]),
)

function runQuery(
  q: ReturnType<typeof useQueries>,
  text: string,
  onRun: (sql: string, options: { signal: AbortSignal }) => Promise<SqlResult>,
  cancelled: string,
) {
  if (q.run.status === 'running' || !text.trim()) return
  const id = q.active.id
  const controller = new AbortController()
  q.setRun(id, { status: 'running', controller })
  onRun(text, { signal: controller.signal }).then(
    (result) => {
      q.setRun(id, { status: 'done', result })
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      q.setRun(id, { status: 'error', error: controller.signal.aborted ? cancelled : message })
    },
  )
}

function SqlExplorer({
  tables,
  onRun,
  dialect = 'standard',
  defaultQueries,
  className,
}: {
  /** The database's tables and columns: the tree, and completion in the editor. */
  tables: SqlTable[]
  /** Runs one query. Rejects with an Error whose message is shown; `signal` aborts on Cancel. */
  onRun: (sql: string, options: { signal: AbortSignal }) => Promise<SqlResult>
  /** Keywords and quoting for completion and highlighting. */
  dialect?: SqlDialect
  /** The tabs to start with (default: one empty query). */
  defaultQueries?: SqlQuery[]
  className?: string
}) {
  const t = useCoreloomI18n().messages.sqlExplorer
  const q = useQueries(defaultQueries, t.queryN)
  const viewRef = React.useRef<EditorView | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const nodes = React.useMemo(() => schemaNodes(tables), [tables])
  const extensions = React.useMemo(
    () => [
      sqlLanguage({
        dialect: DIALECTS[dialect],
        upperCaseKeywords: true,
        schema: Object.fromEntries(tables.map((tb) => [tb.name, tb.columns.map((c) => c.name)])),
      }),
      runKeymap,
    ],
    [tables, dialect],
  )
  const run = () => {
    const view = viewRef.current
    const selection = view?.state.selection.main
    // The selection when there is one, else the whole query.
    const text =
      view && selection && !selection.empty
        ? view.state.sliceDoc(selection.from, selection.to)
        : q.active.sql
    runQuery(q, text, onRun, t.cancelled)
  }
  const onRunKey = React.useEffectEvent(run)
  React.useEffect(() => {
    const root = rootRef.current
    const listener = () => {
      onRunKey()
    }
    root?.addEventListener(RUN_EVENT, listener)
    return () => {
      root?.removeEventListener(RUN_EVENT, listener)
    }
  }, [])
  const insert = (node: TreeViewNode) => {
    const view = viewRef.current
    if (!view) return
    const name = node.id.includes('.') ? node.label : node.id
    view.dispatch(view.state.replaceSelection(name))
    view.focus()
  }

  return (
    <div
      ref={rootRef}
      data-slot="sql-explorer"
      className={cn(
        'grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-[220px_minmax(0,1fr)]',
        className,
      )}
    >
      <div className="flex min-h-0 flex-col border-border max-md:max-h-56 max-md:border-b md:border-r">
        <p className="m-0 px-3 pt-3 pb-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {t.schema}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
          {tables.length ? (
            <TreeView nodes={nodes} aria-label={t.schema} onAction={insert} />
          ) : (
            <p className="m-0 px-1.5 text-[12.5px] text-muted-foreground">{t.noTables}</p>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-col">
        <QueryTabs
          queries={q.queries}
          activeId={q.active.id}
          onSelect={q.select}
          onClose={q.close}
          onAdd={q.add}
        />
        <CodeEditor
          path={q.active.id}
          value={q.active.sql}
          onChange={q.edit}
          extensions={extensions}
          onViewChange={(view) => {
            viewRef.current = view
          }}
          placeholder={t.placeholder}
          minHeight="160px"
          maxHeight="320px"
          aria-label={t.editor(q.active.name)}
          className="rounded-none border-0 border-b"
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
          {/* One button that turns into Cancel and back, so focus stays on it. */}
          <Button
            size="sm"
            variant={q.run.status === 'running' ? 'outline' : 'default'}
            disabled={q.run.status !== 'running' && !q.active.sql.trim()}
            onClick={() => {
              if (q.run.status === 'running') q.run.controller.abort()
              else run()
            }}
          >
            {q.run.status === 'running' ? <SquareIcon /> : <PlayIcon />}
            {q.run.status === 'running' ? t.cancel : t.run}
          </Button>
          <span className="hidden items-center gap-1 text-[12px] text-muted-foreground sm:flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>Enter</Kbd>
            <span>{t.runHint}</span>
          </span>
        </div>
        <section
          aria-label={t.results}
          aria-busy={q.run.status === 'running' || undefined}
          className="min-h-32"
        >
          <ResultView state={q.run} queryName={q.active.name} />
        </section>
        <span role="status" className="sr-only">
          {q.run.status === 'done' &&
            t.rows(String(q.run.result.rowCount ?? q.run.result.rows.length))}
          {q.run.status === 'error' && t.failed}
        </span>
      </div>
    </div>
  )
}

export { type SqlColumn, SqlExplorer, type SqlQuery, type SqlResult, sqlResultToCsv, type SqlTable }
