---
'@coreloom/ui': minor
---

### Added

- **Filter bar** (`@coreloom/filter-bar`, experimental): filters as chips above a list or a table.
  - "Add filter" picks a field from a searchable list; each chip opens to edit its operator and
    value; × removes it. "Match all" / "Match any", "Clear filters", saved `views` with
    `onSaveView`, and a `resultCount` announced politely.
  - Six field types (`text`, `number`, `date`, `select`, `multiselect`, `boolean`), each with its
    operators (`contains`, `between`, `before`, `anyOf`, `allOf`, `isEmpty`…).
  - `QueryBuilder` edits the same filter as nested AND / OR groups (`maxDepth`, 3 by default).
  - `@/lib/filter`: the `FilterGroup` value and `matchesFilter` to run it on rows,
    `filterToSearchParams` / `parseFilterSearchParams` to keep it in the URL (unknown fields,
    operators and values of the wrong shape are dropped), and helpers to edit it.
