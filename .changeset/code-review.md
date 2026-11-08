---
'@coreloom/ui': minor
---

### Added

- **Code review** block (`@coreloom/code-review`, experimental): review a pull request's changes.
  - The changed files in a folder tree with their status, comment count and a check once viewed; Enter or a click goes to the file. Below about 768 px the tree folds behind a "Files" button.
  - Each file's diff, unified or side by side (`layout` / `defaultLayout`), with a comment button on every line, keyboard and touch included. Threads show under their lines: reply, resolve, and resolved threads fold. Threads whose line left the diff are listed after the file.
  - "Viewed" per file folds it (`viewed` / `defaultViewed` / `onViewedChange`).
  - "Finish review" sends a verdict (comment, approve, request changes) and a summary through `onSubmitReview`, waiting for its promise.
  - Your app keeps the files and threads: `onComment`, `onReply` and `onResolve` say what changed.
- `DiffViewer` has two line slots: `renderLineAction(line)` draws a control at the start of each line, and `renderAfterLine(line)` draws content under a line (a line with content never folds away). `showHeader={false}` hides its header line when your own header shows the counts.
