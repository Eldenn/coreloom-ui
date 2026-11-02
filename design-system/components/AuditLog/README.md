# Audit log

Who did what and when, grouped by day.

**Install** `pnpm dlx shadcn@latest add @coreloom/audit-log`. It writes `audit-log.tsx`.

**The consumer provides** `<AuditLog events actions hasMore loading onLoadMore onExport>`: events `{ id, actor: { name, type? }, action, target?, at, ip?, location?, metadata? }`, actions `{ value, label }`.

- Search plus actor and action filters; the result count is announced. Rows with metadata open to show it as JSON.
- Load more and Export are callbacks.

_On `window.CoreloomUIDesignSystem_ff5f32` as `AuditLog`._
