# Gauge

One value against its range, as an open ring with the number in the middle: a quota, an error budget, an SLO, a score. Optional thresholds turn it amber, then red, and say so in words.

**The consumer provides** `value`, plus optionally:

- `min` / `max` (default 0 and 100);
- `label` — what the value is ("Storage used"), shown under the number and used as the meter's name;
- `unit` — written after the number ("%", "GB");
- `warning` / `critical` — where those zones start. Without them the gauge is a plain `chart-1` ring with no status;
- `higherIsBetter` — for uptime or a score: the zones then start at or below the thresholds;
- `formatValue` (default: the locale's number format) and `size` (default 160).

- It's a `meter` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a value text ("86.5 % of 100, warning"); the label names it.
- Colour is never the only sign: with thresholds, the status ("Normal", "Warning", "Critical") is written under the label, and tick marks show where the zones start.
- Values outside the range are clamped on the ring; the number in the middle stays the real one.
- For a value inside a sentence or a table row, use `Progress`; for the context window of a chat, `ContextMeter`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/gauge` and import from `@/components/ui/gauge`.
