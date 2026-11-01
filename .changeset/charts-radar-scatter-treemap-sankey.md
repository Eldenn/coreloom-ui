---
'@coreloom/ui': minor
---

### Added

- `RadarChart` (`@coreloom/radar-chart`): up to three series compared on the same measures, one
  axis each around a circle.
- `ScatterChart` (`@coreloom/scatter-chart`): two measures across many items, up to three groups,
  with an optional `size` measure for a bubble chart and named points in the tooltip.
- `TreemapChart` (`@coreloom/treemap-chart`): many parts of a whole as tiles sized by value,
  colored by up to five groups, with names and values in tiles that have room for them.
- `SankeyChart` (`@coreloom/sankey-chart`): flows between nodes in columns, as wide as the flow,
  colored by the column they leave. Unknown ids, loops and non-positive values are left out.
- All four sit on Recharts through `ChartContainer`, and give screen readers their data as text:
  a table (radar, scatter) or a list with values and shares (treemap, sankey).

### Upgrading

- The new items read new strings in the `charts` group: re-install `@coreloom/i18n` (and
  `@coreloom/i18n-es` / `@coreloom/i18n-de` if you use them) with `--overwrite` first.
