import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { Badge, BadgeDot } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
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
