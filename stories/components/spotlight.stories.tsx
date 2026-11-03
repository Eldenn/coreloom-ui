import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BorderGlow, Spotlight } from '@/components/ui/spotlight'

const meta = {
  title: 'Components/Motion/Spotlight',
  component: Spotlight,
  tags: ['autodocs'],
  args: { size: 360 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two decorative effects for a card. `Spotlight` paints a soft light under the pointer (`size` in px). `BorderGlow` runs a light along the border (`duration` in seconds per round, `width` in px); put the content inside, it gets the card background. Neither takes focus or adds meaning.',
      },
    },
  },
} satisfies Meta<typeof Spotlight>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
      {['Analytics', 'Agents', 'Billing'].map((title) => (
        <Spotlight key={title} {...args} className="rounded-xl border border-border bg-card p-5">
          <p className="m-0 text-[15px] font-medium">{title}</p>
          <p className="m-0 mt-1 text-[13px] text-muted-foreground">
            Move the pointer over the card.
          </p>
        </Spotlight>
      ))}
    </div>
  ),
}

/** The plan you recommend, with a light running along its border. */
export const Glow: Story = {
  render: () => (
    <BorderGlow className="max-w-xs rounded-xl">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[15px] font-medium">Team</p>
          <Badge>Popular</Badge>
        </div>
        <p className="m-0 font-display text-[32px] font-semibold">
          $24<span className="text-[14px] font-normal text-muted-foreground"> / seat</span>
        </p>
        <Button>Start a trial</Button>
      </div>
    </BorderGlow>
  ),
}
