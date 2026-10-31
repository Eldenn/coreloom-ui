import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangleIcon, GitPullRequestIcon, RocketIcon, UserPlusIcon } from 'lucide-react'
import * as React from 'react'

import { InvoiceTable, PaymentMethod, PlanCard, UsageMeters } from '@/components/billing'
import { type CalendarEvent, EventCalendar } from '@/components/event-calendar'
import { KanbanBoard, type KanbanCard, type KanbanColumn } from '@/components/kanban'
import { type NotificationItem, NotificationsMenu } from '@/components/notifications'
import { type TeamInvite, type TeamMember, TeamMembers } from '@/components/team'
import { toast } from '@/components/ui/sonner'

const meta = { title: 'Blocks/Workspace', tags: ['autodocs'] } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

// ——— Notifications ———

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    icon: <RocketIcon />,
    title: 'coreloom-web deployed to production',
    description: 'main · 3f2a9c1',
    time: '2 min ago',
    href: '#deploys',
  },
  {
    id: 'n2',
    icon: <AlertTriangleIcon />,
    title: 'coreloom-api build failed',
    description: 'Type error in src/billing.ts',
    time: '1 h ago',
    href: '#builds',
  },
  {
    id: 'n3',
    icon: <GitPullRequestIcon />,
    title: 'Ada requested your review',
    description: '#482 Add typed dates',
    time: '3 h ago',
    href: '#pulls',
  },
  {
    id: 'n4',
    icon: <UserPlusIcon />,
    title: 'Grace joined the workspace',
    time: 'Yesterday',
    read: true,
  },
]

export const Notifications: Story = {
  render: () => {
    const [items, setItems] = React.useState(initialNotifications)
    return (
      <div className="flex justify-end rounded-lg border border-border bg-background p-3">
        <NotificationsMenu
          items={items}
          onMarkRead={(id) => {
            setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
          }}
          onMarkAllRead={() => {
            setItems((list) => list.map((n) => ({ ...n, read: true })))
          }}
          viewAllHref="#notifications"
        />
      </div>
    )
  },
}

// ——— Team ———

const roles = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'developer', label: 'Developer' },
  { value: 'viewer', label: 'Viewer' },
]

export const Team: Story = {
  render: () => {
    const [members, setMembers] = React.useState<TeamMember[]>([
      { id: 'u1', name: 'Matthieu C.', email: 'matthieu@coreloom.dev', role: 'owner' },
      { id: 'u2', name: 'Ada Lovelace', email: 'ada@coreloom.dev', role: 'admin' },
      { id: 'u3', name: 'Grace Hopper', email: 'grace@coreloom.dev', role: 'developer' },
      { id: 'u4', name: 'Alan Turing', email: 'alan@coreloom.dev', role: 'viewer' },
    ])
    const [invites, setInvites] = React.useState<TeamInvite[]>(() => [
      { id: 'i1', email: 'linus@acme.dev', role: 'developer', invitedAt: new Date(2026, 9, 12) },
    ])
    return (
      <div className="max-w-3xl">
        <TeamMembers
          members={members}
          roles={roles}
          invites={invites}
          currentUserId="u1"
          onInvite={async (emails, role) => {
            await new Promise((r) => setTimeout(r, 500))
            setInvites((list) => [
              ...list,
              ...emails.map((email, i) => ({
                id: `i${Date.now()}${i}`,
                email,
                role,
                invitedAt: new Date(),
              })),
            ])
            toast.success(`${emails.length} invite${emails.length > 1 ? 's' : ''} sent`)
          }}
          onRoleChange={(id, role) => {
            setMembers((list) => list.map((m) => (m.id === id ? { ...m, role } : m)))
          }}
          onRemove={(id) => {
            setMembers((list) => list.filter((m) => m.id !== id))
          }}
          onRevoke={(id) => {
            setInvites((list) => list.filter((i) => i.id !== id))
          }}
        />
      </div>
    )
  },
}

// ——— Billing ———

