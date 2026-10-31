---
'@coreloom/ui': minor
---

### Added

- `RichTextEditor`: with `ai` set, typing `/` at the start of a line or after a space opens a menu of AI commands
  (Ask AI…, Continue writing and the quick actions), filtered as you type, keyboard-driven and
  announced to screen readers. Choosing opens the AI panel where the slash was; **Insert here**
  puts the answer there (and is the focused button; **Replace all** stays a click away). The menu
  works inside dialogs and sheets; Enter right after a lone `/` is a plain new line. Turn it off
  with `ai.slashCommand: false`. Continue writing sends the `'continue'` action, whose `text` is the
  document before the cursor: handle it in your `onRequest`.
