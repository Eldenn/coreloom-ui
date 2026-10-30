# Field

Layout for a label, a control, help text and errors — the shadcn way to build forms.

**The consumer provides** the parts: `<Field>` around one control with a `<FieldLabel htmlFor>`, `<FieldDescription>` and `<FieldError>`; `orientation="horizontal"` for a Checkbox or Switch with its label (wrap label + description in `<FieldContent>`); `<FieldSet>` + `<FieldLegend>` to group, `<FieldGroup>` to stack fields, `<FieldSeparator>` between groups.

- Label 13px / 500 in `fg-2`, description 11px in `fg-muted`, error 11px in `danger` with `role="alert"`; 7px between parts. In horizontal fields the label reads 14px regular.
- Mark the field `data-invalid` and the control `aria-invalid` together; show the error instead of the description.
- Works with any form library — shadcn's react-hook-form / TanStack Form recipes apply unchanged.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/field` and import from `@/components/ui/field`.
