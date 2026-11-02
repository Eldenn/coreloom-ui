# JsonInput

A code field for JSON: a webhook payload, a feature flag's settings, a tool's arguments.

**The consumer provides** `value` + `onValueChange(text, parsed)` (or `defaultValue`), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `rows` (8), `indent` (2), `formatOnBlur`, `placeholder`, `readOnly` and `disabled`. `parseJson(text)` returns `{ ok: true, value }` or `{ ok: false, at: { line, column } }`.

- The text is checked when the field is left, and the error says where it breaks ("This isn’t valid JSON: check line 3, column 12."). After that it follows the typing until the text is valid again.
- Format re-indents valid JSON. Tab indents inside the field; Escape then Tab leaves it, and a hint under the field says so.
- The value stays the text, so nothing is lost while it is half typed; `onValueChange` also passes the parsed value when the text is valid. Validate its shape with a schema on the parsed value.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/json-input` and import from `@/components/ui/json-input`.
