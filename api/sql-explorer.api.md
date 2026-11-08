# @coreloom/sql-explorer

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/sql-explorer.tsx

```ts
type SqlColumn = {}
SqlColumn.name: string
SqlColumn.type: string
SqlColumn.primaryKey?: boolean | undefined
function SqlExplorer
SqlExplorer.tables: SqlTable[]
SqlExplorer.onRun: (sql: string, options: { signal: AbortSignal; }) => Promise<SqlResult>
SqlExplorer.dialect?: SqlDialect | undefined
SqlExplorer.defaultQueries?: SqlQuery[] | undefined
SqlExplorer.className?: string | undefined
type SqlQuery = {}
SqlQuery.id: string
SqlQuery.name: string
SqlQuery.sql: string
type SqlResult = {}
SqlResult.columns: string[]
SqlResult.rows: unknown[][]
SqlResult.rowCount?: number | undefined
SqlResult.durationMs?: number | undefined
function sqlResultToCsv(result: SqlResult) => string
type SqlTable = {}
SqlTable.name: string
SqlTable.kind?: 'table' | 'view' | undefined
SqlTable.columns: SqlColumn[]
```
