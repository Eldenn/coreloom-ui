# Inbox

Conversations a team shares (support, sales, a contact form): the list with search and filters, the thread with internal notes, and a box to reply or leave a note. A base for a helpdesk.

**Install** `pnpm dlx shadcn@latest add @coreloom/inbox`.

**The consumer provides** `<Inbox conversations currentUser>`: conversations `{ id, subject, contact, status, unread?, assignee?, labels?, channel?, updatedAt, messages }`, messages `{ id, author, kind: 'incoming' | 'outgoing' | 'note', body, sentAt, attachments? }`. Optional: `teammates`, `onSend(id, { body, kind })` (may return a promise), `onStatusChange`, `onAssign`, `onReadChange`.

- Filters: status, then All, Unread, Mine, Unassigned, and a search over subjects, contacts, labels and messages.
- Notes are labelled in words; Ctrl/⌘+Enter sends; a failed send keeps the text. On a phone the list and the thread take turns.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Inbox`._
