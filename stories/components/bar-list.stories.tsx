import type { Meta, StoryObj } from '@storybook/react-vite'
import { BotIcon, CpuIcon, SparklesIcon } from 'lucide-react'

import { BarList } from '@/components/ui/bar-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const pages = [
  { label: '/pricing', value: 18_204, href: '#pricing' },
  { label: '/docs/getting-started', value: 12_880, href: '#getting-started' },
  { label: '/', value: 31_420, href: '#home' },
  { label: '/blog/coreloom-1-0', value: 6_310, href: '#blog' },
  { label: '/changelog', value: 4_112, href: '#changelog' },
  { label: '/docs/registry', value: 3_870, href: '#registry' },
  { label: '/careers', value: 1_204, href: '#careers' },
  { label: '/legal/privacy', value: 640, href: '#privacy' },
]

const meta = {
  title: 'Components/Charts/Bar list',
  component: BarList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A ranking as a list: label over a proportional bar, value at the right. Sorted largest first by default; `limit` shows the top rows and a "Show all" button. Labels with an `href` become links through the app’s router.',
      },
    },
  },
  args: { data: pages, sortOrder: 'desc', 'aria-label': 'Top pages by views' },
  argTypes: {
    sortOrder: { control: 'inline-radio', options: ['desc', 'asc', 'none'] },
    limit: { control: { type: 'number', min: 1 } },
    max: { control: 'number' },
    color: {
      control: 'select',
      options: [
        'var(--chart-1)',
        'var(--chart-2)',
        'var(--chart-3)',
        'var(--chart-4)',
        'var(--chart-5)',
      ],
    },
    data: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-md">
      <BarList {...args} />
    </div>
  ),
} satisfies Meta<typeof BarList>
export default meta
type Story = StoryObj<typeof meta>

/** Every page, largest first, each label a link. */
export const Default: Story = {}

/** The top five, and a button for the rest. */
export const WithLimit: Story = { args: { limit: 5 } }

/** Icons before the labels, no links, in a card. */
export const InCard: Story = {
  args: {
    data: [
      { label: 'Support assistant', value: 4_812, icon: <BotIcon /> },
      { label: 'Code review agent', value: 2_394, icon: <SparklesIcon /> },
      { label: 'Batch summariser', value: 918, icon: <CpuIcon /> },
    ],
    color: 'var(--chart-2)',
    'aria-label': 'Runs per agent',
  },
  render: (args) => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Runs per agent</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <BarList {...args} />
      </CardContent>
    </Card>
  ),
}

/** Shares of a fixed total: `max` sets what a full bar means, `formatValue` adds the unit. */
export const Percentages: Story = {
  args: {
    data: [
      { label: 'Chrome', value: 64.2 },
      { label: 'Safari', value: 19.8 },
      { label: 'Firefox', value: 8.1 },
      { label: 'Edge', value: 5.4 },
    ],
    max: 100,
    formatValue: (v: number) => `${v.toFixed(1)} %`,
    'aria-label': 'Visitors by browser',
  },
}

/** Nothing to rank. */
export const Empty: Story = { args: { data: [] } }

/** Long labels truncate with an ellipsis, values stay aligned. */
export const LongLabels: Story = {
  args: {
    data: [
      { label: '/docs/components/data-display/charts/donut-chart-with-legend', value: 2_204 },
      { label: '/docs/guides/installing-the-registry-in-a-monorepo-with-pnpm', value: 1_480 },
      { label: '/short', value: 312 },
    ],
  },
}

/** French: "Tout afficher" and the number format follow the locale. */
export const French: Story = { globals: { locale: 'fr' }, args: { limit: 4 } }
