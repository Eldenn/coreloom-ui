# Chart

The shadcn chart layer on Recharts 3: a container that sets series colors, plus a tooltip and a legend on the Coreloom tokens.

**The consumer provides**:

- a `ChartConfig` mapping each series key to a `label` and a `color` (or per-theme `theme: { dark, light }`);
- `<ChartContainer config>` with a height, around any Recharts chart (`BarChart`, `LineChart`, `AreaChart`…) imported from `recharts`;
- `<ChartTooltip content={<ChartTooltipContent />} />` and `<ChartLegend content={<ChartLegendContent />} />` inside the chart.

Marks use `var(--color-<key>)`.

- Series colors are the `chart-1` … `chart-5` tokens, in that order: teal, violet, orange, blue, magenta. They're validated for color-vision deficiency and for 3:1 contrast on `bg-1` and `surface-2` in both themes. Take the slots in order and never cycle them. Past five series, fold the rest into "Other". For scatter, pie and other charts where every series meets every other, stop at three.
- Axis ticks are mono 12px in `fg-muted`. The grid is a `border-subtle` hairline. The tooltip is a `surface-1` card with values in mono.
- For a trend next to a number use `Sparkline`; for parts of a whole, `DonutChart`; for a ranking, `BarList`; for one value against its range, `Gauge`. They share these tokens and need no `ChartContainer`.
- `accessibilityLayer` adds keyboard focus to the marks. Pair a chart with a table view or direct labels when the numbers matter. Don't use `success` / `warning` / `danger` as series colors: they mean status.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/chart` and import from `@/components/ui/chart`._
