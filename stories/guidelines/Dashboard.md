# Dashboard

The parts of an app's overview page, as one installable block: a stat grid, a card that frames a chart, a ready-made trend chart and an activity feed.

**Install** `pnpm dlx shadcn@latest add @coreloom/dashboard`. It writes `dashboard.tsx` and `stat-card.tsx`; put them inside the app-shell block's `AppShell` + `PageHeader`.

**The consumer provides**:

- `<StatGrid stats>`: `StatCard` props (`label`, `value`, `delta`, `trend`, `good`, `note`, `sparkline` — recent values drawn as a small area chart); 1 to 4 columns by width.
- `<ChartCard title description actions>` around any chart or table; `actions` sit at the right (a `DateRangePicker`, a `ToggleGroup`).
- `<TrendChart data xKey series type stacked>`: `series` is `[{ key, label, type?, axis? }]` (up to five, coloured `chart-1` … `chart-5` in order), `type` is `area`, `bar` or `line`. `stacked` piles areas and bars up (`true`) or shows each one's share (`'percent'`). A series with its own `type` mixes marks (bars with a line: a combo chart), and `axis: 'right'` gives it a second axis for another unit, formatted by `formatSecondaryValue`. Axis and tooltip numbers follow the locale (or `formatValue`). Give it an `aria-label` that says what it shows.
- `<ActivityFeed items>`: `[{ id, title, description?, time?, icon?, status? }]`, newest first; `status` adds a `success` / `warning` / `danger` / neutral dot.

- Lead with the 4 numbers people check daily; one chart that answers "is it going well?"; then the detail (a table, the feed). Every number says its period.
