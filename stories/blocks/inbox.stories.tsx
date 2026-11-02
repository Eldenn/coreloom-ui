import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Inbox, type InboxConversation, type InboxPerson } from '@/components/inbox'

const me: InboxPerson = { id: 'u1', name: 'Matthieu C.', email: 'matthieu@coreloom.dev' }
const team: InboxPerson[] = [
  { id: 'u2', name: 'Ada Lovelace' },
  { id: 'u3', name: 'Grace Hopper' },
]

const conversations: InboxConversation[] = [
  {
    id: 'c1',
    subject: 'Charged twice for October',
    contact: { id: 'k1', name: 'Lena Fischer', email: 'lena@northwind.de' },
    status: 'open',
    unread: true,
    channel: 'Email',
    labels: ['billing', 'priority'],
    updatedAt: '2026-10-14T09:42:00+02:00',
    messages: [
      {
        id: 'm1',
        author: { id: 'k1', name: 'Lena Fischer' },
        kind: 'incoming',
        body: 'Hi,\n\nMy card was charged twice for the October invoice (INV-2048). Can you refund one of them?\n\nThanks,\nLena',
        sentAt: '2026-10-14T09:42:00+02:00',
        attachments: [{ name: 'bank-statement.pdf', size: 184_000 }],
      },
    ],
  },
  {
    id: 'c2',
    subject: 'SSO with Okta',
    contact: { id: 'k2', name: 'Diego Ramírez', email: 'diego@acme.io' },
    status: 'open',
    assignee: me,
    channel: 'Chat',
    labels: ['enterprise'],
    updatedAt: '2026-10-14T08:15:00+02:00',
    messages: [
      {
        id: 'm2',
        author: { id: 'k2', name: 'Diego Ramírez' },
        kind: 'incoming',
        body: 'Do you support SAML SSO with Okta on the Team plan?',
        sentAt: '2026-10-14T07:58:00+02:00',
      },
      {
        id: 'm3',
        author: me,
        kind: 'note',
        body: 'SSO is Enterprise only. @Ada can we offer a trial of Enterprise?',
        sentAt: '2026-10-14T08:05:00+02:00',
      },
      {
        id: 'm4',
        author: me,
        kind: 'outgoing',
        body: 'Hi Diego, SAML SSO is part of the Enterprise plan. I can turn on a 14-day Enterprise trial for your workspace so you can set up Okta. Shall I?',
        sentAt: '2026-10-14T08:15:00+02:00',
      },
    ],
  },
  {
    id: 'c3',
    subject: 'Export all projects as CSV',
    contact: { id: 'k3', name: 'Aiko Tanaka', email: 'aiko@studio.jp' },
    status: 'pending',
    assignee: team[0],
    channel: 'Email',
    updatedAt: '2026-10-13T17:30:00+02:00',
    messages: [
      {
        id: 'm5',
        author: { id: 'k3', name: 'Aiko Tanaka' },
        kind: 'incoming',
        body: 'Is there a way to export every project at once?',
        sentAt: '2026-10-13T16:10:00+02:00',
      },
      {
        id: 'm6',
        author: team[0] ?? me,
        kind: 'outgoing',
        body: 'Not yet in one click: Settings → Data → Export gives you one archive per project. I’ve passed your request to the product team.',
        sentAt: '2026-10-13T17:30:00+02:00',
      },
    ],
  },
  {
    id: 'c4',
    subject: 'Invoice address',
    contact: { id: 'k4', name: 'Omar Haddad', email: 'omar@haddad.co' },
    status: 'open',
    unread: true,
    channel: 'Email',
    updatedAt: '2026-10-12T11:20:00+02:00',
    messages: [
      {
        id: 'm7',
        author: { id: 'k4', name: 'Omar Haddad' },
        kind: 'incoming',
        body: 'Please change the address on my invoices to 12 Rue de la Paix, Paris.',
        sentAt: '2026-10-12T11:20:00+02:00',
      },
    ],
  },
  {
    id: 'c5',
    subject: 'Thanks for the quick fix!',
    contact: { id: 'k5', name: 'Sofia Rossi', email: 'sofia@rossi.it' },
    status: 'closed',
    assignee: team[1],
    channel: 'Chat',
    updatedAt: '2026-10-08T14:00:00+02:00',
    messages: [
      {
        id: 'm8',
        author: { id: 'k5', name: 'Sofia Rossi' },
        kind: 'incoming',
        body: 'The calendar sync works again. Thanks for the quick fix!',
        sentAt: '2026-10-08T14:00:00+02:00',
      },
    ],
  },
]

const now = new Date('2026-10-14T10:00:00+02:00')

const meta = {
  title: 'Blocks/Inbox',
  component: Inbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shared conversations for a support or sales team, a base for a helpdesk: the list with search, a status and filters (unread, mine, unassigned), the thread with internal notes and attachments, and a box to reply or leave a note (Ctrl/⌘+Enter sends). Status, assignee and read state change through callbacks; `onSend` may return a promise. On a phone the list and the thread take turns.',
      },
    },
  },
  args: { conversations, currentUser: me, teammates: team, now },
} satisfies Meta<typeof Inbox>
export default meta
type Story = StoryObj<typeof meta>

/** Everything wired to local state; sending takes half a second. */
export const Default: Story = {
  render: function Render(args) {
    const [items, setItems] = React.useState(args.conversations)
    const update = (id: string, patch: Partial<InboxConversation>) => {
      setItems((all) => all.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    }
    return (
      <Inbox
        {...args}
        conversations={items}
        defaultSelectedId="c2"
        onReadChange={(id, unread) => {
          update(id, { unread })
        }}
        onStatusChange={(id, status) => {
          update(id, { status })
        }}
        onAssign={(id, personId) => {
          update(id, { assignee: [me, ...team].find((p) => p.id === personId) })
        }}
        onSend={(id, draft) =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              setItems((all) =>
                all.map((c) =>
                  c.id === id
                    ? {
                        ...c,
                        updatedAt: now,
                        messages: [
                          ...c.messages,
                          {
                            id: `m${String(Date.now())}`,
                            author: me,
                            kind: draft.kind === 'note' ? 'note' : 'outgoing',
                            body: draft.body,
                            sentAt: now,
                          },
                        ],
                      }
                    : c,
                ),
              )
              resolve()
            }, 500)
          })
        }
      />
    )
  },
}

/** Read only: no composer, status and assignee shown as text. */
export const ReadOnly: Story = { args: { defaultSelectedId: 'c3', defaultStatus: 'all' } }

/** Nothing selected yet. */
export const NoSelection: Story = { args: { onSend: () => undefined } }

export const Empty: Story = { args: { conversations: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    defaultSelectedId: 'c2',
    onSend: () => undefined,
    onStatusChange: () => undefined,
    onAssign: () => undefined,
  },
}

/** On a phone the list comes first; picking a conversation opens it, Back returns. */
export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { onSend: () => undefined, onReadChange: () => undefined },
  render: (args) => (
    <div className="max-w-[390px]">
      <Inbox {...args} />
    </div>
  ),
}
