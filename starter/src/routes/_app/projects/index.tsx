import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { z } from 'zod'

import { PageHeader } from '@/components/app-shell'
import {
  DataListEmpty,
  DataListPagination,
  DataListToolbar,
  useDataList,
} from '@/components/data-list'
import { NewProjectDialog } from '@/components/new-project-dialog'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRelative } from '@/lib/format'
import { useCoreloomI18n } from '@/lib/i18n'
import { useT } from '@/lib/locale'
import { projectsQuery } from '@/lib/queries'

// The list's state lives in the URL, validated here: /projects?q=api&status=ready,failed&page=2.
// `new` opens the "New project" dialog (the ⌘K palette links to it).
const search = z.object({
  q: z.string().optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  region: z.string().optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  new: z.boolean().optional().catch(undefined),
})

type Search = z.infer<typeof search>
const LIST_KEYS = ['q', 'status', 'region', 'page'] as const

export const Route = createFileRoute('/_app/projects/')({
  validateSearch: search,
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: ProjectsPage,
})

function ProjectsPage() {
  const t = useT()
  const { locale } = useCoreloomI18n()
  const { data: projects } = useSuspenseQuery(projectsQuery)
  const current = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  // useDataList speaks URLSearchParams; the router speaks typed search objects.
  const params = new URLSearchParams()
  for (const key of LIST_KEYS) if (current[key] !== undefined) params.set(key, String(current[key]))

  const list = useDataList({
    rows: projects,
    searchKeys: ['name', 'framework'],
    pageSize: 8,
    facets: [
      {
        key: 'status',
        label: t.projects.status,
        options: (['ready', 'building', 'failed'] as const).map((value) => ({
          value,
          label: t.status[value],
        })),
      },
      {
        key: 'region',
        label: t.projects.region,
        options: (['cdg1', 'fra1', 'iad1'] as const).map((value) => ({
          value,
          label: t.regions[value],
        })),
      },
    ],
    searchParams: params,
    onSearchParamsChange: (next) =>
      void navigate({
        search: (prev): Search => ({
          new: prev.new,
          q: next.get('q') ?? undefined,
          status: next.get('status') ?? undefined,
          region: next.get('region') ?? undefined,
          page: next.has('page') ? Number(next.get('page')) : undefined,
        }),
        replace: true,
      }),
  })

  const setDialog = (open: boolean) =>
    void navigate({ search: (prev): Search => ({ ...prev, new: open || undefined }) })

  return (
    <>
      <PageHeader title={t.projects.title} description={t.projects.description} />
      <div className="flex flex-col gap-4">
        <DataListToolbar
          list={list}
          searchLabel={t.projects.search}
          actions={
            <Button
              size="sm"
              onClick={() => {
                setDialog(true)
              }}
            >
              <PlusIcon />
              {t.projects.new}
            </Button>
          }
        />
        {list.filtered.length === 0 ? (
          <DataListEmpty list={list} />
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.projects.name}</TableHead>
                  <TableHead>{t.projects.status}</TableHead>
                  <TableHead>{t.projects.region}</TableHead>
                  <TableHead>{t.projects.framework}</TableHead>
                  <TableHead className="text-right">{t.projects.updated}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.pageRows.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: project.id }}
                        className="font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="font-mono text-[12px]">{project.region}</TableCell>
                    <TableCell>{project.framework}</TableCell>
                    <TableCell className="text-right font-mono text-[12px]">
                      {formatRelative(project.updatedAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DataListPagination list={list} />
      </div>
      <NewProjectDialog
        open={!!current.new}
        onOpenChange={setDialog}
        onCreated={(project) =>
          void navigate({ to: '/projects/$projectId', params: { projectId: project.id } })
        }
      />
    </>
  )
}
