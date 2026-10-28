# DataTable

A data table with sorting, a text filter, row selection and pagination: shadcn's data-table recipe on TanStack Table v8, packaged as one component.

**The consumer provides** `columns` (TanStack `ColumnDef`s; import the type from `@tanstack/react-table`) and `data`, plus optionally:

- `filterColumn` (the column id the search box filters) and `filterPlaceholder`;
- `toolbar={(table) => …}` for buttons at the right;
- `pageSize`, `pageSizeOptions` and `emptyText`;
- `getRowId` and `onRowSelectionChange(rows)`.

Use `<DataTableColumnHeader column title>` as a column's `header` to make it sortable. Add a selection column with `Checkbox`es bound to `row.getIsSelected()`.

- Built on `Table`, so it has the same frame, mono headers and row states. Selected rows take `accent-subtle`. Sort arrows are `fg-faint` until active. The footer shows the row count (or "n of m selected"), rows per page and Previous / Next.
- Sorting and filtering run in the browser on the `data` you pass. For server-side data, use `Table` with your own TanStack setup.
- Right-align and mono numbers; put status in a `Badge` with a word; keep one primary action in the toolbar.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/data-table` and import from `@/components/ui/data-table`._
