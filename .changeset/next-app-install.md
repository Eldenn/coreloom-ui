---
'@coreloom/ui': patch
---

### Fixed

- `Item` can be imported from a Server Component: its file now starts with `'use client'` (it
  creates a context, which failed a Next.js build).
- `VirtualList` and `LogViewer` compile in a Next.js app, whose React types let a key be a symbol
  that TanStack Virtual's keys can't be.
