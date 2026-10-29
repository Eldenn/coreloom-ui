"use client"

// Coreloom UI — DataTable. shadcn's data-table recipe (TanStack Table v8) packaged as one
// component: sorting, a text filter, row selection and pagination on top of Table.
// Columns are TanStack `ColumnDef`s; use DataTableColumnHeader for sortable headers.
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

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter…",
  toolbar,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  emptyText = "No results.",
  getRowId,
  onRowSelectionChange,
  className,
}: {
  columns: ColumnDef<TData, TValue>[]
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
  className?: string
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  React.useEffect(() => {
    onRowSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const filter = filterColumn ? table.getColumn(filterColumn) : undefined

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
      {(filter || toolbar) && (
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
          ) : (
            <span />
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar(table)}</div>}
        </div>
      )}

      <Table>
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
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination
        table={table}
        pageSizeOptions={[...new Set([...pageSizeOptions, pageSize])].sort((x, y) => x - y)}
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
  if (!column.getCanSort()) return <span className={className}>{title}</span>
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      aria-label={`Sort by ${title}`}
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
  pageSizeOptions = [10, 20, 50],
}: {
  table: TanstackTable<TData>
  pageSizeOptions?: number[]
}) {
  const selected = table.getFilteredSelectedRowModel().rows.length
  const total = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  return (
    <div
      data-slot="data-table-pagination"
      className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted-foreground"
    >
      <span className="font-mono text-[12px]">
        {selected > 0 ? `${selected} of ${total} selected` : `${total} ${total === 1 ? "row" : "rows"}`}
      </span>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger size="sm" className="w-[72px]" aria-label="Rows per page">
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
          Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { DataTable, DataTableColumnHeader, DataTablePagination }
