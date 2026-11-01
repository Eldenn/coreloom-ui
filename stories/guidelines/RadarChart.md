# RadarChart

Two or three things compared on the same handful of measures — models on evals, plans on features — with one axis per measure around a circle and one outline per series. On Recharts through `ChartContainer`.

**The consumer provides** `data` (one row per measure, with a value per series), `angleKey` (the field naming the measure), `series` — `{ key, label }[]` — and an `aria-label`, plus optionally `max` (the top of the scale; pass it when scores have a fixed maximum, like 100), `height` (300) and `formatValue`.

- Up to three series, in `chart-1` … `chart-3`; past that the outlines can't be told apart. Use a grouped bar chart or a table instead.
- Use 4 to 8 measures on one scale. Radars exaggerate differences on the outer ring, and the order of axes changes the shape: keep the order meaningful and the same between charts.
- Screen readers get the chart's name and the same numbers as a table (measures × series). The tooltip formats with `formatValue`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/radar-chart` and import from `@/components/ui/radar-chart`.
