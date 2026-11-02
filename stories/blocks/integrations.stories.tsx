import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  BellRingIcon,
  CloudIcon,
  DatabaseIcon,
  GitBranchIcon,
  LineChartIcon,
  MailIcon,
  MessageSquareIcon,
  TicketIcon,
} from 'lucide-react'
import * as React from 'react'

import { type Integration, Integrations } from '@/components/integrations'
import { toast } from '@/components/ui/sonner'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const catalog: Integration[] = [
  {
    id: 'git',
    name: 'Git provider',
    description: 'Deploy on every push and comment on pull requests with preview links.',
    logo: <GitBranchIcon />,
    category: 'Source control',
    connected: true,
    account: 'acme-org',
  },
  {
    id: 'chat',
    name: 'Team chat',
    description: 'Post deploys, failed builds and incidents to a channel.',
    logo: <MessageSquareIcon />,
    category: 'Notifications',
    connected: true,
    account: '#deploys',
  },
  {
    id: 'email',
    name: 'Email digest',
    description: 'A weekly summary of deploys, usage and spend.',
    logo: <MailIcon />,
    category: 'Notifications',
  },
  {
    id: 'pager',
    name: 'On-call alerts',
    description: 'Page the on-call engineer when production goes down.',
    logo: <BellRingIcon />,
    category: 'Notifications',
  },
  {
    id: 'metrics',
    name: 'Metrics export',
    description: 'Send request, latency and error metrics to your observability tool.',
    logo: <LineChartIcon />,
    category: 'Monitoring',
    unavailable: 'On the Team plan',
  },
  {
    id: 'db',
    name: 'Postgres',
    description: 'Inject connection strings into your projects’ environment variables.',
    logo: <DatabaseIcon />,
    category: 'Data',
  },
  {
    id: 'storage',
    name: 'Object storage',
    description: 'Store build artifacts and uploads in your own bucket.',
    logo: <CloudIcon />,
    category: 'Data',
  },
  {
    id: 'tickets',
    name: 'Issue tracker',
    description: 'Link deploys to issues and close them when the fix ships.',
    logo: <TicketIcon />,
    category: 'Source control',
  },
]

const meta = {
  title: 'Blocks/Integrations',
  component: Integrations,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The apps a workspace can connect, as cards: logo, what it does, connected or not (and as whom), with search and category filters (plus Connected). `onConnect` runs your OAuth flow (return a promise to show progress); `onConfigure` and `onDisconnect` (confirmed) show on connected apps. `unavailable` disables Connect with a note ("On the Team plan").',
      },
    },
  },
  args: { integrations: catalog },
  render: (args) => {
    const [list, setList] = React.useState(args.integrations)
    return (
      <div className="mx-auto max-w-[1040px] py-4">
        <Integrations
          {...args}
          integrations={list}
          onConnect={async (id) => {
            await wait(900)
            setList((l) =>
              l.map((i) => (i.id === id ? { ...i, connected: true, account: 'acme' } : i)),
            )
          }}
          onConfigure={(id) => toast(`Configure ${id}`)}
          onDisconnect={(id) => {
            setList((l) => l.map((i) => (i.id === id ? { ...i, connected: false } : i)))
          }}
        />
      </div>
    )
  },
} satisfies Meta<typeof Integrations>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = { args: { integrations: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    integrations: catalog.map((i) => ({
      ...i,
      category: {
        'Source control': 'Code source',
        Notifications: 'Notifications',
        Monitoring: 'Supervision',
        Data: 'Données',
      }[i.category ?? ''],
      unavailable: i.unavailable ? 'Avec l’offre Team' : undefined,
    })),
  },
}
