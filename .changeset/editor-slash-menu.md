---
'@coreloom/ui': minor
---

### Added

- `RichTextEditor`: with `ai` set, typing `/` at the start of a line opens a menu of AI commands
  (Ask AI…, Continue writing and the quick actions), filtered as you type, keyboard-driven and
  announced to screen readers. Choosing opens the AI panel where the slash was; **Insert here**
  puts the answer there. Turn it off with `ai.slashCommand: false`.

### Upgrading

- `RichTextAiAction` now includes `'continue'` (its `text` is the document before the cursor):
  handle it in your `onRequest`, and in any code that maps every action.
