import type { Meta, StoryObj } from '@storybook/react-vite'

import { SankeyChart } from '@/components/ui/sankey-chart'

const nodes = [
  { id: 'search', label: 'Search' },
  { id: 'social', label: 'Social' },
  { id: 'direct', label: 'Direct' },
  { id: 'pricing', label: 'Pricing page' },
  { id: 'docs', label: 'Docs' },
  { id: 'free', label: 'Free plan' },
  { id: 'pro', label: 'Pro plan' },
  { id: 'left', label: 'Left' },
]

const links = [
  { source: 'search', target: 'pricing', value: 4200 },
  { source: 'search', target: 'docs', value: 2600 },
  { source: 'social', target: 'pricing', value: 1800 },
  { source: 'social', target: 'docs', value: 500 },
  { source: 'direct', target: 'pricing', value: 2100 },
  { source: 'direct', target: 'docs', value: 1400 },
  { source: 'pricing', target: 'free', value: 3100 },
  { source: 'pricing', target: 'pro', value: 900 },
  { source: 'pricing', target: 'left', value: 4100 },
  { source: 'docs', target: 'free', value: 2200 },
  { source: 'docs', target: 'pro', value: 300 },
  { source: 'docs', target: 'left', value: 2000 },
]

const meta = {
  title: 'Components/Charts/Sankey chart',
  component: SankeyChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Where a quantity flows from step to step: nodes in columns, bands as wide as the flow, colored by the column they leave. Hover a band for its value; screen readers get every flow as a list.',
      },
    },
  },
  args: {
    nodes,
    links,
    height: 340,
    'aria-label': 'Visitors from source to page to plan, October',
  },
  argTypes: {
    height: { control: { type: 'number', min: 200, max: 600 } },
    nodes: { control: 'object' },
    links: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-3xl">
      <SankeyChart {...args} />
    </div>
  ),
} satisfies Meta<typeof SankeyChart>
export default meta
type Story = StoryObj<typeof meta>

/** Three sources, two pages, three outcomes. */
export const Default: Story = {}

/** Tokens from agents to the tools they call. */
export const AgentTokens: Story = {
  args: {
    nodes: [
      { id: 'support', label: 'Support agent' },
      { id: 'review', label: 'Code review agent' },
      { id: 'search', label: 'search_docs' },
      { id: 'ticket', label: 'create_ticket' },
      { id: 'diff', label: 'read_diff' },
    ],
    links: [
      { source: 'support', target: 'search', value: 182_000 },
      { source: 'support', target: 'ticket', value: 41_000 },
      { source: 'review', target: 'diff', value: 264_000 },
      { source: 'review', target: 'search', value: 38_000 },
    ],
    'aria-label': 'Tokens per agent and tool, last 7 days',
  },
}

/** No valid flows. */
export const Empty: Story = { args: { links: [] } }

/** French. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    nodes: nodes.map((n) => ({
      ...n,
      label:
        {
          search: 'Recherche',
          social: 'Réseaux',
          direct: 'Direct',
          pricing: 'Page tarifs',
          docs: 'Docs',
          free: 'Offre gratuite',
          pro: 'Offre Pro',
          left: 'Partis',
        }[n.id] ?? n.label,
    })),
    'aria-label': 'Visiteurs par source, page et offre',
  },
}

/** Narrow (a phone column). */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[350px]">
      <SankeyChart {...args} height={300} />
    </div>
  ),
}
