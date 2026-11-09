# SQL explorer

Query a database from the browser: schema tree, query tabs, SQL editor with completion, Run / Cancel, virtual results, CSV.

**Install** `pnpm dlx shadcn@latest add @coreloom/sql-explorer`. Experimental.

**The consumer provides** `tables` (`{ name, columns: { name, type }[] }`) and `onRun(sql, { signal })` returning `{ columns, rows, rowCount?, durationMs? }`; optionally `dialect` and `defaultQueries`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `SqlExplorer`._
