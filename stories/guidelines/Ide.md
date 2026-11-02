# IDE

A code workspace in the page, laid out like VS Code: a file explorer, tabs of open files, the CodeEditor, a bottom panel and a status bar. Use it for a playground, a template or config editor, an extension's or a function's source, a code exercise. Everything runs in the browser: the files are props, and saving, running and checking code are your app's callbacks.

**The consumer provides** `files` + `onFilesChange` (or `defaultFiles`): `{ path, content, language?, readOnly? }` with `/` between folders (folders come from the paths), and optionally `defaultOpen` / `defaultActive` (paths), `onSave(file)` (resolve to mark it saved, reject to say it failed; without it files are never marked modified), `onRun(files, active)` with `running`, `diagnostics` (by path, the CodeEditor's shape), `panels` (`{ id, label, content }`: an output, a terminal, a preview, after Problems), `defaultPanelOpen`, `title`, `actions` (end of the title bar), `readOnly`, `fileOperations` (true: New file, Rename, Delete), `defaultWrap` and `tabSize`.

- Shortcuts act only while focus is inside the IDE, so they don't clash with the page (or VS Code around a webview): Mod-S saves (Mod-Shift-S saves all), Mod-P finds a file, Mod-Shift-P opens the commands, Mod-B shows or hides the explorer, Mod-J the panel.
- Tabs: arrows move between them, Delete closes one, Enter goes to the editor; the middle button closes too. A modified file shows a dot and is announced as "modified".
- The explorer is a TreeView (APG keyboard, type-ahead). Problems lists every diagnostic; choosing one opens its file at its line.
- Saves, creations, renames and deletions are announced in one polite live region. The status bar shows problems, save state, line and column, indentation and language.
- Below 640 px of width (the IDE's own, not the window's), the explorer moves into a sheet and the panel stacks under the editor.
- No code runs here. To run it, use a worker or a sandboxed iframe (`sandbox="allow-scripts"`, no same origin) and show its output in a panel; never `eval` user code in the page.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ide` and import from `@/components/ide`.
