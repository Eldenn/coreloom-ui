import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuotaBar } from '@/components/ui/quota-bar'

const meta = {
  title: 'Components/Data display/Quota bar',
  component: QuotaBar,
  tags: ['autodocs'],
  args: { label: 'Storage', max: 10e9 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'How much of a limit is used. The consumer provides a `label`, the `max`, and `segments` (`{ label, value, className? }`) or a single `value`. Optional: `format` and its options (as FormatNumber), `warnAt` (0.8) and `dangerAt` (0.95), `legend`, and a `description`.',
      },
    },
  },
} satisfies Meta<typeof QuotaBar>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <QuotaBar
        label="Storage"
        max={10e9}
        format="bytes"
        segments={[
          { label: 'Documents', value: 3.1e9 },
          { label: 'Images', value: 2.4e9 },
          { label: 'Videos', value: 1.2e9 },
          { label: 'Other', value: 0.5e9 },
        ]}
        description="Resets never: delete files or upgrade for more space."
      />
      <QuotaBar
        label="AI credits"
        max={5000}
        format="integer"
        segments={[
          { label: 'Chat', value: 3120 },
          { label: 'Summaries', value: 980 },
          { label: 'Images', value: 260 },
        ]}
        description="Resets on Nov 1."
      />
    </div>
  ),
}

export const Levels: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <QuotaBar label="Seats" value={12} max={25} format="integer" />
      <QuotaBar label="API calls this month" value={84_200} max={100_000} format="compact" />
      <QuotaBar label="Projects" value={49} max={50} format="integer" />
    </div>
  ),
}
