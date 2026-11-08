# @coreloom/inbox

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/inbox.tsx

```ts
function filterConversations(conversations: readonly InboxConversation[], { status, filter, query, currentUserId, }: { status?: InboxStatus | 'all'; filter?: InboxFilter; query?: string; currentUserId?: string; }) => InboxConversation[]
function formatInboxTime(date: Date | string, now: Date | number, locale: string) => string
function Inbox
Inbox.conversations: InboxConversation[]
Inbox.currentUser: InboxPerson
Inbox.teammates?: InboxPerson[] | undefined
Inbox.selectedId?: string | null | undefined
Inbox.defaultSelectedId?: string | undefined
Inbox.onSelectedChange?: ((id: string | null) => void) | undefined
Inbox.defaultStatus?: 'all' | InboxStatus | undefined
Inbox.defaultFilter?: InboxFilter | undefined
Inbox.onSend?: ((conversationId: string, draft: InboxDraft) => void | Promise<void>) | undefined
Inbox.onStatusChange?: ((conversationId: string, status: InboxStatus) => void) | undefined
Inbox.onAssign?: ((conversationId: string, personId: string | null) => void) | undefined
Inbox.onReadChange?: ((conversationId: string, unread: boolean) => void) | undefined
Inbox.now?: Date | undefined
Inbox.className?: string | undefined
type InboxAttachment = {}
InboxAttachment.name: string
InboxAttachment.size?: number | undefined
InboxAttachment.href?: string | undefined
type InboxConversation = {}
InboxConversation.id: string
InboxConversation.subject: string
InboxConversation.contact: InboxPerson
InboxConversation.status: InboxStatus
InboxConversation.unread?: boolean | undefined
InboxConversation.assignee?: InboxPerson | undefined
InboxConversation.labels?: string[] | undefined
InboxConversation.channel?: string | undefined
InboxConversation.updatedAt: string | Date
InboxConversation.preview?: string | undefined
InboxConversation.messages: InboxMessage[]
type InboxDraft = {}
InboxDraft.body: string
InboxDraft.kind: 'reply' | 'note'
type InboxFilter = 'all' | 'unread' | 'mine' | 'unassigned'
type InboxMessage = {}
InboxMessage.id: string
InboxMessage.author: InboxPerson
InboxMessage.kind: 'note' | 'incoming' | 'outgoing'
InboxMessage.body: string
InboxMessage.sentAt: string | Date
InboxMessage.attachments?: InboxAttachment[] | undefined
type InboxPerson = {}
InboxPerson.id: string
InboxPerson.name: string
InboxPerson.email?: string | undefined
InboxPerson.avatarUrl?: string | undefined
type InboxStatus = 'pending' | 'open' | 'closed'
function InboxStatusBadge
InboxStatusBadge.status: InboxStatus
```
