# Form

Forms built on TanStack Form: `useAppForm` with Coreloom's field components attached, so every field gets its label, description, error and ARIA wiring for free.

**The consumer provides** `defaultValues`, `validators` (a Standard Schema such as zod — `{ onChange: schema }` — or functions returning a message) and `onSubmit`. Each field is a `<form.AppField name>` rendering one of `field.TextField`, `TextareaField`, `SelectField` (`options`), `ComboboxField` (`options`), `DateField`, `DateRangeField`, `TagsField`, `FileField` (`accept`, `maxSize`, `maxFiles`), `RadioGroupField` (`options`), `CheckboxField`, `SwitchField` or `OTPField` (`length`, `pattern`, `submitOnComplete`), with a `label` and optional `description`. Vertical fields also take `labelAction` (a link at the right of the label) and `hideLabel`. Inside `<form.AppForm>`, `form.SubmitButton` (`pendingLabel`, `pending` for a busy state you control) and `form.FormErrors` (form-level errors: a validator returning `{ form: "…" }`, e.g. from the server).

```tsx
const form = useAppForm({
  defaultValues: { email: "" },
  validators: { onChange: z.object({ email: z.email("Enter a valid email address.") }) },
  onSubmit: async ({ value }) => save(value),
})
<form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
  <form.AppField name="email">{(field) => <field.TextField label="Email" type="email" />}</form.AppField>
  <form.AppForm><form.FormErrors /><form.SubmitButton>Save</form.SubmitButton></form.AppForm>
</form>
```

- Errors appear once a field has been left or the form submitted, then follow the typing. The control gets `aria-invalid` and `aria-describedby` (description + error); the `FieldError` is announced (`role="alert"`).
- The submit button stays enabled so a click reveals every error; while submitting it is disabled with a `Spinner` and the `pendingLabel`.
- Async checks go on the field: `validators={{ onChangeAsync, onChangeAsyncDebounceMs: 400 }}` ("acme is taken"). For your own field components, build on `useFieldContext()` and register them with `createFormHook` the same way.
- The auth and settings blocks are built on it: read `login-form.tsx` for a complete example.
- Write errors as instructions ("Enter a valid email address."), one per field, and keep `noValidate` on the `<form>` so the browser's bubbles don't compete.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/form` (installs `@tanstack/react-form` and the field components) and import `useAppForm` from `@/components/ui/form`. Add `zod` yourself if you validate with schemas._
