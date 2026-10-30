# MoneyInput

An amount in a currency, typed the way the reader writes numbers: "1 234,50" in French, "1,234.50" in English.

**The consumer provides** `value` + `onValueChange` (a `number` in major units — 12.5 is €12.50 — or `null` when empty; or `defaultValue`), `currency` (ISO code, `"EUR"` default), an `id` for its `FieldLabel`, and optionally `min` / `max` (clamped on blur), `allowNegative`, `locale` (defaults to the i18n locale).

- The field matches `Input`; the amount is right-aligned in mono with tabular figures; the symbol sits where the locale puts it (`€` after in French, before in English) in `fg-muted`. The currency's name is read to screen readers.
- While typing the text stays as typed; on blur it is rounded to the currency's decimals (none for JPY) and formatted with grouping.
- Store amounts as numbers (or integer cents on your side). Say the period in the label ("Monthly budget").
