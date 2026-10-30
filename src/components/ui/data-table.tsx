"use client"

// Coreloom UI — DataTable. shadcn's data-table recipe (TanStack Table v8) packaged as one
// component: sorting, a text filter, row selection and pagination on top of Table.
// Columns are TanStack `ColumnDef`s; use DataTableColumnHeader for sortable headers.
//
// Two modes. By default it sorts, filters and paginates `data` in the browser. With `server`, your
// API does: `data` is the current page, `server.rowCount` the total, and `server.query` /
// `server.onQueryChange` hold page, page size, sort and search — keep them in the URL's search
// params and refetch when they change.
import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCoreloomI18n } from "@/lib/i18n"

/** What a server-driven table asks your API for. `page` starts at 1. */
type DataTableQuery = {
  page: number
  pageSize: number
  /** Column id and direction, or undefined for the API's default order. */
  sort?: { id: string; desc: boolean }
  /** The search box's text ("" when empty). */
  search: string
}

type DataTableServer = {
  query: DataTableQuery
  onQueryChange: (query: DataTableQuery) => void
  /** Rows matching the search across all pages. */
  rowCount: number
  /** A request is in flight: the rows dim and the table is marked busy. */
  loading?: boolean
  /** Show the search box (sent as `query.search`). */
  searchable?: boolean
}

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  toolbar,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  emptyText,
  getRowId,
  onRowSelectionChange,
  server,
  className,
}: {
  columns: ColumnDef<TData, TValue>[]
  /** All rows, or with `server` the current page's. */
  data: TData[]
  /** Column id the text filter searches. Leave out to hide the filter. */
  filterColumn?: string
  filterPlaceholder?: string
  /** Extra controls at the right of the toolbar (filters, a "New" button…). */
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  emptyText?: React.ReactNode
  getRowId?: (row: TData, index: number) => string
  onRowSelectionChange?: (rows: TData[]) => void
  /** Sorting, search and pagination happen in your API (see the file's header). */
  server?: DataTableServer
  className?: string
}) {
  const t = useCoreloomI18n().messages
  filterPlaceholder ??= t.dataTable.filter
  emptyText ??= t.dataTable.empty
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const serverState = server && {
    sorting: server.query.sort ? [server.query.sort] : [],
    pagination: { pageIndex: server.query.page - 1, pageSize: server.query.pageSize },
  }
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnFilters, columnVisibility, rowSelection, ...serverState },
    initialState: { pagination: { pageSize } },
    onSortingChange: server
      ? (updater) => {
          const next = typeof updater === "function" ? updater(serverState!.sorting) : updater
          server.onQueryChange({ ...server.query, sort: next[0], page: 1 })
        }
      : setSorting,
    onPaginationChange: server
      ? (updater) => {
          const next = typeof updater === "function" ? updater(serverState!.pagination) : updater
          const sizeChanged = next.pageSize !== server.query.pageSize
          server.onQueryChange({ ...server.query, page: sizeChanged ? 1 : next.pageIndex + 1, pageSize: next.pageSize })
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    ...(server
      ? { manualPagination: true, manualSorting: true, manualFiltering: true, rowCount: server.rowCount }
      : {
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
  })

  // A new page from the server starts with nothing selected.
  React.useEffect(() => {
    if (server) setRowSelection({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server?.query.page, server?.query.pageSize, server?.query.sort?.id, server?.query.sort?.desc, server?.query.search])

  React.useEffect(() => {
    onRowSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const filter = !server && filterColumn ? table.getColumn(filterColumn) : undefined
  const showSearch = !!filter || !!server?.searchable

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
      {(showSearch || toolbar) && (
        <div data-slot="data-table-toolbar" className="flex flex-wrap items-center justify-between gap-2">
          {filter ? (
            <div className="relative w-full max-w-72">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={(filter.getFilterValue() as string) ?? ""}
                onChange={(e) => filter.setFilterValue(e.target.value)}
                placeholder={filterPlaceholder}
                aria-label={filterPlaceholder}
                className="h-9 pl-9"
              />
            </div>
          ) : server?.searchable ? (
            <ServerSearch server={server} placeholder={filterPlaceholder} />
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar(table)}</div>}
        </div>
      )}

      <Table
        aria-busy={server?.loading || undefined}
        className={cn(server?.loading && "[&_tbody]:opacity-60 [&_tbody]:transition-opacity")}
      >
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                {server?.loading ? t.dataTable.loading : emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination
        table={table}
        total={server?.rowCount}
        pageSizeOptions={[...new Set([...pageSizeOptions, server?.query.pageSize ?? pageSize])].sort((x, y) => x - y)}
      />
    </div>
  )
}

/** The search box of a server-driven table: sends the text 300 ms after typing stops. */
function ServerSearch({ server, placeholder }: { server: DataTableServer; placeholder?: string }) {
  const [text, setText] = React.useState(server.query.search)
  const latest = React.useRef(server)
  latest.current = server
  // Follow the query when it changes from outside (back button, a link).
  React.useEffect(() => setText(server.query.search), [server.query.search])
  React.useEffect(() => {
    if (text === latest.current.query.search) return
    const timer = setTimeout(() => latest.current.onQueryChange({ ...latest.current.query, search: text, page: 1 }), 300)
    return () => clearTimeout(timer)
  }, [text])
  return (
    <div className="relative w-full max-w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-9"
      />
    </div>
  )
}

/** Sortable column header: click cycles ascending → descending → off. */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  const t = useCoreloomI18n().messages
  if (!column.getCanSort()) return <span className={className}>{title}</span>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      aria-label={t.dataTable.sortBy(title)}
      className={cn(
        "-mx-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-1.5 py-1 uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring",
        sorted && "text-foreground",
        className
      )}
    >
      {title}
      <Icon className={cn("size-3.5", !sorted && "text-muted-foreground")} />
    </button>
  )
}

function DataTablePagination<TData>({
  table,
  total: totalRows,
  pageSizeOptions = [10, 20, 50],
}: {
  table: TanstackTable<TData>
  /** Row count when the rows aren't all in the browser (server-driven tables). */
  total?: number
  pageSizeOptions?: number[]
}) {
  const { messages: t, formatNumber } = useCoreloomI18n()
  const selected = table.getFilteredSelectedRowModel().rows.length
  const total = totalRows ?? table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  return (
    <div
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground"
    >
      <span className="font-mono text-[12px]">
        {selected > 0 ? t.dataTable.selected(formatNumber(selected), formatNumber(total), selected) : t.dataTable.rows(formatNumber(total), total)}
      </span>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span>{t.dataTable.rowsPerPage}</span>
          <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger size="sm" className="w-[72px]" aria-label={t.dataTable.rowsPerPage}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="font-mono text-[12px]">
          {t.dataTable.pageOf(formatNumber(pageIndex + 1), formatNumber(Math.max(table.getPageCount(), 1)))}
        </span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={t.dataTable.previousPage}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={t.dataTable.nextPage}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DataTable, DataTableColumnHeader, DataTablePagination, type DataTableQuery, type DataTableServer }
