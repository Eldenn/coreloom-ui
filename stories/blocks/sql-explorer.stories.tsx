import type { Meta, StoryObj } from '@storybook/react-vite'

import { SqlExplorer, type SqlResult, type SqlTable } from '@/components/sql-explorer'

const tables: SqlTable[] = [
  {
    name: 'projects',
    columns: [
      { name: 'id', type: 'int8', primaryKey: true },
      { name: 'name', type: 'text' },
      { name: 'owner_id', type: 'int8' },
      { name: 'plan', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'users',
    columns: [
      { name: 'id', type: 'int8', primaryKey: true },
      { name: 'email', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'last_seen_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'events',
    columns: [
      { name: 'id', type: 'int8', primaryKey: true },
      { name: 'project_id', type: 'int8' },
      { name: 'kind', type: 'text' },
      { name: 'payload', type: 'jsonb' },
    ],
  },
]

const data: Record<string, SqlResult> = {
  projects: {
    columns: ['id', 'name', 'owner_id', 'plan', 'created_at'],
    rows: [
      [1, 'Atlas', 3, 'team', '2026-03-02T09:00:00Z'],
      [2, 'Billing service', 1, 'pro', '2026-05-18T14:20:00Z'],
      [3, 'Design system', 2, 'free', '2026-08-01T08:45:00Z'],
      [4, 'Docs, site, "blog"', 1, null, '2026-10-12T17:02:00Z'],
    ],
  },
  users: {
    columns: ['id', 'email', 'name', 'last_seen_at'],
    rows: [
      [1, 'ada@coreloom.dev', 'Ada Lovelace', '2026-10-14T08:10:00Z'],
      [2, 'grace@coreloom.dev', 'Grace Hopper', '2026-10-13T19:44:00Z'],
      [3, 'alan@coreloom.dev', 'Alan Turing', null],
    ],
  },
  events: {
    columns: ['id', 'project_id', 'kind', 'payload'],
    rows: Array.from({ length: 2000 }, (_, i) => [
      i + 1,
      (i % 4) + 1,
      ['deploy', 'build', 'comment', 'invite'][i % 4],
      { step: i % 7, ok: i % 11 !== 0 },
    ]),
  },
}

/** A pretend database: SELECTs from the three tables; anything else fails like Postgres would. */
function fakeRun(sql: string, { signal }: { signal: AbortSignal }) {
  return new Promise<SqlResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      const table = /from\s+(\w+)/i.exec(sql)?.[1]?.toLowerCase()
      if (!table || !(table in data)) {
        reject(
          new Error(
            `ERROR:  relation "${table ?? '?'}" does not exist\nLINE 1: ${sql.trim().split('\n')[0]}`,
          ),
        )
        return
      }
      resolve({ ...data[table], durationMs: 12 + table.length * 7 })
    }, 500)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

const meta = {
  title: 'Blocks/Developer/SQL explorer',
  component: SqlExplorer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Query a database from the browser. The consumer provides `tables` (the schema: tree and completion), `onRun(sql, { signal })` that sends the query to its API and returns `{ columns, rows, rowCount?, durationMs? }`, and optionally `dialect` and `defaultQueries`. Mod-Enter runs the selection, or everything; Cancel aborts the signal.',
      },
    },
  },
  args: {
    tables,
    onRun: fakeRun,
    dialect: 'postgres',
    defaultQueries: [
      {
        id: 'q1',
        name: 'Projects',
        sql: 'SELECT id, name, plan\nFROM projects\nORDER BY created_at DESC;',
      },
      { id: 'q2', name: 'Events', sql: 'SELECT * FROM events LIMIT 2000;' },
    ],
  },
} satisfies Meta<typeof SqlExplorer>
export default meta
type Story = StoryObj<typeof meta>

/** Run a query (or press Ctrl / ⌘ + Enter in the editor); click a column in the tree to insert it. */
export const Default: Story = {}

/** A query on a table that doesn't exist: the database's error under the editor. */
export const QueryError: Story = {
  args: { defaultQueries: [{ id: 'q1', name: 'Typo', sql: 'SELECT * FROM project;' }] },
}

export const Empty: Story = { args: { tables: [], defaultQueries: undefined } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const French: Story = { globals: { locale: 'fr' } }
