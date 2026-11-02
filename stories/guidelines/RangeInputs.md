# RangeInputs

Two fields for the two ends of a range. `NumberRangeInput` for a price filter (€20 – €80) or an age bracket; `TimeRangePicker` for opening hours (09:00 – 18:00) or a shift.

**The consumer provides** for `NumberRangeInput`, `value` + `onValueChange` (`{ min, max }`, each a number or `null`), and optionally `min`, `max`, `step`, `formatOptions`, `minLabel`, `maxLabel`. For `TimeRangePicker`, `value` + `onValueChange` (`{ start?, end? }` as "HH:mm"), and optionally `step` (minutes, 30 by default), `min`, `max`, `overnight`, `startLabel`, `endLabel`. Both take `id` (goes on the first field, for a `FieldLabel`), `disabled` and `onBlur`.

- Each end is named ("Minimum", "Start"), and either may be left empty: an open range ("from €20") is a valid answer.
- An upside-down range is flagged under the fields and marks both invalid; it is never swapped behind people's backs. With `overnight`, an end before the start reads as the next day (a night shift) and says so.
- Use them for filters and schedules. Use DateRangePicker for days, and Slider with two thumbs when the exact numbers matter less than the feel.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/range-inputs` and import from `@/components/ui/range-inputs`.
