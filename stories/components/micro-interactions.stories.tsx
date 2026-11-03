import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckIcon, CopyIcon, PauseIcon, PlayIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { AnimatedHeight } from '@/components/ui/animated-height'
import { DrawIcon, MenuToggleIcon, MorphIcon } from '@/components/ui/animated-icon'
import { AnimatedList } from '@/components/ui/animated-list'
import { Button } from '@/components/ui/button'
import { type ActionStatus, StatusButton } from '@/components/ui/status-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsIndicator } from '@/components/ui/tabs-indicator'

const meta = {
  title: 'Components/Motion/Micro-interactions',
  component: StatusButton,
  tags: ['autodocs'],
  args: { status: 'idle', children: 'Save changes' },
  argTypes: {
    status: { control: 'inline-radio', options: ['idle', 'loading', 'success', 'error'] },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Small motions inside app screens. `StatusButton` takes a `status` (`idle`, `loading`, `success`, `error`) and optional `loadingLabel`, `successLabel`, `errorLabel`. `DrawIcon` (`icon`, `duration`, `delay`, `label`), `MorphIcon` (`active`, `from`, `to`) and `MenuToggleIcon` (`open`) are animated icons. `AnimatedList` animates keyed children in and out; `TabsIndicator` slides under the active tab; `AnimatedHeight` follows its content’s height.',
      },
    },
  },
} satisfies Meta<typeof StatusButton>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every state side by side. */
export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3" data-frozen>
      <StatusButton>Save changes</StatusButton>
      <StatusButton status="loading" loadingLabel="Saving…">
        Save changes
      </StatusButton>
      <StatusButton status="success" successLabel="Saved">
        Save changes
      </StatusButton>
      <StatusButton status="error" variant="outline">
        Save changes
      </StatusButton>
    </div>
  ),
}

/** Click it: it saves for a second, then fails every other time. */
export const Interactive: Story = {
  render: function Render() {
    const [status, setStatus] = React.useState<ActionStatus>('idle')
    const [fail, setFail] = React.useState(false)
    return (
      <StatusButton
        status={status}
        loadingLabel="Saving…"
        successLabel="Saved"
        onClick={() => {
          setStatus('loading')
          setTimeout(() => {
            setStatus(fail ? 'error' : 'success')
            setFail(!fail)
            setTimeout(() => {
              setStatus('idle')
            }, 1600)
          }, 900)
        }}
      >
        Save changes
      </StatusButton>
    )
  },
}

/** Icons that draw themselves. */
export const DrawnIcons: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <DrawIcon icon="check" label="Saved" className="size-8 text-success" />
      <DrawIcon icon="circle-check" className="size-8 text-success" />
      <DrawIcon icon="cross" className="size-8 text-destructive" />
      <DrawIcon icon="arrow" className="size-8 text-primary-text" />
    </div>
  ),
}

/** Icons that turn into others: click them. */
export const MorphingIcons: Story = {
  render: function Render() {
    const [copied, setCopied] = React.useState(false)
    const [playing, setPlaying] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={copied ? 'Copied' : 'Copy'}
          onClick={() => {
            setCopied(!copied)
          }}
        >
          <MorphIcon active={copied} from={<CopyIcon />} to={<CheckIcon />} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => {
            setPlaying(!playing)
          }}
        >
          <MorphIcon active={playing} from={<PlayIcon />} to={<PauseIcon />} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open)
          }}
        >
          <MenuToggleIcon open={open} />
        </Button>
      </div>
    )
  },
}

const initialTasks = [
  { id: 1, title: 'Review the pricing page' },
  { id: 2, title: 'Ship the motion tokens' },
  { id: 3, title: 'Write the release notes' },
]

/** Add and remove items: they slide open and fold away. */
export const List: Story = {
  render: function Render() {
    const [tasks, setTasks] = React.useState(initialTasks)
    const [next, setNext] = React.useState(4)
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setTasks([{ id: next, title: `New task ${next}` }, ...tasks])
            setNext(next + 1)
          }}
        >
          Add a task
        </Button>
        <AnimatedList className="flex flex-col" itemClassName="pb-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-[14px]"
            >
              {task.title}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${task.title}`}
                onClick={() => {
                  setTasks(tasks.filter((t) => t.id !== task.id))
                }}
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </AnimatedList>
      </div>
    )
  },
}

/** The highlight slides from tab to tab, in both variants. */
export const SlidingTabs: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsIndicator />
        </TabsList>
        <TabsContent value="overview">Traffic and errors for the last 24 hours.</TabsContent>
        <TabsContent value="deployments">Every deploy, newest first.</TabsContent>
        <TabsContent value="settings">Domains, environment, members.</TabsContent>
      </Tabs>
      <Tabs defaultValue="code">
        <TabsList variant="line">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="pulls">Pull requests</TabsTrigger>
          <TabsIndicator variant="line" />
        </TabsList>
        <TabsContent value="code">The files of the main branch.</TabsContent>
        <TabsContent value="issues">12 open issues.</TabsContent>
        <TabsContent value="pulls">3 open pull requests.</TabsContent>
      </Tabs>
    </div>
  ),
}

/** A box that grows smoothly when more content appears. */
export const Height: Story = {
  render: function Render() {
    const [more, setMore] = React.useState(false)
    return (
      <div className="flex max-w-md flex-col gap-3">
        <AnimatedHeight className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-2 p-4 text-[14px] text-fg-secondary">
            <p className="m-0">Deploys run on every push to main.</p>
            {more && (
              <>
                <p className="m-0">Branches get a preview URL that lives for 30 days.</p>
                <p className="m-0">Rollbacks keep the last 50 deploys.</p>
              </>
            )}
          </div>
        </AnimatedHeight>
        <Button
          variant="outline"
          className="self-start"
          aria-expanded={more}
          onClick={() => {
            setMore(!more)
          }}
        >
          {more ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  },
}
