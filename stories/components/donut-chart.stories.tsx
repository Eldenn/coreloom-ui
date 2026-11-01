import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DonutChart } from '@/components/ui/donut-chart'

const byModel = [
  { key: 'sonnet', label: 'Claude Sonnet', value: 41_200 },
  { key: 'haiku', label: 'Claude Haiku', value: 23_800 },
  { key: 'gpt', label: 'GPT mini', value: 12_600 },
  { key: 'gemini', label: 'Gemini Flash', value: 5_400 },
  { key: 'llama', label: 'Llama 4', value: 2_100 },
  { key: 'mistral', label: 'Mistral Small', value: 900 },
]

const meta = {
  title: 'Components/Charts/Donut chart',
  component: DonutChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'How a whole splits into a few parts: a ring with the total in the middle and a legend that states each value and share. Parts past `maxSlices` (3 by default, 5 at most) fold into a grey "Other". Plain SVG, no animation.',
      },
    },
  },
  args: {
    data: byModel,
    maxSlices: 3,
    centerLabel: 'Requests',
    size: 160,
    legend: 'right',
    'aria-label': 'Requests by model, October',
  },
  argTypes: {
    maxSlices: { control: { type: 'number', min: 1, max: 5 } },
    legend: { control: 'inline-radio', options: ['right', 'bottom', 'none'] },
    size: { control: { type: 'number', min: 80, max: 320 } },
    data: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-md">
      <DonutChart {...args} />
    </div>
  ),
} satisfies Meta<typeof DonutChart>
export default meta
type Story = StoryObj<typeof meta>

/** Three models and the rest in "Other". Hover a part or a legend row to pick it out. */
export const Default: Story = {}

/** Five colored parts: the limit of the palette. */
export const FiveParts: Story = { args: { maxSlices: 5 } }

/** Legend below, in a card. */
export const InCard: Story = {
  args: { legend: 'bottom', size: 180 },
  render: (args) => (
    <Card className="max-w-xs">
      <CardHeader>
        <CardTitle>Requests by model</CardTitle>
        <CardDescription>October 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <DonutChart {...args} />
      </CardContent>
    </Card>
  ),
}

/** Values as money: `formatValue` formats the middle and the legend. */
export const Currency: Story = {
  args: {
    data: [
      { key: 'compute', label: 'Compute', value: 18_420 },
      { key: 'storage', label: 'Storage', value: 6_310 },
      { key: 'egress', label: 'Egress', value: 2_980 },
    ],
    centerLabel: 'Spend',
    formatValue: (v: number) =>
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(v),
    'aria-label': 'Cloud spend by category',
  },
}

/** Nothing to split: an empty ring and "No data". */
export const Empty: Story = { args: { data: [] } }

/** Long labels truncate; the full text stays in the DOM for screen readers. */
export const LongLabels: Story = {
  args: {
    data: [
      { key: 'a', label: 'Customer support assistant (production, EU region)', value: 520 },
      { key: 'b', label: 'Internal knowledge search with retrieval', value: 310 },
      { key: 'c', label: 'Nightly batch summarisation of tickets', value: 140 },
    ],
  },
}

/** French: "Autres", "Total" and the number format follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: { centerLabel: 'Requêtes', 'aria-label': 'Requêtes par modèle, octobre' },
}

/** Narrow (a phone column): the legend wraps under the ring. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <DonutChart {...args} />
    </div>
  ),
}
