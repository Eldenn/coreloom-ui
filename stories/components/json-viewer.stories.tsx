import type { Meta, StoryObj } from '@storybook/react-vite'

import { JsonViewer } from '@/components/ui/json-viewer'

const response = {
  id: 'evt_01J9ZK4',
  type: 'invoice.paid',
  created: '2026-10-14T08:02:11Z',
  livemode: false,
  data: {
    invoice: 'in_7781',
    amount: 4900,
    currency: 'eur',
    customer: { id: 'cus_204', name: 'Atelier Martin', email: 'billing@atelier-martin.fr' },
    lines: [
      { description: 'Team plan, October', quantity: 5, amount: 4500 },
      { description: 'Extra storage', quantity: 1, amount: 400 },
    ],
    discount: null,
    tags: [],
  },
}

const meta = {
  title: 'Components/Data display/JSON viewer',
  component: JsonViewer,
  tags: ['autodocs'],
  args: { value: response, rootLabel: 'webhook.json' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'JSON to explore. The consumer provides `value` (parsed JSON), and optionally `rootLabel`, `defaultExpandDepth` (1 by default), `sortKeys` and `maxHeight`.',
      },
    },
  },
} satisfies Meta<typeof JsonViewer>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <JsonViewer
      className="max-w-xl"
      value={response}
      rootLabel="webhook.json"
      defaultExpandDepth={2}
    />
  ),
}

export const Collapsed: Story = {
  render: () => (
    <JsonViewer
      className="max-w-xl"
      value={response}
      rootLabel="webhook.json"
      defaultExpandDepth={1}
    />
  ),
}
