# RichTextEditor

Formatted text: descriptions, comments, release notes. Tiptap (ProseMirror) under a Coreloom toolbar.

**The consumer provides** `value` + `onValueChange` (HTML; `""` when empty — or `defaultValue`), a label through `aria-labelledby` (or `aria-label`), and optionally `placeholder`, `minHeight` (160), `disabled`.

- The frame matches `Input` (focus ring, `danger` when `aria-invalid`); the toolbar is a `surface` strip of `Toggle`s with tooltips and shortcuts: bold, italic, underline, strikethrough, inline code · heading, subheading, bulleted and numbered lists, quote, code block, link · undo, redo.
- Markdown shortcuts while typing (`## `, `- `, `1. `, `> `, `**bold**`). Links get `https://` when it's missing and open in place; pasting a URL links it.
- In a form: `RichTextField` (from `@/components/ui/rich-text-field`) inside `<form.AppField>`, so the form kit doesn't pull in the editor. Check for real text in the schema (strip tags).
- The value is HTML from the user: **sanitize it on the server** before rendering it elsewhere.
