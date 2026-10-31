---
'@coreloom/ui': minor
---

### Added

- `DataTable` `virtual`: thousands of rows in a fixed-height box, only the visible ones rendered
  (TanStack Virtual), header pinned, `aria-rowcount` / `aria-rowindex` for screen readers.
- `VirtualList`: a long list with measured item heights and load-more at the end, made for
  `useInfiniteQuery`.
