import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { AgentAvatar, type AgentAvatarState } from '@/components/ui/agent-avatar'
import { Button } from '@/components/ui/button'

const STATES: AgentAvatarState[] = [
  'idle',
  'thinking',
  'speaking',
  'listening',
  'done',
  'error',
  'offline',
]

const SHAPES = ['square', 'circle', 'hexagon', 'diamond', 'shield', 'blob'] as const

const meta = {
  title: 'Components/AI/Agent avatar',
  component: AgentAvatar,
  tags: ['autodocs'],
  args: { name: 'Researcher', seed: 'researcher', state: 'idle', variant: 'face', size: 'lg' },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    variant: { control: 'inline-radio', options: ['face', 'dots'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: 'select',
      options: [undefined, 'primary', 'neutral', 'teal', 'violet', 'orange', 'blue', 'pink'],
    },
    eyes: { control: 'inline-radio', options: [undefined, 'round', 'tall', 'square'] },
    shape: { control: 'select', options: [undefined, ...SHAPES, 'seed'] },
    animated: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A small animated face for an AI agent. The consumer provides its `name` (said with the state to screen readers), a `state` (`idle`, `thinking`, `speaking`, `listening`, `done`, `error`, `offline`), and a `seed` (the agent’s id) for a stable colour and eyes; optionally `variant` (`face` or `dots`), `shape` (`square`, `circle`, `hexagon`, `diamond`, `shield`, `blob`, or `seed` to let the seed pick), `tone`, `eyes`, `size`, `animated` and `decorative`.',
      },
    },
  },
} satisfies Meta<typeof AgentAvatar>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Every state, in both variants. */
export const States: Story = {
  render: () => (
    <div className="grid w-fit grid-cols-[auto_repeat(7,minmax(0,1fr))] items-center gap-x-6 gap-y-4">
      <span />
      {STATES.map((s) => (
        <span key={s} className="text-center font-mono text-[11px] text-muted-foreground">
          {s}
        </span>
      ))}
      {(['face', 'dots'] as const).map((variant) => (
        <React.Fragment key={variant}>
          <span className="font-mono text-[11px] text-muted-foreground">{variant}</span>
          {STATES.map((s) => (
            <span key={s} className="flex justify-center">
              <AgentAvatar
                name="Researcher"
                seed="researcher"
                variant={variant}
                state={s}
                size="lg"
              />
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
  ),
}

/** A seed per agent: each keeps its colour and eyes wherever it appears. */
export const Team: Story = {
  render: () => {
    const agents = ['Supervisor', 'Researcher', 'Writer', 'Billing', 'Support', 'Reviewer']
    return (
      <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
        {agents.map((a) => (
          <li key={a} className="flex flex-col items-center gap-1.5">
            <AgentAvatar name={a} seed={a} size="lg" decorative />
            <span className="text-[12.5px] text-fg-secondary">{a}</span>
          </li>
        ))}
      </ul>
    )
  },
}

/** Still: `animated={false}` shows each state without moving, for long lists. */
export const Still: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {STATES.map((s) => (
        <AgentAvatar key={s} name="Writer" seed="writer" state={s} size="lg" animated={false} />
      ))}
    </div>
  ),
}

/** Six outlines, in both variants; `shape="seed"` lets each agent keep its own. */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {(['face', 'dots'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-end gap-5">
          {SHAPES.map((shape, i) => (
            <span key={shape} className="flex flex-col items-center gap-1.5">
              <AgentAvatar
                name={shape}
                seed={['researcher', 'writer', 'billing', 'support', 'reviewer', 'supervisor'][i]}
                variant={variant}
                shape={shape}
                state={variant === 'dots' ? 'thinking' : 'idle'}
                size="lg"
              />
              <span className="font-mono text-[11px] text-muted-foreground">{shape}</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Every state on a drawn outline: the halo, the flash and the colours follow the shape. */
export const ShapeStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['hexagon', 'shield', 'blob'] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap gap-3">
          {STATES.map((s) => (
            <AgentAvatar key={s} name="Writer" seed="writer" shape={shape} state={s} size="lg" />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** `shape="seed"`: the seed picks the outline too, so a team is told apart by shape as well as colour. */
export const SeededShapes: Story = {
  render: () => {
    const agents = ['Supervisor', 'Researcher', 'Writer', 'Billing', 'Support', 'Reviewer']
    return (
      <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
        {agents.map((a) => (
          <li key={a} className="flex flex-col items-center gap-1.5">
            <AgentAvatar name={a} seed={a} shape="seed" size="lg" decorative />
            <span className="text-[12.5px] text-fg-secondary">{a}</span>
          </li>
        ))}
      </ul>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['face', 'dots'] as const).map((variant) => (
        <div key={variant} className="flex items-end gap-4">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <AgentAvatar key={size} name="Writer" seed="writer" variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** `tone` overrides the seed: `primary` follows the accent, `neutral` for a quiet list. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'neutral', 'teal', 'violet', 'orange', 'blue', 'pink'] as const).map((tone) => (
        <AgentAvatar key={tone} name={tone} tone={tone} size="lg" />
      ))}
    </div>
  ),
}

/** Beside a name, a line on what it does and its state in words. */
export const InARow: Story = {
  render: () => (
    <ul className="m-0 flex max-w-sm list-none flex-col gap-3 p-0">
      {(
        [
          ['Supervisor', 'Plans the work', 'speaking'],
          ['Researcher', 'Reads the docs', 'thinking'],
          ['Writer', 'Drafts the answer', 'idle'],
          ['Billing', 'Refunds and invoices', 'error'],
        ] as const
      ).map(([name, role, state]) => (
        <li key={name} className="flex items-center gap-3">
          <AgentAvatar seed={name} state={state} decorative />
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-semibold text-foreground">{name}</span>
            <span className="text-[12px] text-muted-foreground">{role}</span>
          </span>
        </li>
      ))}
    </ul>
  ),
}

/** Click through the states: the face changes as an agent would while it works. */
export const Live: Story = {
  render: function Render() {
    const [i, setI] = React.useState(0)
    const state = STATES[i % STATES.length] ?? 'idle'
    return (
      <div className="flex items-center gap-4">
        <AgentAvatar name="Researcher" seed="researcher" state={state} size="xl" />
        <AgentAvatar name="Researcher" seed="researcher" variant="dots" state={state} size="xl" />
        <Button
          variant="outline"
          onClick={() => {
            setI((n) => n + 1)
          }}
        >
          Next state
        </Button>
      </div>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: { name: 'Rédacteur', seed: 'writer', state: 'thinking' },
}
