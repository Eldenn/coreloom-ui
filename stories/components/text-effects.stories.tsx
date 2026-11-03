import type { Meta, StoryObj } from '@storybook/react-vite'

import { GradientText, ShimmerText, Typewriter, WordReveal } from '@/components/ui/text-effects'

const meta = {
  title: 'Components/Motion/Text effects',
  component: WordReveal,
  tags: ['autodocs'],
  args: { text: 'Ship interfaces your users trust', effect: 'up', trigger: 'mount' },
  argTypes: {
    effect: { control: 'inline-radio', options: ['up', 'blur', 'fade'] },
    trigger: { control: 'inline-radio', options: ['in-view', 'mount'] },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Four text effects. `WordReveal` takes a `text` and optionally `as`, `effect` (`up`, `blur`, `fade`), `step`, `delay` and `trigger` (`in-view` or `mount`). `Typewriter` takes `text` (one phrase or several) and optionally `speed`, `eraseSpeed`, `hold`, `loop`, `caret`, `frozen` and `onDone`. `ShimmerText` (a `duration`) and `GradientText` (`animate`, `duration`) wrap any text. Screen readers get the whole text once.',
      },
    },
  },
} satisfies Meta<typeof WordReveal>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <WordReveal
      {...args}
      as="p"
      className="m-0 max-w-xl font-display text-[40px] leading-tight font-semibold tracking-tight"
    />
  ),
}

/** The blur effect, slower. */
export const WordRevealBlur: Story = {
  render: () => (
    <WordReveal
      as="p"
      trigger="mount"
      effect="blur"
      step={90}
      text="Every agent, every run, one place."
      className="m-0 font-display text-[28px] font-semibold"
    />
  ),
}

/** Types three phrases, erases each and starts over (animated: not in the visual tests). */
export const TypewriterLoop: Story = {
  tags: ['no-test'],
  render: () => (
    <p className="m-0 font-display text-[28px] font-semibold">
      Build{' '}
      <Typewriter
        text={['dashboards', 'AI agents', 'docs sites']}
        loop
        className="text-primary-text"
      />
    </p>
  ),
}

/** The same, still on its first phrase. */
export const TypewriterFrozen: Story = {
  render: () => (
    <p className="m-0 font-display text-[28px] font-semibold">
      Build{' '}
      <Typewriter
        text={['dashboards', 'AI agents', 'docs sites']}
        frozen
        className="text-primary-text"
      />
    </p>
  ),
}

/** A label for something in progress. */
export const Shimmer: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-[14px]">
      <ShimmerText>Thinking…</ShimmerText>
      <ShimmerText className="text-muted-foreground" duration={3}>
        Searching 1,284 documents
      </ShimmerText>
    </div>
  ),
}

/** The accent gradient, still and moving. */
export const Gradient: Story = {
  render: () => (
    <div className="flex flex-col gap-2 font-display text-[36px] leading-tight font-semibold">
      <p className="m-0">
        Design that <GradientText>scales</GradientText>
      </p>
      <p className="m-0">
        <GradientText animate>Ship it today</GradientText>
      </p>
    </div>
  ),
}
