# Color Picker

A colour as `"#rrggbb"`: picked from swatches, typed as a hex code, or chosen in the system's colour dialog.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), an `id` for its `FieldLabel` (or `aria-label`), and optionally `swatches` (`{ value, label }[]`, a twelve-hue palette by default), `allowCustom` (`true`; `false` for swatches only) and `disabled`.

- The trigger shows the colour, its name when it is a swatch, and the hex code, which screen readers hear as the description.
- Swatches are radio buttons: arrows move between them, and each is read by its name ("Teal"). The picked one shows a tick that reads on any colour.
- The hex field accepts `#abc`, `abc` or `#aabbcc` and applies a full code as it is typed; an unreadable one is flagged on blur. The rainbow button opens the system dialog for any colour.
- Swatches are your app's data (label or calendar colours), not theme tokens. Check text contrast where you use the colour; never rely on colour alone to carry meaning.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/color-picker` and import from `@/components/ui/color-picker`._
