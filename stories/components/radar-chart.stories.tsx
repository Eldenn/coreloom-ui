import type { Meta, StoryObj } from '@storybook/react-vite'

import { RadarChart } from '@/components/ui/radar-chart'

const evals = [
  { metric: 'Coding', sonnet: 92, haiku: 78, mini: 70 },
  { metric: 'Reasoning', sonnet: 88, haiku: 72, mini: 66 },
  { metric: 'Writing', sonnet: 90, haiku: 81, mini: 74 },
  { metric: 'Tool use', sonnet: 94, haiku: 83, mini: 61 },
  { metric: 'Speed', sonnet: 64, haiku: 95, mini: 90 },
  { metric: 'Cost', sonnet: 55, haiku: 88, mini: 96 },
]

const meta = {
  title: 'Components/Charts/Radar chart',
  component: RadarChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two or three things compared on the same handful of measures: one axis per measure around a circle, one outline per series. Screen readers get the same numbers as a table.',
      },
    },
  },
  args: {
    data: evals,
    angleKey: 'metric',
    series: [
      { key: 'sonnet', label: 'Claude Sonnet' },
      { key: 'haiku', label: 'Claude Haiku' },
    ],
    max: 100,
    height: 320,
    'aria-label': 'Two models on six evals, score out of 100',
  },
  argTypes: {
    height: { control: { type: 'number', min: 200, max: 600 } },
    max: { control: 'number' },
    data: { control: 'object' },
    series: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-xl">
      <RadarChart {...args} />
    </div>
  ),
} satisfies Meta<typeof RadarChart<(typeof evals)[number]>>
export default meta
type Story = StoryObj<typeof meta>

/** Two models on six evals. */
export const Default: Story = {}

/** Three series: the most a radar can hold readably. */
export const ThreeSeries: Story = {
  args: {
    series: [
      { key: 'sonnet', label: 'Claude Sonnet' },
      { key: 'haiku', label: 'Claude Haiku' },
      { key: 'mini', label: 'GPT mini' },
    ],
    'aria-label': 'Three models on six evals, score out of 100',
  },
}

/** One series: a profile, no legend. */
export const Single: Story = {
  args: {
    series: [{ key: 'sonnet', label: 'Claude Sonnet' }],
    'aria-label': 'Claude Sonnet on six evals',
  },
}

/** French: numbers follow the locale. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    data: evals.map((e, i) => ({
      ...e,
      metric: ['Code', 'Raisonnement', 'Rédaction', 'Outils', 'Vitesse', 'Coût'][i],
    })),
    'aria-label': 'Deux modèles sur six évaluations',
  },
}

/** Narrow (a phone column). */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <RadarChart {...args} height={280} />
    </div>
  ),
}
