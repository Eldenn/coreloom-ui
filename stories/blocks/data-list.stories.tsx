import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon } from 'lucide-react'
import * as React from 'react'

import {
  type DataList,
  DataListEmpty,
  DataListPagination,
  DataListToolbar,
  FacetedFilter,
  useDataList,
} from '@/components/data-list'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Project {
  name: string
  status: 'ready' | 'building' | 'failed'
  region: string
  framework: string
  updated: string
}

const names = [
  'coreloom-web',
  'coreloom-api',
  'docs',
  'marketing-site',
  'billing-service',
  'auth-gateway',
  'status-page',
  'design-tokens',
  'cli',
  'mobile-bff',
  'analytics-worker',
  'image-proxy',
  'search-indexer',
  'mailer',
  'storybook',
]
const statuses = ['ready', 'ready', 'building', 'ready', 'failed'] as const
const regions = ['cdg1', 'fra1', 'iad1']
const frameworks = ['Next.js', 'Vite', 'AdonisJS', 'Astro']
const projects: Project[] = names.map((name, i) => ({
  name,
  status: statuses[i % statuses.length],
  region: regions[i % regions.length],
  framework: frameworks[(i * 3) % frameworks.length],
  updated: `${(i % 9) + 1}h ago`,
}))

const statusVariant = { ready: 'success', building: 'warning', failed: 'destructive' } as const

const facets = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ready', label: 'Ready' },
      { value: 'building', label: 'Building' },
      { value: 'failed', label: 'Failed' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    options: [
      { value: 'cdg1', label: 'Paris (cdg1)' },
      { value: 'fra1', label: 'Frankfurt (fra1)' },
      { value: 'iad1', label: 'Washington (iad1)' },
    ],
  },
]
const PAGE_SIZE = 6

function ProjectsList() {
  const list = useDataList({
    rows: projects,
    searchKeys: ['name', 'framework'],
    pageSize: PAGE_SIZE,
    facets,
  })
  return <ProjectsView list={list} />
}

/** What an API would answer for these parameters: one page of matches, their total and counts. */
function fakeServer(params: URLSearchParams) {
  const q = (params.get('q') ?? '').trim().toLowerCase()
  const selected = (key: string) => params.get(key)?.split(',').filter(Boolean) ?? []
  const matches = (p: Project, except?: string) =>
    (!q || p.name.includes(q) || p.framework.toLowerCase().includes(q)) &&
    facets.every(
      (f) =>
        f.key === except ||
        selected(f.key).length === 0 ||
        selected(f.key).includes(p[f.key as keyof Project]),
    )
  const counts: Record<string, Record<string, number>> = {}
  for (const f of facets) {
    counts[f.key] = {}
    for (const p of projects.filter((row) => matches(row, f.key))) {
      const value = p[f.key as keyof Project]
      counts[f.key][value] = (counts[f.key][value] ?? 0) + 1
    }
  }
  const found = projects.filter((p) => matches(p))
  const page = Math.max(1, Number(params.get('page')) || 1)
  return {
    rows: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: found.length,
    counts,
  }
}

/** The server filters and paginates; the list shows its page and its figures. */
function ServerProjectsList() {
  // A router would own these; the story keeps them in state.
  const [params, setParams] = React.useState(() => new URLSearchParams())
  const answer = fakeServer(params)
  const list = useDataList({
    rows: answer.rows,
    searchKeys: [],
    pageSize: PAGE_SIZE,
    facets,
    searchParams: params,
    onSearchParamsChange: setParams,
    server: { total: answer.total, counts: answer.counts },
  })
  return <ProjectsView list={list} />
}

function ProjectsView({ list }: { list: DataList<Project> }) {
  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <DataListToolbar
        list={list}
        searchLabel="Search projects…"
        actions={
          <Button size="sm">
            <PlusIcon />
            New project
          </Button>
        }
      />
      {list.matched === 0 ? (
        <DataListEmpty list={list} />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.pageRows.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[p.status]}>
                      <BadgeDot />
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[12px]">{p.region}</TableCell>
                  <TableCell>{p.framework}</TableCell>
                  <TableCell className="text-right font-mono text-[12px]">{p.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <DataListPagination list={list} />
    </div>
  )
}

const meta = {
  title: 'Blocks/Data list',
  component: ProjectsList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Search, faceted filters with counts and pagination, all kept in the URL (`?q=…&status=ready,failed&page=2`): reload, bookmark or share a filtered view. Rows render however you like — a Table here.',
      },
    },
  },
} satisfies Meta<typeof ProjectsList>
export default meta
type Story = StoryObj<typeof meta>

export const Projects: Story = {}

/**
 * One faceted filter on its own, outside the toolbar. With `defaultValue` it keeps its own
 * choice; `onValueChange` hears every change.
 */
export const FacetedFilterAlone: Story = {
  render: () => (
    <FacetedFilter
      title="Status"
      options={[
        { value: 'ready', label: 'Ready' },
        { value: 'building', label: 'Building' },
        { value: 'failed', label: 'Failed' },
      ]}
      defaultValue={['failed']}
      counts={{ ready: 12, building: 3, failed: 2 }}
    />
  ),
}

export const ServerSide: Story = {
  render: () => <ServerProjectsList />,
  parameters: {
    docs: {
      description: {
        story:
          'The server filters and paginates: `rows` is the page it returned, `server` its total and facet counts.',
      },
    },
  },
}
