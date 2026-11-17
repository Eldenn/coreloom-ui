# Finding Card

One finding of a review, such as a diagram checked against the code: what it is about, its status and severity, a comment, and the evidence as `file:line` places. People mark it done or ignore it, then reopen it.

**`FindingCard` takes** `title`, `status` (`ok`, `warning`, `error`, `unknown`), and optionally `statusLabel`, `severity` (`low`, `medium`, `high`), `comment`, `evidence` (`path`, `line`, `href`), `resolution` / `defaultResolution` (`open`, `done`, `dismissed`) with `onResolutionChange`, `onSelect`, `selected`, `disabled`, `className`.

- Evidence links open in a new tab, and only http and https links are followed.
- After Mark as done or Ignore, focus moves to Reopen (and back); the new resolution is announced.
- Pair it with `UmlDiagram`'s `annotations`, which draw the same statuses on the elements.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/finding-card`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
