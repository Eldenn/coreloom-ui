import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrashIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popconfirm } from '@/components/ui/popconfirm'

const meta = {
  title: 'Components/Overlays/Popconfirm',
  component: Popconfirm,
  tags: ['autodocs'],
  args: { title: 'Delete this comment?', onConfirm: () => undefined, children: null },
  parameters: {
    layout: 'centered',
    docs: {
      story: { inline: false, height: '260px' },
      description: {
        component:
          'A small confirmation next to its trigger. The consumer provides the trigger as `children` (one Button), a `title` question and `onConfirm` (a promise keeps the button busy). Optional: `description`, `confirmLabel`, `cancelLabel`, `destructive`, `icon`, `side`, `align`, and `open` / `onOpenChange`.',
      },
    },
  },
} satisfies Meta<typeof Popconfirm>
export default meta
type Story = StoryObj<typeof meta>

const wait = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 1200)
  })

export const Default: Story = {
  render: () => (
    <div className="pt-36">
      <Popconfirm
        defaultOpen
        destructive
        icon={<TriangleAlertIcon />}
        title="Delete this comment?"
        description="Replies to it are deleted too."
        confirmLabel="Delete"
        onConfirm={wait}
      >
        <Button variant="outline" size="sm">
          <TrashIcon /> Delete
        </Button>
      </Popconfirm>
    </div>
  ),
}

export const Neutral: Story = {
  render: () => (
    <div className="pb-36">
      <Popconfirm
        defaultOpen
        side="bottom"
        title="Publish to the help center?"
        confirmLabel="Publish"
        onConfirm={() => undefined}
      >
        <Button size="sm">Publish</Button>
      </Popconfirm>
    </div>
  ),
}
