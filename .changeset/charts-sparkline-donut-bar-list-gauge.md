---
'@coreloom/ui': minor
---

### Added

- `Sparkline` (`@coreloom/sparkline`): a word-sized trend (line, area or bars) in plain SVG for stat
  cards, table cells and list rows. Screen readers hear your label plus the first and last value,
  the low and the high.
- `DonutChart` (`@coreloom/donut-chart`): parts of a whole as a ring with the total in the middle
  and a legend that states each value and share. Parts past `maxSlices` (3 by default, 5 at most)
  fold into a grey "Other".
- `BarList` (`@coreloom/bar-list`): a ranking as an HTML list, with a proportional bar per row,
  optional links through the app's router and a "Show all" button past `limit`.
- `Gauge` (`@coreloom/gauge`): one value against its range as an open ring, exposed as a `meter`,
  with optional `warning` / `critical` zones (stated in words) and `higherIsBetter` for uptime or
  scores.
- `StatCard` (app-shell, dashboard): `sparkline` prop, recent values drawn as a small area chart
  under the value.

### Upgrading

- The new items read new strings (`charts`): re-install `@coreloom/i18n` (and `@coreloom/i18n-es` /
  `@coreloom/i18n-de` if you use them) with `--overwrite` first. Re-installing the app-shell or
  dashboard block pulls in `@coreloom/sparkline` for `StatCard`.
