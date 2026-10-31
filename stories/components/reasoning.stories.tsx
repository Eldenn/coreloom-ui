import type { Meta, StoryObj } from '@storybook/react-vite'

import { Reasoning } from '@/components/ui/reasoning'

const meta = {
  title: 'Components/AI/Reasoning',
  component: Reasoning,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A model\'s thinking, folded under one line: "Thinking…" while it streams (open), then "Thought for 6 s" (closed). Takes a reasoning part\'s text and state.',
      },
    },
  },
  args: {
    text: 'Checked the logs: a type error in settings.tsx. The fix is a rename; no rollback needed.',
    duration: 6,
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof Reasoning>
export default meta
type Story = StoryObj<typeof meta>

/** Done thinking: folded, with how long it took. */
export const Done: Story = {}

/** Still thinking: open, so people can follow. */
export const Thinking: Story = {
  args: {
    streaming: true,
    duration: undefined,
    text: 'The user wants to know why the build failed. Check the latest failed deployment first, then its logs.',
  },
}

/** Open from the start. */
export const Open: Story = {
  args: { defaultOpen: true },
}
