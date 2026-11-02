# Heatmap

Values on a grid of squares, darker for more: activity by weekday and hour, errors by service and day. `CalendarHeatmap` lays days out in weeks, a year at a glance. Five steps of one chart color, with a Less → More legend.

**The consumer provides**, for `Heatmap`: `data` — `{ row, column, value }[]` (`value: null` for a gap) — and an `aria-label`, plus optionally:

- `rows` / `columns` — their order (default: as they first appear);
- `columnLabelEvery` — label every nth column only (3 for 24 hours);
- `max` — the value of the darkest step (default: the largest value);
- `color` (`var(--chart-1)`), `cellSize` (20) and `formatValue`.

For `CalendarHeatmap`: `data` — `{ date: 'YYYY-MM-DD', value }[]` (several entries on one day add up) — and an `aria-label`, plus `to` (last day, default the latest date), `weeks` (53), `max`, `color`, `cellSize` (12) and `formatValue` ("3 deploys").

- The grid is one tab stop. Arrow keys move between cells, Home / End go to the ends of a row, Ctrl+Home / Ctrl+End to the corners. Each cell is named with its row, column (or full date) and value: "Tuesday 14 October 2026: 3 deploys".
- Hovering or focusing a cell shows the same text under the grid. Nothing is only in the color.
- Steps are quarters of `max`: 0 is the empty well, any value above 0 is at least the lightest step. Pass a fixed `max` when two heatmaps must compare.
- Dates are calendar days in UTC, so no time zone moves a day. Weeks start on Monday; the calendar scrolls to the latest weeks when it doesn't fit.
- Use a heatmap for patterns (when, where), not exact numbers: give a table next to it when the numbers matter.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/heatmap` and import from `@/components/ui/heatmap`.
