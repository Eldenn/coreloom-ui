# Form Renderer

A form drawn at runtime from a FormSpec (JSON sections, fields, checks and conditions), with the Form fields.

**The consumer provides** `spec` and `onSubmit(values)` (the visible fields as JSON), and optionally `defaultValues`, `onValuesChange`, `submitLabel`, `hideHeader`, `hideSubmit` and `types` (`formFieldTypes` plus your own).

- Read a spec from elsewhere with `readFormSpec` (untrusted: it reports what it fixed or left out); `fromJSONSchema` / `toJSONSchema` convert from and to JSON Schema.
- Conditions (`visibleWhen`) hide fields; hidden fields aren't checked or sent.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/form-renderer` and import from `@/components/ui/form-renderer`._
