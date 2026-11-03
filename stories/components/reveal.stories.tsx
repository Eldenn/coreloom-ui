import type { Meta, StoryObj } from '@storybook/react-vite'

import { Reveal, type RevealEffect, Stagger } from '@/components/ui/reveal'

const EFFECTS: RevealEffect[] = ['fade', 'up', 'down', 'left', 'right', 'scale', 'blur']

const meta = {
  title: 'Components/Motion/Reveal',
  component: Reveal,
  tags: ['autodocs'],
  args: { effect: 'up', delay: 0 },
  argTypes: { effect: { control: 'inline-radio', options: EFFECTS } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Content that arrives as it scrolls into view, once. The consumer provides the content and optionally an `effect` (`fade`, `up`, `down`, `left`, `right`, `scale`, `blur`), a `delay` in ms, and `once` / `threshold` / `rootMargin` for the observer. `Stagger` reveals its children one after the other (`step` ms apart). `useInView` and `useReducedMotion` are exported.',
      },
    },
  },
} satisfies Meta<typeof Reveal>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Reveal {...args} className="max-w-md rounded-xl border border-border bg-card p-6">
      <p className="m-0 font-display text-[20px] font-semibold">Deploys in seconds</p>
      <p className="m-0 mt-2 text-[14px] text-muted-foreground">
        Push to main and the preview is live before the review starts.
      </p>
    </Reveal>
  ),
}

/** Every effect, each one a little later than the one before. */
export const Effects: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {EFFECTS.map((effect, i) => (
        <Reveal
          key={effect}
          effect={effect}
          delay={i * 80}
          className="flex h-20 items-center justify-center rounded-lg border border-border bg-card font-mono text-[12px] text-muted-foreground"
        >
          {effect}
        </Reveal>
      ))}
    </div>
  ),
}

const features = [
  ['Previews', 'A URL for every branch.'],
  ['Rollbacks', 'One click back to any deploy.'],
  ['Logs', 'Search the last 30 days.'],
  ['Alerts', 'Slack, email or a webhook.'],
  ['Teams', 'Roles per project.'],
  ['Audit', 'Who changed what, and when.'],
] as const

/** A grid whose cards arrive one after the other. */
export const StaggeredGrid: Story = {
  render: () => (
    <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-3" step={80}>
      {features.map(([title, text]) => (
        <div key={title} className="h-full rounded-xl border border-border bg-card p-4">
          <p className="m-0 text-[14px] font-medium">{title}</p>
          <p className="m-0 mt-1 text-[13px] text-muted-foreground">{text}</p>
        </div>
      ))}
    </Stagger>
  ),
}
