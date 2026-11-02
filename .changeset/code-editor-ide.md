---
'@coreloom/ui': minor
---

### Added

- `CodeEditor` (`@coreloom/code-editor`): code to write, on CodeMirror 6 in Coreloom's colours
  (light and dark from the tokens). Syntax colours for JavaScript / TypeScript (JSX), JSON, CSS,
  HTML, Markdown and Python, line numbers, folding, bracket matching, autocompletion, search and
  replace, diagnostics by line and column, Mod-S through `onSave`, one undo history per `path`, and
  more CodeMirror `extensions`. CodeMirror's own words follow the locale. `languageFromPath` is
  exported.
- `Ide` (`@coreloom/ide`, block): a code workspace laid out like VS Code, all in the browser: file
  explorer (folders from the paths), tabs with modified dots, the CodeEditor, a bottom panel with
  Problems and your own tabs (an output, a terminal, a preview), a status bar, Mod-P file search,
  a command palette (Mod-Shift-P), New file, Rename and Delete. Saving, running and diagnostics are
  your app's callbacks (`onSave`, `onRun`, `diagnostics`). Below 640 px of its own width the explorer
  moves into a sheet.
- `codeEditor` and `ide` message groups in en, fr, es and de.
