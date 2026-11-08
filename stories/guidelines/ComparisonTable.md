# Comparison table

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Plans side by side, feature by feature: a real `<table>` whose header row (plan names, prices, buttons) stays in view while the page scrolls. Each cell is a tick, a dash, "Partial" or a value ("10 GB").

**The consumer provides** `<ComparisonTable plans groups caption onSelect onlyDifferences defaultOnlyDifferences onOnlyDifferencesChange>`: `plans` are `{ id, name, price?, cta?, featured?, badge? }`; `groups` are `{ id, name, features }`, each feature `{ id, name, description?, values }` where `values` maps a plan id to `true` (included), `false` or `null` (not included), `"partial"`, or a string or number shown as is. `onSelect(plan)` adds a button under each plan's name (`cta` sets its text). `caption` names the table for screen readers (default "Compare plans").

- Every cell has words: a tick reads "Included", a dash "Not included". Plans are column headers and features row headers, so a screen reader announces both for each cell.
- "Only show differences" hides the rows where every plan is the same (`differingFeatures` does it for your own views).
- On phones one plan column shows at a time, picked above the table; the featured plan first.
- The featured plan's column is tinted and topped with the accent; it is also named in its badge ("Most popular").
- For two or three plans with a few features each, plan cards (`@coreloom/pricing`) are enough.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/comparison-table`.
