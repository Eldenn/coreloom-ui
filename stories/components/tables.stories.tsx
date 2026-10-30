import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeDot } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, DataTableColumnHeader, type DataTableQuery } from "@/components/ui/data-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Deployment = { id: string; project: string; status: "ready" | "building" | "failed"; secs?: number }
const data: Deployment[] = [
  { id: "dpl_8f2k", project: "coreloom-web", status: "ready", secs: 38 },
  { id: "dpl_7c1x", project: "coreloom-api", status: "building" },
  { id: "dpl_6a9m", project: "docs", status: "ready", secs: 51 },
  { id: "dpl_5t3q", project: "coreloom-api", status: "failed", secs: 72 },
  { id: "dpl_4n8w", project: "cli", status: "ready", secs: 29 },
  { id: "dpl_3h2e", project: "marketing", status: "ready", secs: 44 },
]
const variant = { ready: "success", building: "default", failed: "destructive" } as const

const columns: ColumnDef<Deployment>[] = [
  {
    id: "select",
    enableSorting: false,
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />,
  },
  { accessorKey: "project", header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />, cell: ({ row }) => <span className="font-medium text-foreground">{row.original.project}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={variant[row.original.status]}><BadgeDot />{row.original.status}</Badge> },
  { accessorKey: "secs", header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />, cell: ({ row }) => <span className="font-mono">{row.original.secs ?? "—"}{row.original.secs ? "s" : ""}</span> },
]

const meta = { title: "Components/Tables", component: DataTable, tags: ["autodocs"] } satisfies Meta<typeof DataTable>
export default meta
type Story = StoryObj<typeof meta>

export const DataTableStory: Story = {
  name: "DataTable",
  args: { columns: columns as never, data },
  render: () => <DataTable columns={columns} data={data} filterColumn="project" filterPlaceholder="Filter projects…" pageSize={5} pageSizeOptions={[5, 10]} />,
}

export const TableStory: Story = {
  name: "Table",
  args: { columns: columns as never, data },
  render: () => (
    <Table>
      <TableHeader><TableRow><TableHead>Project</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Duration</TableHead></TableRow></TableHeader>
      <TableBody>
        {data.slice(0, 4).map((d) => (
          <TableRow key={d.id} data-state={d.status === "failed" ? "selected" : undefined}>
            <TableCell className="font-medium text-foreground">{d.project}</TableCell>
            <TableCell><Badge variant={variant[d.status]}><BadgeDot />{d.status}</Badge></TableCell>
            <TableCell className="text-right font-mono">{d.secs ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

// A pretend API: 137 deployments, filtered, sorted and paged "on the server" after a short wait.
const all: Deployment[] = Array.from({ length: 137 }, (_, i) => ({
  id: `dpl_${(1000 + i).toString(36)}`,
  project: ["coreloom-web", "coreloom-api", "docs", "cli", "marketing", "billing"][i % 6],
  status: (["ready", "ready", "building", "ready", "failed"] as const)[i % 5],
  secs: i % 5 === 2 ? undefined : 20 + ((i * 7) % 60),
}))

async function fetchDeployments(query: DataTableQuery) {
  await new Promise((r) => setTimeout(r, 400))
  let rows = all.filter((d) => d.project.includes(query.search.toLowerCase()) || d.id.includes(query.search.toLowerCase()))
  if (query.sort) {
    const { id, desc } = query.sort
    rows = [...rows].sort((a, b) => {
      const x = a[id as keyof Deployment]
      const y = b[id as keyof Deployment]
      // Rows without a value (still building) go last either way.
      if (x === undefined || y === undefined) return x === y ? 0 : x === undefined ? 1 : -1
      return (x < y ? -1 : x > y ? 1 : 0) * (desc ? -1 : 1)
    })
  }
  const start = (query.page - 1) * query.pageSize
  return { rows: rows.slice(start, start + query.pageSize), total: rows.length }
}

/** Sorting, search and paging happen in `fetchDeployments` (a stand-in for your API). In an app,
 *  keep `query` in the URL and fetch with TanStack Query — the starter's Deployments page does. */
export const ServerDriven: Story = {
  name: "DataTable (server-driven)",
  args: { columns: columns as never, data },
  render: () => {
    const [query, setQuery] = React.useState<DataTableQuery>({ page: 1, pageSize: 10, search: "" })
    const [result, setResult] = React.useState<{ rows: Deployment[]; total: number }>({ rows: [], total: 0 })
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
      let current = true
      setLoading(true)
      void fetchDeployments(query).then((r) => {
        if (!current) return
        setResult(r)
        setLoading(false)
      })
      return () => {
        current = false
      }
    }, [query])
    return (
      <DataTable
        columns={columns}
        data={result.rows}
        getRowId={(row) => row.id}
        filterPlaceholder="Search deployments…"
        server={{ query, onQueryChange: setQuery, rowCount: result.total, loading, searchable: true }}
      />
    )
  },
}

// 5,000 rows built from a fixed seed, so screenshots stay the same.
const projects = ["coreloom-web", "coreloom-api", "docs", "cli", "marketing", "billing-service", "auth-gateway", "status-page"]
const statuses = ["ready", "ready", "building", "ready", "failed"] as const
const manyRows: Deployment[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `dpl_${(i + 1).toString().padStart(4, "0")}`,
  project: projects[(i * 7) % projects.length],
  status: statuses[(i * 3) % statuses.length],
  secs: statuses[(i * 3) % statuses.length] === "building" ? undefined : 20 + ((i * 37) % 70),
}))
const idColumn: ColumnDef<Deployment> = { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Deployment" />, cell: ({ row }) => <span className="font-mono text-[12px]">{row.original.id}</span> }

/** 5,000 rows in a 420 px box: only the visible rows are in the page. Sort, filter and select as usual; the header stays pinned. */
export const Virtual: Story = {
  name: "DataTable (virtual, 5,000 rows)",
  args: { columns: columns as never, data },
  render: () => (
    <DataTable
      columns={[columns[0], idColumn, ...columns.slice(1)]}
      data={manyRows}
      getRowId={(row) => row.id}
      filterColumn="project"
      filterPlaceholder="Filter projects…"
      virtual={{ height: 420, rowHeight: 47, label: "Deployments" }}
    />
  ),
}
