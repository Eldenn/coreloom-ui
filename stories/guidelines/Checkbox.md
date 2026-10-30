# Checkbox

Square check control for independent on/off choices and multi-select lists.

**The consumer provides** `checked` + `onCheckedChange` (or `defaultChecked`), an `id`, and a `Label` / `FieldLabel` next to it. `checked="indeterminate"` shows a dash.

- 20px box, `radius-sm`, `surface-inset` with a `border-strong` rim; checked or indeterminate fills `accent` with an `fg-on-accent` mark. `aria-invalid` turns the rim `danger`.
- Use a horizontal `Field` to pair it with its label and description. For a setting that applies immediately, use `Switch`.
- The empty rim (`border-strong`) reaches 3:1 on every surface in both themes, as a control boundary should.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/checkbox` and import from `@/components/ui/checkbox`.
