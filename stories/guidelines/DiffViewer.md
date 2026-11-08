# DiffViewer

What changed between two texts, line by line: a config before and after an edit, two versions of a prompt, a document a model rewrote.

**The consumer provides** `before` and `after`, and optionally `view` (`unified`, the default, or `split`), `context` (unchanged lines kept around each change, 3), a `title`, `beforeLabel` / `afterLabel` for the split columns, `emptyText`, `wrap` and `showHeader` (the line with the title and the counts, `true` by default: hide it when your own header says the same). Two slots let you build on the lines, as the code review block does: `renderLineAction(line)` draws a control at the start of each line (a "comment on this line" button; in the split view removed lines get it on the left, the others on the right), and `renderAfterLine(line)` draws content under a line across the table (the comments on it; return `null` for none). A line with content under it never folds away. `diffLines(before, after)` returns the lines (`equal`, `add`, `remove`, with their numbers) for your own views; `pairLines` lines them up side by side.

- The header counts the lines added and removed. Each changed line has a sign and a tint, and screen readers hear "Added" or "Removed".
- Runs of unchanged lines longer than the context fold into a "Show n unchanged lines" button.
- Use `split` when there's room (a full-width page) and the changes are edits of the same lines; `unified` in a panel or on a phone.
- A line action must work without a pointer: give it an accessible name that says the line ("Comment on line 12"), and keep it visible on focus and on touch screens, not only on hover.
- It compares lines: a one-word change shows the whole line as removed and added. Keep line breaks meaningful (one sentence per line for prose).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diff-viewer` and import from `@/components/ui/diff-viewer`.
