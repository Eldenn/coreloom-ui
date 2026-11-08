# Comparison table

Plans side by side, feature by feature, under a sticky header. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/comparison-table`. It writes `comparison-table.tsx`.

**The consumer provides** `<ComparisonTable plans groups onSelect>`: plans `{ id, name, price?, cta?, featured? }`, groups `{ id, name, features: { id, name, description?, values }[] }` with values `true`, `false`, `"partial"` or a string.

- Every cell has words for screen readers. "Only show differences" hides identical rows.
- On phones one plan shows at a time, picked above the table.

_On `window.CoreloomUIDesignSystem_ff5f32` as `ComparisonTable`._
