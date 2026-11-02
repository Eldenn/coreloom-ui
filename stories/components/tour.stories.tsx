import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, PlusIcon, SearchIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tour, type TourStep } from '@/components/ui/tour'

const steps: TourStep[] = [
  {
    title: 'Welcome to your workspace',
    content: 'Three things to know before you start. It takes thirty seconds.',
  },
  {
    target: '#tour-new',
    title: 'Start a project',
    content: 'Every piece of work lives in a project. Create one for each client or team.',
  },
  {
    target: '#tour-search',
    title: 'Find anything',
    content: 'Search projects, files and people. Press ⌘K from anywhere.',
    side: 'bottom',
    align: 'start',
  },
  {
    target: '#tour-alerts',
    title: 'Stay in the loop',
    content: 'Mentions and approvals land here. Choose what reaches you by email in Settings.',
    side: 'left',
  },
]

function Screen({ start }: { start: number }) {
  const [open, setOpen] = React.useState(true)
  const [step, setStep] = React.useState(start)
  return (
    <div className="flex min-h-[460px] flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button id="tour-new" size="sm">
          <PlusIcon />
          New project
        </Button>
        <div id="tour-search" className="relative w-64">
          <SearchIcon
            aria-hidden
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input aria-label="Search" placeholder="Search…" className="pl-9" />
        </div>
        <Button
          id="tour-alerts"
          size="icon-sm"
          variant="ghost"
          aria-label="Notifications"
          className="ml-auto"
        >
          <BellIcon />
        </Button>
      </header>
      <main className="flex flex-1 items-start p-6">
        <Button
          variant="outline"
          onClick={() => {
            setStep(0)
            setOpen(true)
          }}
        >
          Restart the tour
        </Button>
      </main>
      <Tour steps={steps} open={open} onOpenChange={setOpen} step={step} onStepChange={setStep} />
    </div>
  )
}

const meta = {
  title: 'Components/Overlays/Tour',
  component: Tour,
  tags: ['autodocs'],
  args: { steps, open: true, onOpenChange: () => undefined },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 480 },
      description: {
        component:
          'A guided tour. The consumer provides `steps` (`{ target?, title, content?, side?, align? }`, where `target` is a selector or a function returning the element), `open` + `onOpenChange`, and optionally `step` + `onStepChange` and `onFinish`.',
      },
    },
  },
} satisfies Meta<typeof Tour>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Screen start={1} />,
}

export const Centered: Story = {
  render: () => <Screen start={0} />,
}
