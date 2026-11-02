# DonutChart

How a whole splits into a few parts: a ring with the total in the middle and a legend that gives each part's value and share as text. Plain SVG, nothing to measure, no animation.

**The consumer provides** `data` — `{ key, label, value }[]` — and an `aria-label`, plus optionally:

- `maxSlices` (default 3, at most 5) — parts that get a color of their own; the rest are summed into a grey "Other";
- `centerLabel` (default "Total") and `centerValue` (default: the total, formatted);
- `formatValue` — formats the middle and the legend (currency, units). Default: the locale's number format;
- `size` (default 160) — the ring's diameter in pixels;
- `legend` — `"right"` (default, wraps under the ring when narrow), `"bottom"` or `"none"`.

- Parts are sorted largest first and take `chart-1`, `chart-2`… in that order. Zero and negative values are dropped. When only one part would go into "Other", it's shown by name instead.
- Three colored parts is the validated limit when every color touches every other; go up to five only with the legend right beside the ring. More than that is a job for a `BarList`.
- The legend is the accessible version: a list with each label, value and percentage. With `legend="none"`, screen readers only get the total — give the numbers elsewhere.
- Hovering a part or a legend row dims the others. It only emphasises: nothing is hidden behind hover.
- Use it for parts of one whole at one moment. For change over time use a `TrendChart`; to compare items that don't add up to a whole, use a `BarList`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/donut-chart` and import from `@/components/ui/donut-chart`._
