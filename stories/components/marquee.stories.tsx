import type { Meta, StoryObj } from '@storybook/react-vite'

import { Marquee } from '@/components/ui/marquee'

const logos = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Vandelay', 'Stark']

function Logo({ name }: { name: string }) {
  return (
    <span className="flex h-12 items-center rounded-lg border border-border bg-card px-5 font-display text-[16px] font-semibold text-fg-secondary">
      {name}
    </span>
  )
}

const quotes = [
  ['“We shipped our dashboard in a week.”', 'Lena, Northwind'],
  ['“The AI blocks saved us a quarter.”', 'Omar, Globex'],
  ['“Dark mode that actually reads well.”', 'Mei, Hooli'],
  ['“Our designers and devs finally agree.”', 'Sam, Initech'],
] as const

const meta = {
  title: 'Components/Motion/Marquee',
  component: Marquee,
  tags: ['autodocs'],
  args: { direction: 'left', duration: 30, pauseOnHover: true, fade: true, controls: true },
  argTypes: { direction: { control: 'inline-radio', options: ['left', 'right', 'up', 'down'] } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Items that scroll without end. The consumer provides the items as children and optionally `direction` (`left`, `right`, `up`, `down`), `duration` (seconds per round), `gap`, `pauseOnHover`, `fade`, `controls` (the pause button) and a controlled `paused` with `onPausedChange`.',
      },
    },
  },
} satisfies Meta<typeof Marquee>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Marquee {...args}>
      {logos.map((name) => (
        <Logo key={name} name={name} />
      ))}
    </Marquee>
  ),
}

/** Testimonials going the other way, slower. */
export const Testimonials: Story = {
  render: () => (
    <Marquee direction="right" duration={50} gap="1rem">
      {quotes.map(([quote, who]) => (
        <figure key={who} className="m-0 w-72 rounded-xl border border-border bg-card p-4">
          <blockquote className="m-0 text-[14px]">{quote}</blockquote>
          <figcaption className="mt-2 text-[12.5px] text-muted-foreground">{who}</figcaption>
        </figure>
      ))}
    </Marquee>
  ),
}

/** A column, for a sidebar of quotes. */
export const Vertical: Story = {
  render: () => (
    <Marquee direction="up" className="h-72 w-72" gap="0.75rem">
      {quotes.map(([quote, who]) => (
        <figure key={who} className="m-0 rounded-xl border border-border bg-card p-4">
          <blockquote className="m-0 text-[14px]">{quote}</blockquote>
          <figcaption className="mt-2 text-[12.5px] text-muted-foreground">{who}</figcaption>
        </figure>
      ))}
    </Marquee>
  ),
}

/** Paused from the start; the button says "play". */
export const Paused: Story = {
  args: { paused: true },
  render: (args) => (
    <Marquee {...args}>
      {logos.map((name) => (
        <Logo key={name} name={name} />
      ))}
    </Marquee>
  ),
}

export const French: Story = {
  ...Default,
  globals: { locale: 'fr' },
}
