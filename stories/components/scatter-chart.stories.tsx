import type { Meta, StoryObj } from '@storybook/react-vite'

import { ScatterChart } from '@/components/ui/scatter-chart'

const models = [
  {
    key: 'anthropic',
    label: 'Anthropic',
    points: [
      { name: 'Claude Opus', x: 2400, y: 15, size: 92 },
      { name: 'Claude Sonnet', x: 1300, y: 3, size: 88 },
      { name: 'Claude Haiku', x: 480, y: 0.8, size: 79 },
    ],
  },
  {
    key: 'openai',
    label: 'OpenAI',
    points: [
      { name: 'GPT large', x: 1900, y: 10, size: 86 },
      { name: 'GPT mini', x: 520, y: 0.15, size: 70 },
    ],
  },
  {
    key: 'google',
    label: 'Google',
    points: [
      { name: 'Gemini Pro', x: 1700, y: 3.5, size: 84 },
      { name: 'Gemini Flash', x: 390, y: 0.3, size: 74 },
    ],
  },
]

const services = Array.from({ length: 24 }, (_, i) => ({
  name: `svc-${String(i + 1).padStart(2, '0')}`,
  x: 40 + ((i * 37) % 260),
  y: Math.round((0.2 + ((i * 13) % 40) / 10 + (i % 5 === 0 ? 2 : 0)) * 10) / 10,
}))

const meta = {
  title: 'Components/Charts/Scatter chart',
  component: ScatterChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'How two measures relate across many items: one dot per item, up to three groups by color, and an optional third measure as the dot size (bubbles). Hover a dot for its name and values; screen readers get every point in a table.',
      },
    },
  },
  args: {
    groups: [{ key: 'services', label: 'Services', points: services }],
    xLabel: 'p95 latency (ms)',
    yLabel: 'Error rate (%)',
    height: 320,
    'aria-label': 'Services: error rate against p95 latency',
  },
  argTypes: {
    height: { control: { type: 'number', min: 200, max: 600 } },
    groups: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <ScatterChart {...args} />
    </div>
  ),
} satisfies Meta<typeof ScatterChart>
export default meta
type Story = StoryObj<typeof meta>

/** One group of 24 services. */
export const Default: Story = {}

/** Three groups with a third measure as size: models by latency, price and score. */
export const Bubbles: Story = {
  args: {
    groups: models,
    xLabel: 'Latency (ms)',
    yLabel: 'Price ($ / 1M output tokens)',
    sizeLabel: 'Eval score',
    formatY: (v: number) => `$${v}`,
    'aria-label': 'Models: price against latency, sized by eval score',
  },
}

/** French: axis numbers follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    xLabel: 'Latence p95 (ms)',
    yLabel: 'Taux d’erreur (%)',
    'aria-label': 'Services : taux d’erreur selon la latence',
  },
}

/** Narrow (a phone column). */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[340px]">
      <ScatterChart {...args} height={260} />
    </div>
  ),
}
