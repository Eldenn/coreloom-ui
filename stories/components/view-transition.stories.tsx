import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { useViewTransition, type ViewTransitionEffect } from '@/components/ui/view-transition'

const steps = [
  ['Create a project', 'Name it and pick the region closest to your users.'],
  ['Connect a repository', 'Every push to main deploys; every branch gets a preview.'],
  ['Invite the team', 'Add people by email and choose what each one can change.'],
] as const

function Wizard({ effect }: { effect: 'slide' | 'fade' | 'scale' }) {
  const transition = useViewTransition()
  const [step, setStep] = React.useState(0)
  const [title, text] = steps[step] ?? steps[0]
  const go = (next: number) => {
    const forward: ViewTransitionEffect = effect === 'slide' ? 'slide' : effect
    const back: ViewTransitionEffect = effect === 'slide' ? 'slide-back' : effect
    void transition(
      () => {
        setStep(next)
      },
      { effect: next > step ? forward : back },
    )
  }
  return (
    <div className="flex max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Step {step + 1} of {steps.length}
      </p>
      <div className="min-h-20" aria-live="polite">
        <p className="m-0 text-[18px] font-medium">{title}</p>
        <p className="m-0 mt-1 text-[14px] text-muted-foreground">{text}</p>
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => {
            go(step - 1)
          }}
        >
          Back
        </Button>
        <Button
          disabled={step === steps.length - 1}
          onClick={() => {
            go(step + 1)
          }}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Motion/View transition',
  component: Wizard,
  tags: ['autodocs'],
  args: { effect: 'slide' },
  argTypes: { effect: { control: 'inline-radio', options: ['slide', 'fade', 'scale'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`useViewTransition()` returns a function: call it with the state update that changes the view and an `effect` (`fade`, `slide`, `slide-back`, `scale`). It uses the browser’s View Transitions API, and simply runs the update where that is missing or with reduced motion. `startViewTransition` is the same outside React.',
      },
    },
  },
} satisfies Meta<typeof Wizard>
export default meta
type Story = StoryObj<typeof meta>

/** A three-step wizard that slides forward and back. */
export const Default: Story = {}

export const Fade: Story = { args: { effect: 'fade' } }
