# CodeViewer

Code to read, with line numbers: a snippet in a doc, a generated file, a config, a log, a stack trace.

**The consumer provides** `code`, a `title` (a file name) or a `language`, and optionally `highlight` (`"3, 7-9"` or `[3, 7, 8, 9]`), `startLine` for an excerpt, `lineNumbers` (true), `wrap` / `defaultWrap` / `onWrapChange`, `maxHeight`, `copyable` (true) and `renderLine(line, number)` to colour each line with Shiki or Prism. `parseLineRanges("3, 7-9")` returns the set of lines.

- The header holds the name, a Wrap lines toggle and Copy. Copy takes the whole code, without line numbers.
- Highlighted lines get a tinted background and a bar; screen readers hear "Highlighted" before them.
- Line numbers stay put when the code scrolls sideways, and aren't selected with the text.
- The code area takes focus so the keyboard can scroll it. For a short command in a sentence, use `<code>`; for docs pages, the docs CodeBlock is lighter.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/code-viewer` and import from `@/components/ui/code-viewer`.
