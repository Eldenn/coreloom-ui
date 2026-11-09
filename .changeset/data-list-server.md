---
'@coreloom/ui': minor
---

### Added

- `useDataList` takes `server: { total, counts }` for lists the server filters and paginates:
  `rows` is then the page it returned, the toolbar's result count and the pagination read
  `server.total`, and the facet counts come from `server.counts`. The `DataListServer` type is
  exported.
- `useDataList` returns `matched`, the number of rows matching the search and filters on every
  page (`filtered.length` without `server`, `server.total` with it).

### Fixed

- The guide's advice for server-side filtering now works: before, a page of rows passed as
  `rows` was searched, counted and sliced again in the browser.
