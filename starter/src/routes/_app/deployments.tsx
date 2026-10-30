// A server-driven table: the API sorts, searches and pages (src/lib/api.ts → searchDeployments),
// the URL holds the query (/deployments?page=2&sort=duration&desc=true&q=api), TanStack Query
// caches each page and keeps the current one on screen while the next loads.
import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { GitBranchIcon } from "lucide-react"
import { z } from "zod"

import { PageHeader } from "@/components/app-shell"
import { StatusBadge } from "@/components/status-badge"
import { DataTable, DataTableColumnHeader, type DataTableQuery } from "@/components/ui/data-table"
import type { DeploymentQuery, DeploymentRow } from "@/lib/api"
import { formatRelative } from "@/lib/format"
import { useCoreloomI18n } from "@/lib/i18n"
import { useT } from "@/lib/locale"
import { deploymentSearchQuery } from "@/lib/queries"
import type { Messages } from "@/messages"

const SORTABLE = ["createdAt", "duration", "project"] as const

const search = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  size: z.union([z.literal(10), z.literal(20), z.literal(50)]).optional().catch(undefined),
  sort: z.enum(SORTABLE).optional().catch(undefined),
  desc: z.boolean().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
})
type Search = z.infer<typeof search>

/** URL search params → what the API takes. */
const toQuery = (s: Search): DeploymentQuery => ({
  page: s.page ?? 1,
  pageSize: s.size ?? 10,
  sort: s.sort ? { id: s.sort, desc: !!s.desc } : undefined,
  search: s.q ?? "",
})

/** The table's query → URL search params (defaults left out, so URLs stay short). */
const toSearch = (q: DataTableQuery): Search => ({
  page: q.page > 1 ? q.page : undefined,
  size: q.pageSize !== 10 ? (q.pageSize as Search["size"]) : undefined,
  sort: q.sort && (SORTABLE as readonly string[]).includes(q.sort.id) ? (q.sort.id as Search["sort"]) : undefined,
  desc: q.sort?.desc || undefined,
  q: q.search || undefined,
})

export const Route = createFileRoute("/_app/deployments")({
  validateSearch: search,
  staticData: { crumb: (t) => t.nav.deployments },
  loaderDeps: ({ search }) => toQuery(search),
  // Prefetch on navigation and hover; the page reads the same cache entry.
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(deploymentSearchQuery(deps)),
  component: DeploymentsPage,
})

function columnsFor(t: Messages, locale: string): ColumnDef<DeploymentRow>[] {
  return [
    {
      accessorKey: "commit",
      enableSorting: false,
      header: t.project.commit,
      cell: ({ row }) => <span className="font-mono text-[12px] text-foreground">{row.original.commit}</span>,
    },
    {
      id: "project",
      accessorKey: "project",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.projects.name} />,
      cell: ({ row }) => (
        <Link
          to="/projects/$projectId"
          params={{ projectId: row.original.projectId }}
          className="font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline"
        >
          {row.original.project}
        </Link>
      ),
    },
    {
      accessorKey: "branch",
      enableSorting: false,
      header: t.project.branch,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] [&_svg]:size-3.5">
          <GitBranchIcon aria-hidden />
          {row.original.branch}
        </span>
      ),
    },
    { accessorKey: "status", enableSorting: false, header: t.projects.status, cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "duration",
      accessorKey: "duration",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.project.duration} />,
      cell: ({ row }) => <span className="font-mono text-[12px]">{row.original.duration}s</span>,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.project.created} />,
      cell: ({ row }) => <span className="font-mono text-[12px]">{formatRelative(row.original.createdAt, locale)}</span>,
    },
  ]
}

function DeploymentsPage() {
  const t = useT()
  const { locale } = useCoreloomI18n()
  const navigate = useNavigate({ from: Route.fullPath })
  const query = toQuery(Route.useSearch())
  const { data, isFetching } = useQuery(deploymentSearchQuery(query))

  return (
    <>
      <PageHeader title={t.deployments.title} description={t.deployments.description} />
      <DataTable
        columns={columnsFor(t, locale)}
        data={data?.rows ?? []}
        getRowId={(row) => row.id}
        filterPlaceholder={t.deployments.search}
        server={{
          query,
          onQueryChange: (next) => void navigate({ search: toSearch(next), replace: next.search !== query.search }),
          rowCount: data?.total ?? 0,
          loading: isFetching,
          searchable: true,
        }}
      />
    </>
  )
}
