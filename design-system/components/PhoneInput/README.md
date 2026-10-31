# PhoneInput

A phone number: a country picker and the national number, shown the way people write it ("06 12 34 56 78").

**The consumer provides** `value` + `onValueChange` (E.164: `"+33612345678"`, or `""`; or `defaultValue`), an `id` for its `FieldLabel` (it goes on the number input), and optionally `defaultCountry` (`"FR"`) and `countries` (defaults to `PHONE_COUNTRIES`, about forty; extend it). `isValidPhone(value)` checks the country and the number's length — use it in your schema.

- One field frame, split in two: the country button (ISO code and "+33" in mono) and the number (mono, tabular figures). The list is searchable by name in the reader's language, code or dial code.
- A leading trunk "0" is dropped from the value; pasting "+44 20 7946 0958" or "0044…" picks the country.
- Ask for a phone number only when you will call or text it, and say why in the description.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/phone-input` and import from `@/components/ui/phone-input`. In a form: `field.PhoneField`._
