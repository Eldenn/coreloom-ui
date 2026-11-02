import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { OverflowList } from '@/components/ui/overflow-list'

const meta = {
  title: 'Components/Data display/Overflow list',
  component: OverflowList,
  tags: ['autodocs'],
  args: { items: [], renderItem: () => null },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One line of items that shows what fits and ends with "+N". The consumer provides `items` and `renderItem` (with a key). Optional: `max`, `gap` (px), `renderOverflow` to replace the "+N" popover, and an `aria-label`.',
      },
    },
  },
} satisfies Meta<typeof OverflowList>
export default meta
type Story = StoryObj<typeof meta>

const labels = [
  'Design',
  'Frontend',
  'Accessibility',
  'Q4 roadmap',
  'Customer request',
  'Billing',
  'Mobile',
  'Performance',
  'Docs',
]
const people = [
  'Léa Martin',
  'Tom Bernard',
  'Inès Morel',
  'Sami Haddad',
  'Nora Weber',
  'Hugo Lambert',
  'Ana Ruiz',
  'Yuki Sato',
]
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      {[560, 340, 200].map((width) => (
        <div
          key={width}
          style={{ width }}
          className="rounded-md border border-dashed border-border p-2"
        >
          <OverflowList
            aria-label="Labels"
            items={labels}
            renderItem={(label) => <Badge key={label}>{label}</Badge>}
          />
        </div>
      ))}
      <div style={{ width: 260 }}>
        <OverflowList
          aria-label="Members"
          items={people}
          max={5}
          gap={4}
          renderItem={(name) => (
            <Avatar key={name} className="size-7" title={name}>
              <AvatarFallback className="text-[11px]">{initials(name)}</AvatarFallback>
            </Avatar>
          )}
        />
      </div>
    </div>
  ),
}
