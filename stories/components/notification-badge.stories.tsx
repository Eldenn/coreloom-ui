import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, InboxIcon, MessageSquareIcon, ShoppingCartIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NotificationBadge } from '@/components/ui/notification-badge'

const meta = {
  title: 'Components/Data display/Notification badge',
  component: NotificationBadge,
  tags: ['autodocs'],
  args: { count: 3, children: null },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A count or a dot on a corner. The consumer provides the icon or avatar as `children`, and `count` or `dot`. Optional: `max` (99), `showZero`, `tone`, `placement` (`top-right`, `bottom-right`), `pulse`, and `label` for the words screen readers hear.',
      },
    },
  },
} satisfies Meta<typeof NotificationBadge>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Button variant="ghost" size="icon">
        <span className="sr-only">Notifications</span>
        <NotificationBadge count={3}>
          <BellIcon />
        </NotificationBadge>
      </Button>
      <Button variant="ghost" size="icon">
        <span className="sr-only">Inbox</span>
        <NotificationBadge count={128} tone="primary">
          <InboxIcon />
        </NotificationBadge>
      </Button>
      <Button variant="ghost" size="icon">
        <span className="sr-only">Messages</span>
        <NotificationBadge dot pulse>
          <MessageSquareIcon />
        </NotificationBadge>
      </Button>
      <Button variant="ghost" size="icon">
        <span className="sr-only">Cart</span>
        <NotificationBadge count={0} showZero tone="neutral" label="Cart empty">
          <ShoppingCartIcon />
        </NotificationBadge>
      </Button>
      <NotificationBadge dot tone="success" placement="bottom-right" label="Online">
        <Avatar>
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
      </NotificationBadge>
      <NotificationBadge count={2} label="2 new messages">
        <Avatar>
          <AvatarFallback>TB</AvatarFallback>
        </Avatar>
      </NotificationBadge>
    </div>
  ),
}
