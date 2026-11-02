# Masked Input

A field that groups what people type the way the number is printed: "FR76 3000 6000 0112 3456 7890 189", "4970 1012 3456 7890", "732 829 320 00074".

**The consumer provides** `preset` (`"iban"`, `"card"`, `"siren"`, `"siret"`) or a `mask` (a pattern where `9` is a digit, `a` a letter, `*` either, anything else printed as is; or a function of the raw value for variable lengths) with an optional `validate`, then `value` + `onValueChange(raw, { formatted, complete })` (or `defaultValue`), an `id` for its `FieldLabel`, and optionally `invalidMessage`. Other input props pass through.

- People type or paste with or without spaces; letters are upper-cased, characters that don't fit are dropped, and the caret stays where they were typing. The value is the raw characters (`"FR7630006000…"`).
- Presets check the number: IBAN by its country's length and mod 97, cards, SIREN and SIRET by Luhn. A finished value that fails is marked invalid on blur with a message under the field; `complete` tells your form the same thing while typing.
- `isValidIban`, `isValidLuhn`, `applyMask` and `maskPresets` are exported for your validation.
- Use masks for numbers with a fixed printed shape. For phone numbers use `PhoneInput`, for amounts `MoneyInput`, and don't mask names or addresses.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/masked-input` and import from `@/components/ui/masked-input`._
