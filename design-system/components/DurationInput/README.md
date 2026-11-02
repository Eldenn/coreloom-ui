# DurationInput

A length of time typed the way people say it: "1h30", "1:30", "90", "1.5 h", "45 min".

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), with the value as a number of minutes or null, a label (`id` for a FieldLabel), and optionally `min` (0), `max`, `step` (15, for the arrow keys) and `placeholder`.

- A bare number is minutes. Hours and minutes are read in English, French, Spanish and German ("2 heures 5 minutes", "1 Std. 20 Min.").
- On blur the field shows the value in the locale ("1 h 30 min"). An unreadable text stays as typed, marked invalid, with a hint saying what to type.
- `parseDuration(text)` and `formatMinutes(minutes, units)` are exported for your own displays.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/duration-input` and import from `@/components/ui/duration-input`._
