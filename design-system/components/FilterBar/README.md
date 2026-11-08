# Filter Bar

Filters as chips above a list or a table: "Add filter" picks a field, a chip opens to edit its operator and value, × removes it. `QueryBuilder` edits the same filter as nested AND / OR groups. Experimental.

**`FilterBar` takes** `fields` (`[{ id, label, type, options?, get? }]`), `value` + `onValueChange` (a `FilterGroup`; or `defaultValue`), and optionally `views`, `onSaveView`, `resultCount` and `className`. **`QueryBuilder` takes** `fields`, `value` + `onValueChange` and `maxDepth`.

- Chips without a value are dashed and left out by `matchesFilter`.
- Removing a chip moves focus to its neighbour or to "Add filter".
- `filterToSearchParams` / `parseFilterSearchParams` keep the filter in the URL, dropping what doesn't fit the fields.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/filter-bar` and import from `@/components/ui/filter-bar`, `@/components/ui/query-builder` and `@/lib/filter`._
