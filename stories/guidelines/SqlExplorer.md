# SQL explorer

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Query a database from the browser: the schema as a tree, query tabs, a SQL editor (CodeMirror, with completion from the schema), **Run** and **Cancel**, and the result in a virtual table with its row count, time and CSV export.

**The consumer provides** `<SqlExplorer tables onRun dialect defaultQueries>`: `tables` are `{ name, kind?, columns: { name, type, primaryKey? }[] }`; `onRun(sql, { signal })` sends one query to your API and resolves to `{ columns, rows, rowCount?, durationMs? }` (`rows` are arrays in column order), or rejects with an `Error` whose message is shown. `dialect` is `standard`, `postgres`, `mysql` or `sqlite` (keywords and completion); `defaultQueries` are the tabs to start with (`{ id, name, sql }`).

- Mod-Enter (Ctrl or ⌘ + Enter) in the editor runs the selection, or the whole query. Run turns into Cancel while it runs, which aborts `signal`: pass it to `fetch`.
- Enter (or a click) on a table or a column in the tree inserts its name at the cursor.
- Results are a DataTable with sortable columns that renders only the visible rows; NULL shows as such. **Export CSV** downloads them (RFC 4180, formulas neutralised); `sqlResultToCsv` is the same as a function.
- Each tab keeps its own text, undo history and result. The result is a labelled region, busy while a query runs; the row count, or the failure, is announced.
- Never run what the browser sends with more rights than the person has: check the query on your server (read-only role, timeouts, row limits).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/sql-explorer`.
