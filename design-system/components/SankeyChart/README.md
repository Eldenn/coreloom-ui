# SankeyChart

Where a quantity flows from step to step — visitors from sources to pages to plans, tokens from agents to tools. Nodes sit in columns and bands are as wide as the flow. Nodes take the chart colors by column, and each band takes its source's color. On Recharts through `ChartContainer`.

**The consumer provides** `nodes` — `{ id, label }[]` —, `links` — `{ source, target, value }[]` with node ids — and an `aria-label`, plus optionally `height` (320) and `formatValue`.

- Links to unknown ids, loops (a node to itself) and values of 0 or less are left out. With no valid link it shows "No data".
- Labels sit right of their node, and left of it in the last column.
- Hover a band or a node for its value. Screen readers get every flow as a sentence ("Search to Pricing page: 4,200").
- Keep it to 3 or 4 columns and a dozen nodes. For a single path with drop-offs, a `FunnelChart` is clearer.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/sankey-chart` and import from `@/components/ui/sankey-chart`._