export const Billing: Story = {
  render: () => (
    <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
      <PlanCard
        name="Pro"
        price={24}
        renewsAt={new Date(2026, 10, 1)}
        features={['Unlimited projects', 'Custom domains', 'Team roles and SSO']}
        onChangePlan={() => toast('Change plan')}
        onCancel={() => toast('Cancel')}
      />
      <UsageMeters
        items={[
          { label: 'Build minutes', used: 1840, limit: 3000, unit: 'min' },
          { label: 'Bandwidth', used: 86, limit: 100, unit: 'GB' },
          { label: 'Seats', used: 11, limit: 10 },
        ]}
      />
      <PaymentMethod
        brand="Visa"
        last4="4242"
        expires={new Date(2028, 3, 1)}
        onUpdate={() => toast('Update card')}
      />
      <InvoiceTable
        className="lg:col-span-2"
        invoices={[
          {
            id: 'INV-2026-010',
            date: new Date(2026, 9, 1),
            amount: 24,
            status: 'due',
            href: '#inv-10',
          },
          {
            id: 'INV-2026-009',
            date: new Date(2026, 8, 1),
            amount: 24,
            status: 'paid',
            href: '#inv-9',
          },
          {
            id: 'INV-2026-008',
            date: new Date(2026, 7, 1),
            amount: 24,
            status: 'failed',
            href: '#inv-8',
          },
          {
            id: 'INV-2026-007',
            date: new Date(2026, 6, 1),
            amount: 19.5,
            status: 'paid',
            href: '#inv-7',
          },
        ]}
      />
    </div>
  ),
}

// ——— Kanban ———

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress', limit: 2 },
  { id: 'review', title: 'In review' },
  { id: 'done', title: 'Done' },
]

const initialCards: KanbanCard[] = [
  {
    id: 'c1',
    columnId: 'todo',
    title: 'Typed dates in DatePicker',
    labels: [{ label: 'forms' }],
    assignee: { name: 'Ada Lovelace' },
  },
  {
    id: 'c2',
    columnId: 'todo',
    title: 'Billing page',
    description: 'Plan, usage, invoices',
    labels: [{ label: 'blocks', tone: 'default' }],
  },
  { id: 'c3', columnId: 'todo', title: 'Spanish dictionary' },
  {
    id: 'c4',
    columnId: 'doing',
    title: 'Kanban block',
    labels: [{ label: 'a11y', tone: 'warning' }],
    assignee: { name: 'Grace Hopper' },
  },
  {
    id: 'c5',
    columnId: 'doing',
    title: 'Server-driven DataTable',
    assignee: { name: 'Matthieu C.' },
  },
  {
    id: 'c6',
    columnId: 'review',
    title: 'Notifications menu',
    labels: [{ label: 'blocks', tone: 'default' }],
  },
  {
    id: 'c7',
    columnId: 'done',
    title: 'Starter demo on Pages',
    labels: [{ label: 'shipped', tone: 'success' }],
  },
]

export const Kanban: Story = {
  render: () => {
    const [cards, setCards] = React.useState(initialCards)
    return (
      <KanbanBoard
        columns={columns}
        cards={cards}
        onCardsChange={setCards}
        onCardOpen={(card) => toast(card.title)}
      />
    )
  },
}

// ——— Calendar ———

const at = (day: number, h?: number, m = 0, len = 1) =>
  h === undefined
    ? { start: new Date(2026, 9, day), allDay: true }
    : { start: new Date(2026, 9, day, h, m), end: new Date(2026, 9, day, h + len, m) }

const events: CalendarEvent[] = [
  { id: 'e1', title: 'Sprint planning', ...at(5, 9, 30), color: 1 },
  { id: 'e2', title: 'Design review', ...at(7, 14), color: 2 },
  { id: 'e3', title: 'Release 0.7', ...at(14), color: 4 },
  { id: 'e4', title: '1:1 Ada', ...at(14, 10), color: 2 },
  { id: 'e5', title: 'Incident review', ...at(14, 15), color: 5 },
  { id: 'e6', title: 'Team lunch', ...at(14, 12, 30), color: 3 },
  { id: 'e7', title: 'Sprint demo', ...at(16, 16), color: 1 },
  { id: 'e8', title: 'Offsite', ...at(22), color: 3 },
  { id: 'e9', title: 'Retro', ...at(30, 11), color: 1 },
]

export const Calendar: Story = {
  render: () => (
    <EventCalendar
      events={events}
      defaultMonth={new Date(2026, 9, 1)}
      onEventSelect={(e) => toast(e.title)}
      onDaySelect={(d) => toast(d.toDateString())}
    />
  ),
}
