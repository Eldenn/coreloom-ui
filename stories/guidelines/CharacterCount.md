# Character Count

"120/280" under a text field with a length limit.

**The consumer provides** `value` (the text, or its length), `max`, an `id` to add to the field's `aria-describedby`, and optionally `warnAt` (characters left from which it turns amber; 10% of `max`, at least 10). In a form, use `maxCount` on `TextField` or `TextareaField` instead: it is wired for you.

- Mono, tabular, right-aligned, in `fg-muted`; `warning` near the limit, bold `danger` past it. Characters are counted as people see them (an emoji is one).
- Screen readers hear "120 of 280 characters" with the field, and a polite announcement only when a threshold is crossed (near the limit, none left, too many), never on every key.
- It only counts. Decide in your validation whether going over blocks saving, or set `maxLength` on the field to stop typing at the limit.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/character-count` and import from `@/components/ui/character-count`.
