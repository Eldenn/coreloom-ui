# Filter Bar

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The filters of a list or a table as chips above it: "Add filter" picks a field, each chip opens to edit its operator and value, × removes it. `QueryBuilder` edits the same filter as nested groups that match all or any of their conditions. The filter is a plain value (`FilterGroup` from `@/lib/filter`), so the app decides where it runs: on the rows in the browser with `matchesFilter`, in its API, or in the URL with `filterToSearchParams` and `parseFilterSearchParams`.

**The consumer provides** `fields` (`[{ id, label, type, options?, get? }]`; `type` is `text`, `number`, `date`, `select`, `multiselect` or `boolean`; `options` for the two selects; `get(row)` when the value isn't `row[id]`), `value` + `onValueChange` (a `FilterGroup`; or `defaultValue`), and optionally `views` (`[{ id, label, filter }]`, saved filters in a picker that shows "Custom" when none matches), `onSaveView(filter)` (shows "Save view" while the filter matches no view; the app asks for a name and stores it), `resultCount` (shown at the end and announced when it changes) and `className`.

**`QueryBuilder` takes** `fields`, `value` + `onValueChange` (or `defaultValue`), and optionally `maxDepth` (how deep groups go, the top one counting as 1; 3 by default) and `className`.

- Each field type has its operators: text `contains`, `is`, `startsWith`…; numbers `gt`, `lte`, `between`…; dates `before`, `after`, `between` (by day); selects `is`, `anyOf`, `noneOf`; multiselects `anyOf`, `allOf`, `noneOf`; booleans `isTrue`, `isFalse`; all but booleans `isEmpty` and `isNotEmpty`. Changing the field starts the condition over; changing the operator keeps the value when it still fits ("is Open" becomes "is any of Open").
- A condition without a value yet shows as a dashed chip saying it needs one, and `matchesFilter` leaves it out, so a half-written filter never hides every row. Text compares ignore case.
- Keyboard: Tab reaches each chip and its × button; Enter or Space opens a chip, Escape closes it and focus goes back to the chip. "Add filter" opens a searchable list of fields; picking one adds the chip and opens it. Removing a chip moves focus to the next chip (or the previous one, or "Add filter"); "Clear filters" moves it to "Add filter". In the builder, a new condition takes focus, and removing one moves it to its neighbour or to "Add condition".
- Screen readers: the bar is a group named "Filters"; each chip button is named "Edit filter: Status is any of Open, Overdue" and its × "Remove filter: …". The result count is a polite live region, the only one in the bar.
- With two or more rules, "Match all" / "Match any" sets whether every rule or one of them must pass. A nested group shows as one chip ("Group of 2 conditions") that opens a QueryBuilder.
- `filterToSearchParams` writes only complete conditions as compact JSON under `filter` (another `key` if asked) and keeps the other parameters. `parseFilterSearchParams` reads it back and drops what doesn't fit the fields: unknown fields, operators a type doesn't take, values of the wrong shape, more than 50 rules per group, more than four levels. Broken JSON gives an empty filter.
- For one search box and a few fixed facets, `DataList`'s `FacetedFilter` is simpler. Up to ~20 fields; past that, group them in the app.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/filter-bar`.
