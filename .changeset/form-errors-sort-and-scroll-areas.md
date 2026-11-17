---
'@coreloom/ui': patch
---

### Changed

- `FieldError` is no longer `role="alert"` by default. A form with several mistakes fired one
  assertive alert per field, and again while typing. The error is read with its control through
  `aria-describedby` and `aria-invalid`, which every `Form` field already wires.
- `Form`: when a submit of the `<form>` fails, focus moves to the first invalid field, and
  `form.SubmitButton` announces how many fields need attention in one polite status
  ("3 fields need attention."). `FormRenderer` does the same. A `form.handleSubmit()` called from
  code doesn't move focus. `OTPField` now sets `aria-invalid` on its input.
- `FormRenderer`: the form's title is a paragraph instead of an `<h2>`, so it no longer breaks the
  page's heading order. It still names the form.
- `ShortcutsDialog`: group titles are paragraphs instead of `<h3>`.

### Fixed

- `DataTable`: sortable header cells carry `aria-sort` (`ascending`, `descending`, `none`).
- Boxes that scroll can be reached and scrolled from the keyboard: `Table`'s frame, `DiffViewer`,
  `ToolCall`'s input and output, tables in `Markdown`, code blocks in the editor's AI preview and
  the list in `ShortcutsDialog` take a tab stop and a focus ring when their content overflows, and
  only then. All but `Table`'s frame also get a name; name that one through `container`.
- `ShortcutsDialog`: the search box's placeholder has enough contrast and the standard focus ring;
  a polite status says how many shortcuts the search left, or that none match.

### Upgrading

- If you relied on `FieldError` announcing itself, pass `role="alert"` to it, or point the
  control's `aria-describedby` at the error's `id` and move focus to the first invalid control
  when the submit fails. Tests that looked errors up with `getByRole('alert')` should read the
  control's accessible description instead.
- Styles or tests that targeted the `<h2>` of a `FormRenderer` title, or the `<h3>` of a
  `ShortcutsDialog` group, should target the form's name (`getByRole('form', { name })`) or the
  text.
