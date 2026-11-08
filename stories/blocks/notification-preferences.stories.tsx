import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type NotificationChannel,
  type NotificationEvent,
  NotificationPreferences,
  type NotificationPreferenceValue,
} from '@/components/notification-preferences'

const channels: NotificationChannel[] = [
  { id: 'email', label: 'E-mail' },
  { id: 'push', label: 'Push' },
  { id: 'app', label: 'In-app' },
]

const events: NotificationEvent[] = [
  {
    id: 'mention',
    group: 'Activity',
    label: 'Mentions',
    description: 'Someone @mentions you in a comment or a document.',
  },
  { id: 'reply', group: 'Activity', label: 'Replies to your comments' },
  { id: 'assigned', group: 'Activity', label: 'Tasks assigned to you', unavailable: ['push'] },
  {
    id: 'deploy-failed',
    group: 'Projects',
    label: 'Failed deployments',
    description: 'A deployment of a project you own fails.',
  },
  { id: 'weekly', group: 'Projects', label: 'Weekly summary', unavailable: ['push', 'app'] },
  {
    id: 'login',
    group: 'Security',
    label: 'New sign-in',
    description: 'Your account is used on a new device.',
    required: ['email'],
  },
  { id: 'invoice', group: 'Billing', label: 'Invoices and receipts', required: ['email'] },
]

const defaults: NotificationPreferenceValue = {
  mention: ['email', 'push', 'app'],
  reply: ['app'],
  assigned: ['email', 'app'],
  'deploy-failed': ['email', 'push'],
  weekly: ['email'],
  login: ['push'],
}

const meta = {
  title: 'Blocks/Notification preferences',
  component: NotificationPreferences,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Which notifications someone gets, and where: events (grouped) by channels, a checkbox per cell and per channel. Events can lock a channel on (`required`) or not offer it (`unavailable`). The value is `{ [eventId]: channelIds[] }`; save it in `onValueChange`.',
      },
    },
  },
  args: { events, channels, defaultValue: defaults },
} satisfies Meta<typeof NotificationPreferences>
export default meta
type Story = StoryObj<typeof meta>

/** Changes save as they happen, as an autosaving settings page would. */
export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState(defaults)
    return (
      <div className="mx-auto max-w-[760px] py-4">
        <NotificationPreferences {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const TwoChannels: Story = {
  args: {
    channels: channels.slice(0, 2),
    events: events.filter((e) => e.group !== 'Projects'),
  },
}

export const Disabled: Story = { args: { disabled: true } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    channels: [
      { id: 'email', label: 'E-mail' },
      { id: 'push', label: 'Push' },
      { id: 'app', label: 'Dans l’app' },
    ],
    events: [
      { id: 'mention', group: 'Activité', label: 'Mentions' },
      { id: 'reply', group: 'Activité', label: 'Réponses à vos commentaires' },
      { id: 'login', group: 'Sécurité', label: 'Nouvelle connexion', required: ['email'] },
    ],
  },
}
