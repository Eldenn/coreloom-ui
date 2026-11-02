# ScatterChart

How two measures relate across many items — latency against cost per model, error rate against latency per service. One dot per item, up to three groups by color, and an optional third measure as the dot's size (a bubble chart). On Recharts through `ChartContainer`.

**The consumer provides** `groups` — `{ key, label, points: { x, y, size?, name? }[] }[]` —, `xLabel` and `yLabel` (axis titles with their unit) and an `aria-label`, plus optionally `sizeLabel`, `formatX` / `formatY` / `formatSize` (default: the locale's number format) and `height` (300).

- Up to three groups, in `chart-1` … `chart-3`: every color meets every other, so three is the validated limit.
- Name the points (`name`): the tooltip shows the name and each measure, and screen readers get every point in a table.
- When any point has a `size`, dots are drawn as bubbles with a lighter fill so overlaps stay visible. Size is the hardest channel to read: keep the key comparison on the axes.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/scatter-chart` and import from `@/components/ui/scatter-chart`._
