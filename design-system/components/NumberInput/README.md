# Number Input

A number typed the way the reader writes it ("1 234,5" in French, "1,234.5" in English), with − / + buttons and the keys of a spin button.

**The consumer provides** `value` + `onValueChange` (a `number`, or `null` when empty; or `defaultValue`), an `id` for its `FieldLabel`, and optionally `min` / `max`, `step` (1), `largeStep` (10 × step), `formatOptions`, `stepper` (`end` default — stacked chevrons, `sides` — − and + on either side, `none`) and `locale` (defaults to the i18n locale).

- Keys: ↑ / ↓ add or remove a step, Shift + arrows and Page Up / Page Down a large step, Home / End go to `min` / `max`. The field is a `spinbutton` with its value, bounds and formatted text exposed.
- The buttons are not tab stops (the arrows do the same) and are disabled at the bounds. They keep focus in the field.
- While typing the text stays as typed; on blur it is clamped to `min` / `max`, rounded to what the format shows, and formatted with grouping.
- `formatOptions` is `Intl.NumberFormat` options: `{ style: "unit", unit: "kilogram" }` shows "2.5 kg"; `{ style: "percent" }` shows "15%" for a value of `0.15` — use `step={0.01}` with it. Typed units and `%` are ignored when reading.
- Stepping never adds floating-point noise (0.1 + 0.2 is 0.3). `stepNumber` and `parseNumber` are exported for your own code.
- For money, use `MoneyInput`. For a value on a scale where the exact number matters less, use `Slider`.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/number-input` and import from `@/components/ui/number-input`._
