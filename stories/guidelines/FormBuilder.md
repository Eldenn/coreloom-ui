# Form Builder

Makes a form without code. A palette of field types on the left, the form itself in the middle (live: each field drawn as it will look), and the selected field's settings on the right. Preview tries the form; JSON shows it as a FormSpec (editable) or as a JSON Schema. What it edits is the FormSpec that `FormRenderer` draws, so a form built here is stored as JSON and shown anywhere.

**`FormBuilder` takes** `value` / `defaultValue` / `onValueChange` (a `FormSpec`), and optionally `types` (the same you give FormRenderer), `onPreviewSubmit(values)` and `className`.

```tsx
import { FormBuilder } from '@/components/form-builder'
import { FormRenderer, type FormSpec } from '@/components/ui/form-renderer'

const [spec, setSpec] = React.useState<FormSpec>(saved)
<FormBuilder value={spec} onValueChange={setSpec} />
// Elsewhere: <FormRenderer spec={spec} onSubmit={…} />
```

- **Add** a field with the palette: it lands after the selected field (or at the end of the selected section) and is selected.
- **Select** a field, a section or the form by clicking it; its settings open in the inspector: label, name (applied on Enter or when left, if it's valid and free; conditions follow a rename), type, help text, placeholder, required, width, section, options, the type's own settings, checks, and "Show only when" (one condition; combined ones are edited in JSON).
- **Move** a field with its handle: drag it, or focus the handle, press Space, use the arrows and Space again (announced in the locale). Duplicate and Delete sit beside it; deleting a field removes the conditions that read it.
- **Sections** have a title, a description and 1 to 3 columns. Deleting one moves its fields to the section before it.
- **JSON**: edit and Apply; what can't be read is listed and left out (see `readFormSpec`). Copy takes either format. **Import** takes a FormSpec or a JSON Schema with an optional UI schema.
- Fields on the canvas can't be focused or typed into: they are a picture of the form. Use Preview to fill it in.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/form-builder` and import from `@/components/form-builder`.
