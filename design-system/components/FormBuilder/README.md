# Form Builder

Makes a form without code: palette of field types, a live canvas (drag to reorder, sections in columns), an inspector per field, Preview, and the form's JSON (FormSpec or JSON Schema) with Import.

**`FormBuilder` takes** `value` / `defaultValue` / `onValueChange` (a `FormSpec`), and optionally `types`, `onPreviewSubmit` and `className`. Show the result anywhere with `FormRenderer`.

- Names follow renames into conditions; deleting a field removes the conditions that read it.
- Fields on the canvas are a picture of the form (not focusable); Preview fills it in.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/form-builder` and import from `@/components/form-builder`._
