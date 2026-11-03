import type { Meta, StoryObj } from '@storybook/react-vite'

import { AnimatedBackground } from '@/components/ui/animated-background'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/ui/reveal'
import { Parallax, ScrollProgress } from '@/components/ui/scroll-effects'
import { ScrambleText } from '@/components/ui/text-effects'
import { TiltCard } from '@/components/ui/tilt-card'

const meta = {
  title: 'Components/Motion/Showcase effects',
  component: AnimatedBackground,
  tags: ['autodocs'],
  args: { variant: 'grid', size: 32, animate: true, fade: true },
  argTypes: { variant: { control: 'inline-radio', options: ['grid', 'dots', 'aurora'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Effects for marketing pages. `AnimatedBackground` (`variant` grid, dots or aurora, `size`, `duration`, `animate`, `fade`) fills its `relative` parent. `TiltCard` (`max`, `glare`) tilts toward the pointer. `ScrollProgress` and `Parallax` (`distance`) follow the scroll with CSS scroll-driven animations. `ScrambleText` (`text`, `duration`, `trigger`) decodes a word. `Reveal` takes `wipe-*` and `circle` effects for images.',
      },
    },
  },
} satisfies Meta<typeof AnimatedBackground>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <section className="relative isolate flex h-64 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-background">
      <AnimatedBackground {...args} />
      <p className="m-0 font-display text-[32px] font-semibold">Build on solid ground</p>
      <p className="m-0 text-[14px] text-muted-foreground">A quiet backdrop for a hero.</p>
    </section>
  ),
}

/** The three backgrounds. */
export const Backgrounds: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {(['grid', 'dots', 'aurora'] as const).map((variant) => (
        <div
          key={variant}
          className="relative isolate flex h-40 items-center justify-center overflow-hidden rounded-xl border border-border bg-background font-mono text-[12px] text-muted-foreground"
        >
          <AnimatedBackground variant={variant} size={variant === 'dots' ? 16 : 28} />
          {variant}
        </div>
      ))}
    </div>
  ),
}

/** Move the pointer over the card. */
export const Tilt: Story = {
  render: () => (
    <TiltCard className="flex max-w-xs flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <Badge className="self-start">New</Badge>
      <p className="m-0 font-display text-[22px] font-semibold">Agent teams</p>
      <p className="m-0 text-[14px] text-muted-foreground">
        Several agents, one plan, a single place to watch them work.
      </p>
    </TiltCard>
  ),
}

/** Decodes as it appears (animated: not in the visual tests). */
export const Scramble: Story = {
  tags: ['no-test'],
  render: () => (
    <p className="m-0 font-mono text-[28px] font-semibold">
      <ScrambleText text="ACCESS GRANTED" trigger="mount" duration={1200} />
    </p>
  ),
}

/** The same, settled. */
export const ScrambleSettled: Story = {
  render: () => (
    <p className="m-0 font-mono text-[28px] font-semibold">
      <ScrambleText text="ACCESS GRANTED" trigger="mount" duration={0} />
    </p>
  ),
}

/** Images uncovered by a mask as they come into view. */
export const ImageReveal: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {(['wipe-up', 'wipe-right', 'circle'] as const).map((effect, i) => (
        <Reveal
          key={effect}
          effect={effect}
          delay={i * 120}
          className="flex aspect-video items-end overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-chart-2))] p-3"
        >
          <span className="rounded bg-background px-2 py-0.5 font-mono text-[11px]">{effect}</span>
        </Reveal>
      ))}
    </div>
  ),
}

/** Scroll the page: the bar at the top fills, the shapes drift at their own pace. */
export const Scroll: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <ScrollProgress />
      {[1, 2, 3, 4].map((n) => (
        <section
          key={n}
          className="relative flex h-64 items-center overflow-hidden rounded-xl border border-border bg-card px-6"
        >
          <Parallax
            distance={n % 2 ? 50 : -50}
            className="absolute top-1/2 right-10 size-24 -translate-y-1/2 rounded-full bg-primary-subtle"
          />
          <p className="relative m-0 font-display text-[22px] font-semibold">Section {n}</p>
        </section>
      ))}
    </div>
  ),
}
