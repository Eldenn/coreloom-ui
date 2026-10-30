# RadioGroup

A set of options where exactly one can be picked.

**The consumer provides** `<RadioGroup value onValueChange>` (or `defaultValue`) with an accessible name (`aria-label` or a `FieldLegend`), and one `<RadioGroupItem value id>` per option, each with its `Label`.

- 20px circle, `surface-inset` with a `border-strong` rim; selected turns the rim `accent` with a 10px `accent` dot. Focus shows `--ring-focus`; arrow keys move the selection.
- Use for 2–5 mutually exclusive, visible choices ("ES modules / CommonJS"); beyond that, `Select`. Start with a sensible default.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/radio-group` and import from `@/components/ui/radio-group`.
