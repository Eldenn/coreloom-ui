# DiffViewer

What changed between two texts, line by line: a config before and after an edit, two versions of a prompt, a document a model rewrote.

**The consumer provides** `before` and `after`, and optionally `view` (`unified`, the default, or `split`), `context` (unchanged lines kept around each change, 3), a `title`, `beforeLabel` / `afterLabel` for the split columns, `emptyText` and `wrap`. `diffLines(before, after)` returns the lines (`equal`, `add`, `remove`, with their numbers) for your own views; `pairLines` lines them up side by side.

- The header counts the lines added and removed. Each changed line has a sign and a tint, and screen readers hear "Added" or "Removed".
- Runs of unchanged lines longer than the context fold into a "Show n unchanged lines" button.
- Use `split` when there's room (a full-width page) and the changes are edits of the same lines; `unified` in a panel or on a phone.
- It compares lines: a one-word change shows the whole line as removed and added. Keep line breaks meaningful (one sentence per line for prose).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diff-viewer` and import from `@/components/ui/diff-viewer`.
