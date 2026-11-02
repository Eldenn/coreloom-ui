# FunnelChart

How many make it through each step of a flow — visit, sign-up, activation, payment — and where they drop. One row per step with a bar sized against the first step, the count and the share of the start; between rows, the share that went on.

**The consumer provides** `steps` — `{ key, label, value }[]`, in flow order — and an `aria-label`, plus optionally `color` (`var(--chart-1)`) and `formatValue` (default: the locale's number format).

- It's an ordered list: screen readers hear each step with its count and share of the first step, and between steps the share that continued and how many dropped.
- Shares are against the first step; the line between two steps is against the step before. A step of 0 shows 0 % and an empty bar.
- The steps must be one flow, each a subset of the one before. For categories that don't nest, use a `BarList`.
- Long labels truncate; counts and shares keep their column.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/funnel-chart` and import from `@/components/ui/funnel-chart`._
