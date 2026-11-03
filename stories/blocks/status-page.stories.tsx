import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  type Incident,
  IncidentTimeline,
  type StatusComponent,
  StatusPage,
  UptimeBar,
  type UptimeDay,
} from '@/components/status-page'
import { toast } from '@/components/ui/sonner'

const at = (month: number, date: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, date, hour, minute)

/** 90 days ending on 14 Oct 2026, with a few bad days at fixed offsets (days ago → uptime). */
function history(bad: Record<number, number> = {}, incidents: Record<number, string[]> = {}) {
  return Array.from({ length: 90 }, (_, i): UptimeDay => {
    const ago = 89 - i
    return {
      date: at(10, 14 - ago),
      uptime: bad[ago] ?? 100,
      incidents: incidents[ago],
    }
  })
}

const components: StatusComponent[] = [
  {
    id: 'web',
    name: 'Dashboard',
    description: 'app.coreloom.dev',
    status: 'operational',
    group: 'Product',
    days: history({ 41: 99.82 }),
  },
  {
    id: 'api',
    name: 'API',
    description: 'api.coreloom.dev',
    status: 'degraded',
    group: 'Product',
    days: history(
      { 0: 99.4, 12: 97.8, 63: 99.95 },
      { 0: ['Slow API responses in Europe'], 12: ['Errors on deploy webhooks'] },
    ),
  },
  {
    id: 'builds',
    name: 'Builds',
    status: 'operational',
    group: 'Product',
    days: history({ 12: 98.6, 30: 99.7 }, { 12: ['Errors on deploy webhooks'] }),
  },
  {
    id: 'cdn',
    name: 'Edge network',
    status: 'operational',
    group: 'Infrastructure',
    days: history(),
  },
  {
    id: 'db',
    name: 'Managed databases',
    status: 'maintenance',
    group: 'Infrastructure',
    days: Array.from({ length: 90 }, (_, i): UptimeDay => ({
      date: at(10, 14 - (89 - i)),
      // A database that joined the status page 20 days ago.
      uptime: i < 70 ? undefined : 100,
      status: i === 89 ? 'maintenance' : undefined,
    })),
  },
]

const ongoing: Incident = {
  id: 'inc-58',
  title: 'Slow API responses in Europe',
  impact: 'minor',
  components: ['API'],
  updates: [
    {
      stage: 'investigating',
      at: at(10, 14, 8, 12),
      message:
        'Requests to api.coreloom.dev from Europe take up to 4 seconds. We’re looking into it.',
    },
    {
      stage: 'identified',
      at: at(10, 14, 8, 47),
      message: 'A failing node in the Paris region sends traffic to Frankfurt. We’re replacing it.',
    },
    {
      stage: 'monitoring',
      at: at(10, 14, 9, 30),
      message:
        'The new node is live and response times are back to normal. We’re keeping an eye on it.',
    },
  ],
}

const maintenance: Incident = {
  id: 'mnt-12',
  title: 'Database upgrade to Postgres 18',
  impact: 'maintenance',
  components: ['Managed databases'],
  updates: [
    {
      stage: 'scheduled',
      at: at(10, 10, 9),
      message:
        'Databases restart one by one between 09:00 and 11:00. Each one is read-only for about a minute.',
    },
    { stage: 'inProgress', at: at(10, 14, 9), message: 'The upgrade has started.' },
  ],
}

const past: Incident[] = [
  {
    id: 'inc-57',
    title: 'Errors on deploy webhooks',
    impact: 'major',
    components: ['API', 'Builds'],
    updates: [
      {
        stage: 'investigating',
        at: at(10, 2, 14, 5),
        message: 'Deploys triggered from GitHub fail with a 502.',
      },
      {
        stage: 'identified',
        at: at(10, 2, 14, 40),
        message: 'A configuration change on our load balancer dropped the webhook route.',
      },
      {
        stage: 'resolved',
        at: at(10, 2, 15, 22),
        message: 'We rolled the change back. Deploys that failed can be re-run from the dashboard.',
      },
    ],
  },
  {
    id: 'inc-55',
    title: 'Dashboard sign-in loops',
    impact: 'minor',
    components: ['Dashboard'],
    updates: [
      {
        stage: 'investigating',
        at: at(9, 3, 10, 0),
        message: 'Some people get sent back to sign-in.',
      },
      { stage: 'resolved', at: at(9, 3, 10, 35), message: 'A cookie setting was fixed.' },
    ],
  },
]

const meta = {
  title: 'Blocks/Status page',
  component: StatusPage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A public status page: the overall state (the worst of the components), each component with its state and 90 days of uptime, ongoing incidents with their timeline, and past incidents. The uptime bar is a slider: arrow keys read each day aloud, hover shows it. Pass data from your monitoring; `onSubscribe` shows Subscribe. `UptimeBar` and `IncidentTimeline` also work alone.',
      },
    },
  },
  args: {
    components,
    incidents: [ongoing, maintenance, ...past],
    title: 'Coreloom status',
    updatedAt: at(10, 14, 9, 58),
    onSubscribe: () => toast('Subscribed to updates'),
  },
  render: (args) => (
    <div className="mx-auto max-w-[860px] py-4">
      <StatusPage {...args} />
    </div>
  ),
} satisfies Meta<typeof StatusPage>
export default meta
type Story = StoryObj<typeof meta>

/** An incident being monitored and a maintenance in progress. */
export const Default: Story = {}

/** Everything works. */
export const AllOperational: Story = {
  args: {
    components: components.map((c) => ({ ...c, status: 'operational' as const })),
    incidents: past,
  },
}

/** A major outage. */
export const MajorOutage: Story = {
  args: {
    components: components.map((c) => (c.id === 'api' ? { ...c, status: 'major' as const } : c)),
    incidents: [{ ...ongoing, impact: 'critical', updates: ongoing.updates.slice(0, 1) }],
  },
}

/** No groups, no past incidents. */
export const Simple: Story = {
  args: {
    components: components
      .slice(0, 3)
      .map(({ group: _, ...c }) => ({ ...c, status: 'operational' as const })),
    incidents: [],
    onSubscribe: undefined,
  },
}

export const French: Story = { globals: { locale: 'fr' } }

/** The bar alone, in a service card. */
export const UptimeBarAlone: Story = {
  render: () => (
    <div className="mx-auto flex max-w-[560px] flex-col gap-2 rounded-xl border border-border bg-card p-5">
      <p className="m-0 text-[14px] font-medium text-foreground">API</p>
      <UptimeBar days={components[1]?.days ?? []} name="API" />
    </div>
  ),
}

/** The timeline alone, for an admin incident page. */
export const IncidentTimelineAlone: Story = {
  render: () => (
    <div className="mx-auto max-w-[560px] rounded-xl border border-border bg-card p-5">
      <IncidentTimeline incident={ongoing} />
    </div>
  ),
}
