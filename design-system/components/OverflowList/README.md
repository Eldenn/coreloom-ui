# OverflowList

A row of chips, tags, avatars or links on one line that shows as many as fit and ends with "+3" for the rest.

**The consumer provides** `items` and `renderItem` (returning an element with a `key`). Optional: `max` (show at most this many), `gap` in pixels, `renderOverflow(hidden)` to replace the "+N" popover, `listClassName` for the popover's list, and an `aria-label`.

- It measures again when its space changes: the same row works in a wide column and a narrow card.
- "+N" is a button opening a popover with the hidden items; its name says how many.
- Items must have the same width wherever they are drawn (no hover-only width changes).
- For a list people need to read in full (permissions, recipients), show it all; this is for a summary.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/overflow-list` and import from `@/components/ui/overflow-list`._
