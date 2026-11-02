import type { Meta, StoryObj } from '@storybook/react-vite'

import { AspectRatio } from '@/components/ui/aspect-ratio'

const meta = {
  title: 'Components/Layout/Aspect ratio',
  component: AspectRatio,
  tags: ['autodocs'],
  args: { ratio: 16 / 9 },
  argTypes: { ratio: { control: 'number' } },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Keeps a box at a width-to-height ratio whatever its width. The consumer sets `ratio` (16 / 9, 1, 4 / 3) and puts an image, a video or a preview inside, filling it with `size-full object-cover`.',
      },
    },
  },
} satisfies Meta<typeof AspectRatio>
export default meta
type Story = StoryObj<typeof meta>

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center rounded-md border border-border-subtle bg-[linear-gradient(135deg,var(--color-primary-subtle),var(--color-inset))] font-mono text-[11px] font-semibold tracking-[0.08em] text-fg-secondary uppercase">
      {label}
    </div>
  )
}

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <AspectRatio {...args}>
        <Placeholder label="16 / 9" />
      </AspectRatio>
    </div>
  ),
}

export const Ratios: Story = {
  render: () => (
    <div className="grid max-w-2xl grid-cols-3 items-start gap-4">
      <AspectRatio ratio={1}>
        <Placeholder label="1 / 1" />
      </AspectRatio>
      <AspectRatio ratio={4 / 3}>
        <Placeholder label="4 / 3" />
      </AspectRatio>
      <AspectRatio ratio={3 / 4}>
        <Placeholder label="3 / 4" />
      </AspectRatio>
    </div>
  ),
}
