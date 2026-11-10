# DataList

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A filterable list whose state lives in the URL (`?q=api&status=ready,failed&page=2`): a filtered view survives a reload and can be bookmarked or shared.

**Install** `pnpm dlx shadcn@latest add @coreloom/data-list`. It writes `data-list.tsx`.

**The consumer provides** `useDataList({ rows, searchKeys, facets, pageSize })` — `facets` are `[{ key, label, options: [{ value, label, icon? }], get? }]` — then renders:

- `<DataListToolbar list searchLabel actions>`: the search box (filters as you type, after a beat), one faceted filter per facet (a searchable checklist with counts), "Clear filters" and the result count (`role="status"`).
- `<FacetedFilter title options value onValueChange counts>` alone (or with `defaultValue` instead of `value`), for one checklist filter outside the toolbar.
- The rows, however suits them: `list.pageRows` in a `Table`, cards or `Item`s; `<DataListEmpty list>` when `list.matched` is 0.
- `<DataListPagination list>`: "Page 2 of 5" with previous / next.

- Search is case- and accent-insensitive. Facet counts ignore the facet's own selection, so options stay comparable. Any filter change goes back to page 1; the URL is updated with `history.replaceState` (no history spam).
- With a router, pass `searchParams` and `onSearchParamsChange` — in Next.js, `useSearchParams()` and `router.replace(`?${params}`)` — so server and client render the same view.
- For server-side filtering, read the same parameters on the server (`q`, one per facet key with comma-separated values, `page`) and pass what it returns: `rows` is the page, and `server: { total, counts }` the number of matching rows across every page and, per facet, the matches per option with that facet's own selection left out. Search, counts and slicing are then left to the server; the toolbar's result count and the pagination read `server.total`, so keep `pageSize` equal to the server's page size. `list.matched` is the number of matching rows either way.
