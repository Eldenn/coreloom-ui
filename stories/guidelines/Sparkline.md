# Sparkline

A word-sized trend with no axes, drawn next to a number: in a StatCard, a table cell or a list row. Plain SVG, so a table can hold hundreds of them without measuring anything.

**The consumer provides** `data` (the values, oldest first) and an `aria-label` saying what the trend is, plus optionally:

- `type` — `"line"` (default), `"area"` or `"bar"` (bars start at zero; negative values hang below it);
- `color` — a chart token, `var(--chart-1)` by default;
- `height` (default 32) and `width` (fills the parent by default);
- `min` / `max` — a fixed scale, for rows that must compare (otherwise each series uses its own range);
- `showLast` (default `true`) — a dot on the latest value of a line or area;
- `formatValue` — formats the numbers in the screen-reader summary (default: the locale's number format).

- It's an image whose name is your `aria-label` plus a summary: "Sign-ups, last 12 weeks. Trend from 42 to 108. Low 42, high 108." Don't repeat that in visible text.
- A sparkline shows the shape, not the numbers: always put the current value next to it, and give exact figures in a table or a full chart when they matter.
- Every row of a table gets its own scale by default. Pass the same `min` and `max` when rows must be compared with each other.
- With no data it draws a dashed baseline and says "No data".
- `StatCard` takes `sparkline={values}` and draws an area sparkline under its value.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/sparkline` and import from `@/components/ui/sparkline`.
