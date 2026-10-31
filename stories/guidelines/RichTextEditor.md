# RichTextEditor

Formatted text: descriptions, comments, release notes. Tiptap (ProseMirror) under a Coreloom toolbar.

**The consumer provides** `value` + `onValueChange` (HTML; `""` when empty — or `defaultValue`), a label through `aria-labelledby` (or `aria-label`), and optionally `placeholder`, `minHeight` (160), `disabled`.

- The frame matches `Input` (focus ring, `danger` when `aria-invalid`); the toolbar is a `surface` strip of `Toggle`s with tooltips and shortcuts: bold, italic, underline, strikethrough, inline code · heading, subheading, bulleted and numbered lists, quote, code block, link · undo, redo.
- Markdown shortcuts while typing (`## `, `- `, `1. `, `> `, `**bold**`). Links get `https://` when it's missing and open in place; pasting a URL links it.
- In a form: `RichTextField` (from `@/components/ui/rich-text-field`) inside `<form.AppField>`, so the form kit doesn't pull in the editor. Check for real text in the schema (strip tags).
- The value is HTML from the user: **sanitize it on the server** before rendering it elsewhere.

**AI (optional).** Pass `ai={{ onRequest }}` and the toolbar gains an **AI** button (⌘J / Ctrl+J): a panel to edit the selection — or the whole document — with an instruction or a quick action (improve, fix grammar, shorten, lengthen, summarise, translate). `onRequest({ action, prompt, language, text, scope, signal })` returns your model's answer, streamed (`AsyncIterable<string>`) or whole (`Promise<string>`); the editor calls nothing itself.

- The answer streams into a preview with Stop; then Replace selection, Insert below, Try again or Discard. Errors show inline with Try again. Escape closes and returns focus to the editor.
- `/` at the start of a line (or after a space) opens a menu of AI commands at the cursor: **Ask AI…**, **Continue writing** and the quick actions, filtered as you type (`/sum`), ↑ / ↓ and Enter to choose, Escape to keep the text. Choosing opens the panel there; answers go in with **Insert here**. `slashCommand: false` turns it off.
- Answers are read as light Markdown (marks, http(s) links, lists) and inserted as text nodes, never as HTML. Details in **Guidelines / AI / Editor AI**.
