# Label

Accessible text label for a form control.

**The consumer provides** the text and `htmlFor` pointing at the control's `id`.

- 13px / 500 in `fg-2`; dims with a disabled sibling (`peer`) or a disabled `Field`.
- Inside forms prefer `FieldLabel`, which is this label with field-aware styling. For checkbox and switch labels set the body size (14px, regular).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/label` and import from `@/components/ui/label`.
