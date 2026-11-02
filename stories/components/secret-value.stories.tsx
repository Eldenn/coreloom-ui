import type { Meta, StoryObj } from '@storybook/react-vite'

import { SecretValue } from '@/components/ui/secret-value'

const meta = {
  title: 'Components/Data display/Secret value',
  component: SecretValue,
  tags: ['autodocs'],
  args: { value: 'cl_live_demo0000example0000c9f2', label: 'API key' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A secret shown as dots, with Show and Copy. The consumer provides the `value` and a `label` (what it is, for the buttons). Optional: `visibleStart` and `visibleEnd` characters in clear, `copy`, `revealed` / `onRevealedChange`, and `onReveal` for an audit log. `maskSecret` is exported.',
      },
    },
  },
} satisfies Meta<typeof SecretValue>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <SecretValue value="cl_live_demo0000example0000c9f2" visibleStart={8} label="API key" />
      <SecretValue value="hook_demo0000example0000a1b2" label="signing secret" />
      <SecretValue value="pub_demo0000example" defaultRevealed label="publishable key" />
    </div>
  ),
}
