---
'@coreloom/ui': minor
---

### Added

- **CodeReview**: `fill` makes the review take its parent's height (a dialog, a pane): the header stays in place while the file tree and the files scroll on their own. Off by default, so a review still grows with its files.
- **CodeReview**: `renderFileMeta(file)` shows the app's own short marks for a file (a warning badge, a count) in its header, after the line counts, and in the file tree.
