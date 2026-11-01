# BarList

A ranking: one row per item with its label over a proportional bar and the value at the right — top pages, busiest agents, biggest customers. Plain HTML, so it reads as a list and every label stays selectable.

**The consumer provides** `data` — `{ label, value, key?, href?, icon? }[]` — and an `aria-label` saying what the list ranks, plus optionally:

- `sortOrder` — `"desc"` (default), `"asc"` or `"none"` to keep your order;
- `limit` — rows shown before a "Show all (n)" button (default: every row);
- `max` — the value a full bar stands for (default: the largest value; use 100 for percentages);
- `color` — a chart token, `var(--chart-1)` by default;
- `formatValue` — formats the values (default: the locale's number format).

- A label with an `href` is a link, through the app's router for in-app paths (`CoreloomLinkProvider`).
- The button toggles between "Show all (n)" and "Show less", says whether the list is expanded (`aria-expanded`) and keeps focus.
- The bars are decoration: screen readers read each row as its label and value.
- Long labels truncate with an ellipsis; values keep their column.
- Prefer it to a pie or a donut past three or four items, and to a bar chart when labels are long.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/bar-list` and import from `@/components/ui/bar-list`._
