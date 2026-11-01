---
'@coreloom/ui': minor
---

### Added

- `Heatmap` and `CalendarHeatmap` (`@coreloom/heatmap`): values on a grid of squares in five steps
  of one chart color, with a Less → More legend. `Heatmap` takes `{ row, column, value }` cells
  (weekday × hour, service × day); `CalendarHeatmap` lays `{ date, value }` days out in Monday-first
  weeks. One tab stop with arrow keys; every cell is named with its row, column or full date, and
  value.
- `FunnelChart` (`@coreloom/funnel-chart`): the steps of a flow as an ordered list, each with a
  bar against the first step, its count and share of the start, and between steps the share that
  continued.
- `TrendChart` (dashboard): `stacked` (`true`, or `'percent'` for 100 %), a per-series `type` to mix
  bars, lines and areas (combo charts), and `axis: 'right'` with `formatSecondaryValue` for a
  second axis. The tooltip now shows each series' name next to its formatted value.

### Upgrading

- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
