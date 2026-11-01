import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatCard } from '@/components/stat-card'
import { Sparkline } from '@/components/ui/sparkline'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const signups = [42, 48, 45, 61, 58, 72, 69, 84, 80, 95, 91, 108]

const meta = {
  title: 'Components/Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A word-sized trend with no axes, next to a number: in a StatCard, a table cell or a list row. Line, area or bars, in plain SVG. Screen readers hear the first and last value, the low and the high after your `aria-label`.',
      },
    },
  },
  args: {
    data: signups,
    type: 'line',
    height: 32,
    showLast: true,
    'aria-label': 'Sign-ups, last 12 weeks',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['line', 'area', 'bar'] },
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
    height: { control: { type: 'number', min: 16, max: 120 } },
    showLast: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    data: { control: 'object' },
  },
  render: (args) => (
    <div className="w-48">
      <Sparkline {...args} />
    </div>
  ),
} satisfies Meta<typeof Sparkline>
export default meta
type Story = StoryObj<typeof meta>

/** A line with the latest value marked. */
export const Default: Story = {}

/** A soft fill under the line: reads well large, in a card. */
export const Area: Story = { args: { type: 'area', height: 48, color: 'var(--chart-2)' } }

/** One bar per value; negative values hang below zero. */
export const Bars: Story = {
  args: {
    type: 'bar',
    data: [12, 18, -4, 9, 22, 15, -8, 6, 19, 24],
    color: 'var(--chart-4)',
    'aria-label': 'Net seats added per week',
  },
}

/** No data yet: a dashed baseline, and "No data" for screen readers. */
export const Empty: Story = { args: { data: [] } }

/** A flat series sits in the middle. */
export const Flat: Story = { args: { data: [5, 5, 5, 5, 5], 'aria-label': 'Open incidents' } }

/** In a StatCard: pass `sparkline` with the recent values. */
export const InStatCard: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard
        label="Sign-ups"
        value="1,084"
        delta="+12.4%"
        note="Last 12 weeks"
        sparkline={signups}
      />
      <StatCard
        label="p95 latency"
        value="182 ms"
        delta="−8%"
        trend="down"
        good
        note="Last 12 weeks"
        sparkline={[240, 232, 228, 236, 214, 205, 210, 198, 190, 194, 186, 182]}
      />
    </div>
  ),
}

const services = [
  { name: 'api-gateway', rps: '2,410', data: [18, 22, 21, 26, 30, 28, 34, 33, 38, 41] },
  { name: 'auth', rps: '640', data: [9, 8, 9, 10, 9, 8, 7, 8, 7, 6] },
  { name: 'billing-worker', rps: '88', data: [2, 3, 2, 8, 3, 2, 2, 3, 2, 2] },
]

/** In a table: one per row, sized by the cell. */
export const InTable: Story = {
  render: () => (
    <div className="max-w-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Requests/s</TableHead>
            <TableHead className="w-32">Last hour</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.name}>
              <TableCell className="font-mono text-[12.5px]">{s.name}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{s.rps}</TableCell>
              <TableCell>
                <Sparkline
                  data={s.data}
                  height={24}
                  aria-label={`${s.name}, requests per second`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

/** French: the summary is translated and the numbers follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: { data: [1250.5, 1310, 1288.25, 1402], 'aria-label': 'Revenu hebdomadaire' },
}
