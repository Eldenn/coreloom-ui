# TreemapChart

Many parts of a whole at once, as tiles sized by value — storage by bucket, spend by service, tokens by agent. Tiles take a tint of their group's color with a solid top edge; names and values are written in tiles big enough to hold them. On Recharts through `ChartContainer`, without animation.

**The consumer provides** `data` — `{ name, value, group? }[]` — and an `aria-label`, plus optionally `groups` — `{ key, label }[]`, up to five, colored `chart-1` … `chart-5` and shown in a legend —, `height` (320) and `formatValue`.

- Values must be positive parts of one whole; zero and negative values are dropped. Items are laid out largest first.
- Without `groups`, every tile is `chart-1`: the size is the message. Don't color tiles one by one: the palette has five colors, never cycle it.
- The tooltip gives the name, the group, the value and the share. Screen readers get every item with its value and share as a list.
- For under six parts, a `DonutChart` or a `BarList` reads more precisely.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/treemap-chart` and import from `@/components/ui/treemap-chart`.
