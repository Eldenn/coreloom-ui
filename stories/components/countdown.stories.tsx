import type { Meta, StoryObj } from '@storybook/react-vite'

import { Countdown } from '@/components/ui/countdown'

const meta = {
  title: 'Components/Data display/Countdown',
  component: Countdown,
  tags: ['autodocs'],
  args: { to: 0 },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The time left until `to`. The consumer provides `to` and optionally a `variant` (`clock`, `boxes`, `text`), `days` (`auto`, `always`, `never`), `onComplete`, `completed` (shown at zero) and a fixed `now`. `splitDuration` is exported.',
      },
    },
  },
} satisfies Meta<typeof Countdown>
export default meta
type Story = StoryObj<typeof meta>

// Relative to the page's clock (frozen in tests), so the stories always count down.
const start = Date.now()
const launch = start + ((2 * 24 + 5) * 3600 + 14 * 60 + 7) * 1000
const soon = start + (14 * 60 + 32) * 1000

export const Default: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 text-[14px] text-fg-secondary">
      <div className="flex flex-col gap-2">
        <span>Launch in</span>
        <Countdown to={launch} variant="boxes" />
      </div>
      <p className="m-0">
        Offer ends in <Countdown to={launch} className="font-medium" />
      </p>
      <p className="m-0">
        Session expires in <Countdown to={soon} variant="text" className="font-medium" />
      </p>
      <p className="m-0">
        Webinar:{' '}
        <Countdown
          to={start - 1000}
          completed={<span className="font-medium text-success">Live now</span>}
        />
      </p>
    </div>
  ),
}
