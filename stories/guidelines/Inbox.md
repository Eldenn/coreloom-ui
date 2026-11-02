# Inbox

Conversations a team shares: support tickets, sales leads, messages from a contact form or a chat widget. The list with search and filters, the thread with internal notes, and a box to reply. A base for a helpdesk.

**Install** `pnpm dlx shadcn@latest add @coreloom/inbox`.

**The consumer provides** `<Inbox conversations currentUser>`: conversations are `{ id, subject, contact, status: 'open' | 'pending' | 'closed', unread?, assignee?, labels?, channel?, updatedAt, preview?, messages }`, messages `{ id, author, kind: 'incoming' | 'outgoing' | 'note', body, sentAt, attachments? }`, people `{ id, name, email?, avatarUrl? }`. Optional: `teammates` (for Assign to), `onSend(conversationId, { body, kind: 'reply' | 'note' })` (adds the composer; return a promise to keep it busy), `onStatusChange(id, status)`, `onAssign(id, personId | null)`, `onReadChange(id, unread)` (opening an unread conversation marks it read; Mark as unread), `selectedId` / `defaultSelectedId` / `onSelectedChange`, `defaultStatus` (default `open`), `defaultFilter`, `now` (the time list dates count from).

- Filters: a status (open, pending, closed, all), then All, Unread, Mine (assigned to `currentUser`) or Unassigned; search covers the subject, the contact, labels and every message. `filterConversations` is exported for a server-side list.
- Internal notes are tinted and labelled **Internal note** in words; the composer switches between Reply and Internal note. Ctrl/⌘+Enter sends; a failed send keeps the text and says so.
- Messages are plain text (line breaks kept), never HTML. Attachment links only allow http(s) and in-app paths.
- On a phone the list and the thread take turns, with a Back button; focus follows. Sending, status and assignment changes are announced politely.
- For a single conversation with an AI assistant use Chat; for comments under a document, CommentThread.
