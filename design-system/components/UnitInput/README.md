# UnitInput

A number with its unit picked beside it: "12 px", "80 kg", "500 GB".

**The consumer provides** `units` (`{ value, label? }`), `value` + `onValueChange` (or `defaultValue`), with the value as `{ value: number | null, unit }`, a label (`id` for a FieldLabel), and optionally `convert(value, from, to)`, `min`, `max`, `step`, `formatOptions`, `stepper` (`none` by default) and `unitLabel`.

- The number is a NumberInput (locale parsing, arrows, spin button); the unit is a native select named "Unit", so it works everywhere and opens the system picker on phones.
- Without `convert`, changing the unit keeps the number (a new unit for the same amount); with it, the number becomes the same quantity in the new unit.
- For a single fixed unit, use NumberInput's `formatOptions` (`{ style: "unit", unit: "kilogram" }`) or an InputGroup addon instead.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/unit-input` and import from `@/components/ui/unit-input`._
