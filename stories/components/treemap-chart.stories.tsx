import type { Meta, StoryObj } from '@storybook/react-vite'

import { TreemapChart } from '@/components/ui/treemap-chart'

const storage = [
  { name: 'coreloom-web', value: 412, group: 'apps' },
  { name: 'coreloom-api', value: 288, group: 'apps' },
  { name: 'docs', value: 64, group: 'apps' },
  { name: 'analytics-warehouse', value: 640, group: 'data' },
  { name: 'event-archive', value: 355, group: 'data' },
  { name: 'ml-features', value: 190, group: 'data' },
  { name: 'backups-daily', value: 520, group: 'backups' },
  { name: 'backups-weekly', value: 260, group: 'backups' },
  { name: 'ci-cache', value: 140, group: 'build' },
  { name: 'artifacts', value: 96, group: 'build' },
  { name: 'logs', value: 48, group: 'build' },
  { name: 'tmp', value: 12, group: 'build' },
]

const meta = {
  title: 'Components/Charts/Treemap chart',
  component: TreemapChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Many parts of a whole as tiles sized by value, colored by group (up to five). Names and values are written in tiles big enough to hold them; the tooltip and a hidden list give every item with its share.',
      },
    },
  },
  args: {
    data: storage,
    groups: [
      { key: 'apps', label: 'Apps' },
      { key: 'data', label: 'Data' },
      { key: 'backups', label: 'Backups' },
      { key: 'build', label: 'Build' },
    ],
    height: 340,
    formatValue: (v: number) => `${v} GB`,
    'aria-label': 'Storage by bucket, in GB',
  },
  argTypes: {
    height: { control: { type: 'number', min: 200, max: 600 } },
    data: { control: 'object' },
    groups: { control: 'object' },
  },
  render: (args) => (
    <div className="max-w-3xl">
      <TreemapChart {...args} />
    </div>
  ),
} satisfies Meta<typeof TreemapChart>
export default meta
type Story = StoryObj<typeof meta>

/** Buckets in four groups. Hover a tile for its share. */
export const Default: Story = {}

/** No groups: every tile in `chart-1`. */
export const Ungrouped: Story = { args: { groups: [], 'aria-label': 'Storage by bucket' } }

/** Nothing to show. */
export const Empty: Story = { args: { data: [] } }

/** French. */
export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    groups: [
      { key: 'apps', label: 'Applications' },
      { key: 'data', label: 'Données' },
      { key: 'backups', label: 'Sauvegardes' },
      { key: 'build', label: 'Build' },
    ],
    formatValue: (v: number) => `${v} Go`,
    'aria-label': 'Stockage par bucket, en Go',
  },
}

/** Narrow: small tiles keep only their color. */
export const Narrow: Story = {
  render: (args) => (
    <div className="w-[340px]">
      <TreemapChart {...args} height={300} />
    </div>
  ),
}
