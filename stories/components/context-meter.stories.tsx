import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContextBreakdown, ContextMeter } from '@/components/ui/context-meter'

import { catalog, usage } from '../blocks/ai-models'

const sonnet = catalog[0]

const meta = {
  title: 'Components/AI/Context meter',
  component: ContextMeter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "How much of the context window a conversation fills: a ring and a percentage, amber from 80 % and red from 95 % — with the same news in words. Hover or focus it for the breakdown (input, cached, output, reasoning, total against the window) and the estimated cost. Takes the AI SDK's usage as it is, or a token count.",
      },
    },
  },
  args: { used: usage, model: sonnet, variant: 'ring', showValue: true },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ring', 'bar'] },
    showValue: { control: 'boolean' },
    max: { control: 'number' },
    cost: { control: 'number' },
    used: { control: 'object' },
    model: { control: false },
  },
  // Where it lives: the right of a composer's bottom bar.
  render: (args) => (
    <div className="flex max-w-xl items-center justify-end gap-1 rounded-lg border border-input bg-inset p-2">
      <ContextMeter {...args} />
    </div>
  ),
} satisfies Meta<typeof ContextMeter>
export default meta
type Story = StoryObj<typeof meta>

/** 42 % of a 200K window. Hover or Tab to it for the breakdown. */
export const Default: Story = {}

/** The breakdown on its own (what the card shows), e.g. in a usage panel. */
export const Breakdown: Story = {
  render: (args) => (
    <div className="w-64 rounded-md border border-border bg-popover p-3.5">
      <ContextBreakdown used={args.used} model={args.model} max={args.max} cost={args.cost} />
    </div>
  ),
}

/** A fresh conversation: a token count, no breakdown. */
export const Low: Story = { args: { used: 6_200, max: 200_000 } }

/** 85 %: amber, and the card says to start a new chat soon. */
export const High: Story = {
  args: { used: { inputTokens: 161_000, outputTokens: 9_200, totalTokens: 170_200 } },
}

/** 97 %: red, and the card warns older messages may be left out. */
export const NearFull: Story = {
  args: {
    used: {
      inputTokens: 186_400,
      outputTokens: 7_900,
      outputTokenDetails: { reasoningTokens: 5_100 },
      totalTokens: 194_300,
    },
  },
}

/** A short bar instead of the ring, with a cost the app computed itself. */
export const Bar: Story = { args: { variant: 'bar', cost: 0.27 } }

/** French: "42 %", "85 k sur 200 k", "0,30 $US". */
export const French: Story = {
  globals: { locale: 'fr' },
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full max-w-xl items-center justify-end gap-1 rounded-lg border border-input bg-inset p-2">
        <ContextMeter {...args} />
      </div>
      <div className="w-64 rounded-md border border-border bg-popover p-3.5">
        <ContextBreakdown used={args.used} model={args.model} />
      </div>
    </div>
  ),
}
