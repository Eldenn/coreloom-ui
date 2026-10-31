# DataTable

A data table with sorting, a text filter, row selection and pagination: shadcn's data-table recipe on TanStack Table v8, packaged as one component.

**The consumer provides** `columns` (TanStack `ColumnDef`s; import the type from `@tanstack/react-table`) and `data`, plus optionally:

- `filterColumn` (the column id the search box filters) and `filterPlaceholder`;
- `toolbar={(table) => …}` for buttons at the right;
- `pageSize`, `pageSizeOptions` and `emptyText`;
- `getRowId` and `onRowSelectionChange(rows)`.

Use `<DataTableColumnHeader column title>` as a column's `header` to make it sortable. Add a selection column with `Checkbox`es bound to `row.getIsSelected()`.

- Built on `Table`, so it has the same frame, mono headers and row states. Selected rows take `accent-subtle`. Sort arrows are `fg-muted` until active. The footer shows the row count (or "n of m selected"), rows per page and Previous / Next.
- By default, sorting, filtering and paging run in the browser on the `data` you pass.
- **Server-driven** (`server={{ query, onQueryChange, rowCount, loading, searchable }}`): `data` is the current page and your API does the rest. `query` is `{ page, pageSize, sort?: { id, desc }, search }`; keep it in the URL's search params and refetch when it changes (TanStack Query's `placeholderData: keepPreviousData` keeps the page on screen meanwhile). Sorting or searching goes back to page 1; the search waits 300 ms after typing; `loading` dims the rows and sets `aria-busy`. The starter's Deployments page is a complete example.
- **Virtual** (`virtual={{ height, rowHeight?, overscan?, label? }}`): every row stays in the browser but only the visible ones are in the page, in a box of that height with the header pinned and no pages. For thousands of rows; sorting, the filter and selection work as usual, and screen readers still hear "row 512 of 5,001" (`aria-rowcount`, `aria-rowindex`). The box is a labelled region you can Tab to and scroll with the keyboard.
- Right-align and mono numbers; put status in a `Badge` with a word; keep one primary action in the toolbar.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/data-table` and import from `@/components/ui/data-table`._
