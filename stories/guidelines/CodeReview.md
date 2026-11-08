# Code Review

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A pull request's changes to review: the changed files in a folder tree, each file's diff (unified or side by side) with a comment button on every line, the comment threads under their lines, "Viewed" per file, and "Finish review" with a verdict and a summary. Front-end only: the app loads the files and threads from its code host and keeps them up to date from the callbacks.

**The consumer provides** `files` (`ReviewFile`: `path`, `status` `added` / `modified` / `deleted` / `renamed`, `oldPath` for a rename, `before` and `after` texts) and optionally `threads` (`ReviewThread`: `id`, `path`, `line` from 1, `side` `old` or `new`, `resolved`, `comments` in CommentThread's shape), `currentUser`, `mentionables` and `now` (passed to the comments), `onComment({ path, line, side, body })` (no comment buttons without it), `onReply(threadId, body)`, `onResolve(threadId, resolved)`, `onSubmitReview({ verdict, body })` (verdict `comment`, `approve` or `request-changes`; may return a promise; no "Finish review" without it), `viewed` / `defaultViewed` / `onViewedChange` (paths), `layout` / `defaultLayout` / `onLayoutChange` (`unified`, the default, or `split`), `wrap` (long lines wrap), `className` and `aria-label` ("Code review" by default). `reviewStats`, `diffStats`, `fileStats`, `lineAnchor` and `reviewTree` are exported for your own views.

- A line's `side` says which text its number counts in: removed lines are `old`, added and unchanged lines `new` (as code hosts send them). A thread on an unchanged line is also found by its old number. Threads whose line is no longer in the diff are listed after the file, not lost.
- The comment button sits at the start of each line. It shows on hover, on keyboard focus and always on touch screens, and its name says the line ("Comment on line 12", "Comment on removed line 3"). It opens a box under the line; Ctrl or ⌘+Enter sends, Escape cancels, and focus goes back to the line's button.
- A resolved thread folds into one line with a "Resolved" badge; "Show conversation" opens it. "Resolve conversation" and "Unresolve conversation" keep focus on the same button.
- The tree is an APG tree: arrows move, Space makes a file current, Enter or a click goes to it (it unfolds, scrolls into view and takes focus on its header). Each file shows its status letter (with the word for screen readers), its comment count and a check once viewed. Below about 768 px of width, the tree folds behind a "Files" button.
- "Viewed" folds the file, as on code hosts, and counts in the header ("2 of 4 viewed"). The file's header button opens and closes it.
- "Finish review" opens a popover with the three verdicts as radio cards and a summary. While `onSubmitReview`'s promise is pending the button spins; a rejection says the review couldn't be sent and keeps what was written.
- Use it for line-level discussion of a change. For a plain before / after comparison use DiffViewer; for a discussion that isn't anchored to lines, CommentThread.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/code-review`.
