import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { fireConfetti } from '@/components/ui/confetti'
import { PageProgress } from '@/components/ui/page-progress'
import { Ping, PingDot } from '@/components/ui/ping'
import { TypingIndicator } from '@/components/ui/typing-indicator'

const meta = {
  title: 'Components/Motion/Signals',
  component: Ping,
  tags: ['autodocs'],
  args: { label: 'New', tone: 'primary', active: true },
  argTypes: {
    tone: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'destructive'] },
    position: {
      control: 'inline-radio',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Signals that something happened or is happening. `Ping` puts a pulsing dot on any element (`tone`, `active`, `label`, `position`); `PingDot` is the dot alone. `fireConfetti(origin?, { count, spread, duration })` bursts confetti from an element or a point. `PageProgress` shows a bar at the top while `loading`. `TypingIndicator` shows three bobbing dots (`name`, `label`, `bubble`).',
      },
    },
  },
} satisfies Meta<typeof Ping>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Ping {...args}>
      <Button variant="outline">Automations</Button>
    </Ping>
  ),
}

/** On an icon button, an avatar, and alone next to a word. */
export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Ping label="3 unread" tone="destructive">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <BellIcon />
        </Button>
      </Ping>
      <Ping label="Online" tone="success" position="bottom-right">
        <Avatar>
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
      </Ping>
      <span className="inline-flex items-center gap-2 text-[14px]">
        <PingDot tone="destructive" />
        Live
      </span>
      <span className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
        <PingDot active={false} tone="warning" />
        Paused
      </span>
    </div>
  ),
}

/** Click to celebrate (nothing happens with reduced motion). */
export const Confetti: Story = {
  render: () => (
    <Button
      onClick={(event) => {
        void fireConfetti(event.currentTarget)
      }}
    >
      Finish onboarding
    </Button>
  ),
}

/** Start and finish a page load. */
export const PageLoad: Story = {
  render: function Render() {
    const [loading, setLoading] = React.useState(false)
    return (
      <div className="flex gap-2">
        <PageProgress loading={loading} />
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => {
            setLoading(true)
          }}
        >
          Start loading
        </Button>
        <Button
          variant="outline"
          disabled={!loading}
          onClick={() => {
            setLoading(false)
          }}
        >
          Finish
        </Button>
      </div>
    )
  },
}

/** The bar while a page loads. */
export const PageLoading: Story = {
  render: () => (
    <div data-frozen>
      <PageProgress loading />
      <p className="m-0 text-[14px] text-muted-foreground">The bar runs along the top.</p>
    </div>
  ),
}

/** In a chat, in a bubble and alone. */
export const Typing: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4 text-[13px] text-muted-foreground">
      <TypingIndicator name="Lena" />
      <span className="inline-flex items-center gap-2">
        <TypingIndicator bubble={false} name="Omar" />
        Omar is typing
      </span>
    </div>
  ),
}

export const French: Story = {
  ...Typing,
  globals: { locale: 'fr' },
}
