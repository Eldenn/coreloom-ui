---
'@coreloom/ui': minor
---

### Added

- `CheckboxCardField`: checkbox cards (`CheckboxCard`) as a form field, the many-choice sibling of
  `RadioCardField`; its value is a `string[]`.
- `CheckboxGroupField` and `CheckboxCardField` options take `exclusive`: an answer such as "None
  of these" that can't be ticked with another. Ticking it clears the others, and ticking another
  clears it. `toggleChoice` is the rule, exported for custom fields.
- `Markdown` has an `inline` prop: one line of text in a label, a title or a sentence, keeping
  inline code, emphasis and links and dropping block markup.
- `SortableList` options take `actions` (an item's own buttons, after its move buttons), and the
  list takes `wrap`, so long labels run onto more lines instead of being cut.
