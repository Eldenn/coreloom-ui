import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { AgentPlan } from '@/components/ui/agent-plan'
import { Button } from '@/components/ui/button'

import { deployPlan, failedPlan, longPlan } from '../blocks/ai-agent-ui'

const meta = {
  title: 'Components/AI/Agent plan',
  component: AgentPlan,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The steps an agent works through, ticked off live. Pass the `data` of the `data-plan` part your server writes (and rewrites with the same id as the agent moves on), and `active` while the agent is working. `Chat` draws `data-plan` parts by itself.',
      },
    },
  },
  args: { plan: deployPlan(2), active: true, announce: false, defaultOpen: true },
  decorators: [(Story) => <div className="flex max-w-xl flex-col gap-2">{Story()}</div>],
} satisfies Meta<typeof AgentPlan>
export default meta
type Story = StoryObj<typeof meta>

/** Halfway: two steps done, the third running. */
export const Default: Story = {}

/** Every step done: the bar is full and nothing spins. */
export const Complete: Story = { args: { plan: deployPlan(5), active: false } }

/** A step failed: its reason shows under it; a skipped step is struck through. */
export const Failed: Story = { args: { plan: failedPlan, active: false } }

/** The agent stopped (Stop, an error) with a step still in progress: it shows as stopped. */
export const Stopped: Story = { args: { plan: deployPlan(3), active: false } }

/** Before anything starts: every step to do. */
export const NotStarted: Story = { args: { plan: deployPlan(0) } }

/** A long title, long steps and many of them: everything wraps. */
export const Long: Story = { args: { plan: longPlan } }

/** Folded: one line with the count, for plans that are already done. */
export const Folded: Story = { args: { plan: deployPlan(5), active: false, defaultOpen: false } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { plan: deployPlan(2, 'fr') },
}

/** Try it: Start runs the plan a step at a time; with `announce`, each step is read out. */
export const Live: Story = {
  args: { announce: true },
  render: function LivePlan(args) {
    const [done, setDone] = React.useState<number>()
    React.useEffect(() => {
      if (done === undefined || done >= 5) return
      const timer = setTimeout(() => {
        setDone(done + 1)
      }, 900)
      return () => {
        clearTimeout(timer)
      }
    }, [done])
    return (
      <>
        <AgentPlan {...args} plan={deployPlan(done ?? 0)} active={done !== undefined && done < 5} />
        <Button
          size="sm"
          variant="outline"
          className="self-start"
          onClick={() => {
            setDone(0)
          }}
        >
          {done === undefined ? 'Start' : 'Start again'}
        </Button>
      </>
    )
  },
}
