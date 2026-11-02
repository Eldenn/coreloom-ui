# Slider Input

A `Slider` and a `NumberInput` on one value: drag for a rough value, type an exact one.

**The consumer provides** `value` + `onValueChange` (a number; or `defaultValue`), `min` (0), `max` (100), `step` (1), `label` (names the slider, and the number field when no `id` is given), an `id` for the `FieldLabel`, and optionally `formatOptions` (units, percent), `disabled`, `onBlur`, `inputClassName` (number field width, `w-28` by default).

- Both controls move together. A typed value is clamped to the range; an emptied number field leaves the slider where it was and gets the number back on blur.
- The slider and the field are each a tab stop with their own keys (arrows, Page Up / Down, Home / End).
- Use it for settings where the exact number matters sometimes (temperature, opacity, a limit). When it never does, a `Slider` alone is enough.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/slider-input` and import from `@/components/ui/slider-input`.
