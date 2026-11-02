# Editable Text

Text that turns into a field when clicked: a project name, a page title, a value in a details list.

**The consumer provides** `value` + `onValueChange` (or `defaultValue`), `label` (what the text is, "project name"), and optionally `placeholder` (shown muted when empty, "Empty" by default), `required` (an empty edit puts the old text back), `maxLength`, `disabled`, `startEditing` (open in edit mode, e.g. a new item to name), `className` and `inputClassName`.

- It is a button showing the text, named "Acme launch, Edit project name"; a pencil appears on hover and focus. Click, Enter or Space turns it into a field with the text selected.
- Enter or leaving the field saves (one `onValueChange`, only when the text changed); Escape puts the old text back. Focus returns to the text either way. Values are trimmed.
- It inherits the surrounding font, so it sits inside a heading or a sentence without changing its look.
- Use it for one short value at a time. For several fields, or anything that needs checking before saving, open a form or a dialog.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/editable-text` and import from `@/components/ui/editable-text`.
