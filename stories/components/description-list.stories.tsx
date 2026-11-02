import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '@/components/ui/badge'
import { DescriptionItem, DescriptionList } from '@/components/ui/description-list'
import { StatusIndicator } from '@/components/ui/status-indicator'

const meta = {
  title: 'Components/Data display/Description list',
  component: DescriptionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Labels and their values. The consumer provides `items` (`{ term, value?, copy?, hint?, wide? }`) or `DescriptionItem` children, and a `layout`: `stacked`, `inline` or `grid` (with `columns`). An empty value says "Not set"; `copy` adds a Copy button.',
      },
    },
  },
} satisfies Meta<typeof DescriptionList>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DescriptionList
      className="max-w-2xl"
      layout="inline"
      items={[
        { term: 'Customer', value: 'Atelier Martin' },
        { term: 'Email', value: 'billing@atelier-martin.fr', copy: 'billing@atelier-martin.fr' },
        {
          term: 'Plan',
          value: (
            <span className="inline-flex items-center gap-2">
              Team <Badge variant="outline">Annual</Badge>
            </span>
          ),
          hint: 'Renews on Jan 12, 2027.',
        },
        {
          term: 'Workspace ID',
          value: <code className="font-mono text-[13px]">ws_8f2kq91x</code>,
          copy: 'ws_8f2kq91x',
        },
        { term: 'VAT number', value: '' },
      ]}
    />
  ),
}

export const Grid: Story = {
  render: () => (
    <DescriptionList className="max-w-3xl" layout="grid" columns={3}>
      <DescriptionItem term="Status">
        <StatusIndicator tone="success">Running</StatusIndicator>
      </DescriptionItem>
      <DescriptionItem term="Region">eu-west-3 (Paris)</DescriptionItem>
      <DescriptionItem term="Instances">3 of 5</DescriptionItem>
      <DescriptionItem term="Created">Oct 2, 2026</DescriptionItem>
      <DescriptionItem term="Last deploy">Oct 14, 2026 · 09:52</DescriptionItem>
      <DescriptionItem term="Owner" />
      <DescriptionItem term="Description" wide>
        Public API for the mobile apps. Scales between 3 and 5 instances on CPU; health checks on
        /health every 10 seconds.
      </DescriptionItem>
    </DescriptionList>
  ),
}
