import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Components/Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: { tone: 'info', children: 'Scheduled maintenance on Sunday from 02:00 to 04:00 (CET).' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A message across the top of a page or app. The consumer provides the message as `children`, a `tone`, and optionally a `title`, an `action`, `onDismiss` (shows a close button; remember the dismissal yourself), `icon` and `floating`.',
      },
    },
  },
} satisfies Meta<typeof Banner>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [shown, setShown] = React.useState(true)
    return (
      <div className="flex flex-col">
        {shown ? (
          <Banner
            tone="info"
            title="Maintenance"
            onDismiss={() => {
              setShown(false)
            }}
          >
            Scheduled on Sunday from 02:00 to 04:00 (CET). Exports will be paused.
          </Banner>
        ) : null}
        <Banner
          tone="warning"
          action={
            <Button size="sm" variant="outline">
              Update card
            </Button>
          }
        >
          Your last payment failed. Update your card before Oct 20 to keep your workspace.
        </Banner>
        <Banner tone="danger" title="Outage">
          Webhooks are delayed. We’re on it.
        </Banner>
        <Banner tone="success">Your data export is ready.</Banner>
        <Banner
          tone="primary"
          action={
            <Button size="sm" variant="ghost">
              See what’s new
            </Button>
          }
        >
          Agents can now call your own tools.
        </Banner>
        <Banner tone="neutral">You’re viewing this workspace as a guest.</Banner>
        <p className="m-0 p-6 text-[14px] text-muted-foreground">
          {shown ? 'Page content.' : 'Page content. The maintenance banner was dismissed.'}
        </p>
      </div>
    )
  },
}

export const Floating: Story = {
  render: () => (
    <div className="max-w-2xl p-6">
      <Banner
        floating
        tone="primary"
        title="Trial"
        action={<Button size="sm">Upgrade</Button>}
        onDismiss={() => undefined}
      >
        12 days left in your trial.
      </Banner>
    </div>
  ),
}
