# QuotaBar

How much of a limit is used, and by what: storage by file type, AI credits by feature, seats, API calls this month.

**The consumer provides** a `label`, the `max`, and `segments` (`{ label, value, className? }`) or a single `value`. Optional: `format` and its options (as FormatNumber: `bytes`, `integer`, `compact`…), `warnAt` (0.8) and `dangerAt` (0.95), `legend` (true) and a `description` (when it resets, a link to upgrade).

- The figure turns amber near the limit and red at it; say what happens then and what to do in the `description`.
- Five segments at most; group the small ones as "Other". The legend also shows what is left.
- It is a meter for screen readers, with the used amount and the percentage.
- For a task's progress use Progress; for one value against a target on a dashboard, Gauge.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/quota-bar` and import from `@/components/ui/quota-bar`.
