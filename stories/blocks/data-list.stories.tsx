import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlusIcon } from 'lucide-react'

import {
  DataListEmpty,
  DataListPagination,
  DataListToolbar,
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

function ProjectsList() {
  const list = useDataList({
    rows: projects,
    searchKeys: ['name', 'framework'],
    pageSize: 6,
    facets: [
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
    ],
  })
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
      {list.filtered.length === 0 ? (
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
