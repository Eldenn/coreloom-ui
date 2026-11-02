import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusIndicator } from '@/components/ui/status-indicator'

const meta = {
  title: 'Components/Data display/Status indicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  args: { tone: 'success', children: 'Operational' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A coloured dot and the word for it. The consumer provides the status as `children`, a `tone` (`neutral`, `primary`, `success`, `warning`, `danger`, `info`), and optionally `pulse` and `variant` (`plain` or `pill`). `StatusDot` is the dot alone, beside a label you already have.',
      },
    },
  },
} satisfies Meta<typeof StatusIndicator>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="grid max-w-xl grid-cols-2 gap-x-10 gap-y-3">
      <StatusIndicator tone="success">Operational</StatusIndicator>
      <StatusIndicator tone="success" variant="pill">
        Operational
      </StatusIndicator>
      <StatusIndicator tone="info" pulse>
        Deploying
      </StatusIndicator>
      <StatusIndicator tone="info" variant="pill">
        Deploying
      </StatusIndicator>
      <StatusIndicator tone="warning">Degraded performance</StatusIndicator>
      <StatusIndicator tone="warning" variant="pill">
        Degraded
      </StatusIndicator>
      <StatusIndicator tone="danger">Outage</StatusIndicator>
      <StatusIndicator tone="danger" variant="pill">
        Outage
      </StatusIndicator>
      <StatusIndicator tone="primary">Beta</StatusIndicator>
      <StatusIndicator tone="primary" variant="pill">
        Beta
      </StatusIndicator>
      <StatusIndicator>Paused</StatusIndicator>
      <StatusIndicator variant="pill">Paused</StatusIndicator>
    </div>
  ),
}
