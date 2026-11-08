# @coreloom/data-table

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/data-table.tsx

```ts
function DataTable
DataTable.columns: ColumnDef<TData, TValue>[]
DataTable.data: TData[]
DataTable.filterColumn?: string | undefined
DataTable.filterPlaceholder?: string | undefined
DataTable.toolbar?: ((table: TanstackTable<TData>) => React.ReactNode) | undefined
DataTable.pageSize?: number | undefined
DataTable.pageSizeOptions?: number[] | undefined
DataTable.emptyText?: React.ReactNode
DataTable.getRowId?: ((row: TData, index: number) => string) | undefined
DataTable.onRowSelectionChange?: ((rows: TData[]) => void) | undefined
DataTable.server?: DataTableServer | undefined
DataTable.virtual?: DataTableVirtual | undefined
DataTable.className?: string | undefined
function DataTableColumnHeader
DataTableColumnHeader.column: Column<TData, TValue>
DataTableColumnHeader.title: string
DataTableColumnHeader.className?: string | undefined
function DataTableCount
DataTableCount.table: TanstackTable<TData>
function DataTablePagination
DataTablePagination.table: TanstackTable<TData>
DataTablePagination.total?: number | undefined
DataTablePagination.pageSizeOptions?: number[] | undefined
type DataTableQuery = {}
DataTableQuery.page: number
DataTableQuery.pageSize: number
DataTableQuery.sort?: {}
DataTableQuery.sort.id: string
DataTableQuery.sort.desc: boolean
DataTableQuery.search: string
type DataTableServer = {}
DataTableServer.query: DataTableQuery
DataTableServer.onQueryChange: (query: DataTableQuery) => void
DataTableServer.rowCount: number
DataTableServer.loading?: boolean | undefined
DataTableServer.searchable?: boolean | undefined
type DataTableVirtual = {}
DataTableVirtual.height: string | number
DataTableVirtual.rowHeight?: number | undefined
DataTableVirtual.overscan?: number | undefined
DataTableVirtual.label?: string | undefined
```
