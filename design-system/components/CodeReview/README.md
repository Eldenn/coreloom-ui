# Code Review

_Experimental: the API may still change in a minor release._

A pull request's changes to review: the changed files in a folder tree, each file's diff (unified or side by side) with a comment button on every line, the comment threads under their lines (reply, resolve), "Viewed" per file and "Finish review" with a verdict and a summary. Front-end only: the files and threads are props, and comments, replies, resolving and the review are your app's callbacks.

**The consumer provides** `files` (`{ path, status, oldPath?, before, after }`, status `added` / `modified` / `deleted` / `renamed`) and optionally `threads` (`{ id, path, line, side, resolved?, comments }`, side `old` for removed lines and `new` for the others), `currentUser`, `mentionables`, `now`, `onComment({ path, line, side, body })`, `onReply(threadId, body)`, `onResolve(threadId, resolved)`, `onSubmitReview({ verdict, body })` (`comment`, `approve` or `request-changes`; may return a promise), `viewed` / `defaultViewed` / `onViewedChange`, `layout` / `defaultLayout` / `onLayoutChange` (`unified` or `split`) and `wrap`.

- The comment button on a line shows on hover, on focus and always on touch screens; its name says the line. Ctrl or ⌘+Enter sends a comment, Escape cancels, and focus goes back to the line.
- The file tree is a TreeView: Enter or a click goes to the file and focuses its header. Below about 768 px of width it folds behind a "Files" button.
- "Viewed" folds a file; a resolved thread folds into one line until shown.
- Threads whose line left the diff are listed after their file.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/code-review` and import from `@/components/code-review`._
