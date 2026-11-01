import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gauge } from '@/components/ui/gauge'

const meta = {
  title: 'Components/Charts/Gauge',
  component: Gauge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One value against its range: a quota, an error budget, an SLO, a score. With `warning` and `critical` it turns amber then red and says so in words; `higherIsBetter` flips the zones for things like uptime. Exposed as a `meter`.',
      },
    },
  },
  args: { value: 64, min: 0, max: 100, unit: '%', label: 'Storage used', size: 160 },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    warning: { control: 'number' },
    critical: { control: 'number' },
    higherIsBetter: { control: 'boolean' },
    size: { control: { type: 'number', min: 96, max: 320 } },
  },
} satisfies Meta<typeof Gauge>
export default meta
type Story = StoryObj<typeof meta>

/** A plain gauge in `chart-1`: no thresholds, no status. */
export const Default: Story = {}

/** The three zones side by side: normal, warning from 80, critical from 95. */
export const Thresholds: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-8">
      <Gauge {...args} value={52} warning={80} critical={95} label="Storage used" />
      <Gauge {...args} value={86} warning={80} critical={95} label="Seats used" />
      <Gauge {...args} value={97} warning={80} critical={95} label="API quota" />
    </div>
  ),
}

/** Higher is better: uptime on a 95–100 % scale, critical under 99 %. */
export const HigherIsBetter: Story = {
  args: {
    value: 99.32,
    min: 95,
    max: 100,
    warning: 99.5,
    critical: 99,
    higherIsBetter: true,
    label: 'Uptime, 30 days',
    formatValue: (v: number) => v.toFixed(2),
  },
}

/** In a dashboard card, smaller. */
export const InCard: Story = {
  render: () => (
    <Card className="max-w-xs">
      <CardHeader>
        <CardTitle>Monthly token budget</CardTitle>
        <CardDescription>Resets on 1 November</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Gauge
          value={7.4}
          max={10}
          unit="M"
          warning={8}
          critical={9.5}
          label="Tokens used"
          size={140}
        />
      </CardContent>
    </Card>
  ),
}

/** Empty and full: the ring stays readable at both ends. */
export const Extremes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-8">
      <Gauge {...args} value={0} label="Errors" />
      <Gauge {...args} value={100} label="Tests passing" />
    </div>
  ),
}

/** French: the status word, the value text and the number format follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: { value: 86.5, warning: 80, critical: 95, label: 'Stockage utilisé' },
}
