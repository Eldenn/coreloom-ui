# CodeEditor

Code to write: a script field in a form, a config file, a query, the editor of an IDE. It runs on CodeMirror 6 and takes its colours from the Coreloom tokens, so it follows light and dark (and your accent) without a second palette.

**The consumer provides** `value` + `onChange` (or `defaultValue`), a `language` (`javascript`, `jsx`, `typescript`, `tsx`, `json`, `css`, `html`, `markdown`, `python`, `text`) or a `path` it is derived from (`languageFromPath("src/app.tsx")` is `"tsx"`), an `aria-label` or `aria-labelledby`, and optionally `diagnostics` (`{ line, column?, endLine?, endColumn?, severity, message, source? }`, 1-based), `onSave` (Mod-S), `onCursorChange`, `readOnly`, `lineNumbers` (true), `folding` (true), `wrap` (false), `tabSize` (2), `placeholder`, `height` / `minHeight` / `maxHeight`, `autoFocus`, `onViewChange` (the CodeMirror view, to focus it or move the cursor) and more CodeMirror `extensions` (a language server client, your own completions, Vim keys).

- Built in: syntax colours, line numbers, folding, bracket matching and closing, autocompletion from the language, multiple cursors (Alt-click), search and replace (Mod-F), undo history, diagnostics underlined in the code, marked in the gutter and listed with Mod-Shift-M.
- Pass `path` when one editor shows several files: each path keeps its own undo history, cursor and selection.
- Tab indents. To leave the editor with the keyboard, press Escape then Tab; Ctrl-M (Shift-Alt-M on macOS) turns Tab into a focus key until pressed again. Say so near editors in forms.
- The text area has the `textbox` role with `aria-multiline`; it takes your label, `aria-describedby`, `aria-invalid` and `aria-readonly`. CodeMirror's own words (search panel, folding, lint) follow the locale.
- Without a `height`, the editor grows with its text up to `maxHeight`, then scrolls.
- For code to read only, CodeViewer is lighter; for JSON a person types into a form, JsonInput checks it as they type.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/code-editor` and import from `@/components/ui/code-editor`._
