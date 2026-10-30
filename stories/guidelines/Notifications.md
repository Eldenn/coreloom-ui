# Notifications

A bell for the app header with the unread count, and a popover of notifications.

**Install** `pnpm dlx shadcn@latest add @coreloom/notifications`. It writes `notifications.tsx`; put `<NotificationsMenu>` in the app shell's `headerActions`.

**The consumer provides** `items` (`[{ id, title, description?, time?, read?, icon?, href? }]`, newest first, `time` already formatted), `onMarkRead(id)`, `onMarkAllRead()` and optionally `viewAllHref`.

- The badge is a cyan pill on the bell ("9+" past nine); the button's name says the count ("Notifications, 3 unread").
- The popover has **All / Unread**, a **Mark all as read** action and one row per notification: icon, title (bold while unread), description, time in mono, and a dot that marks it read. Opening a notification follows its `href` (through the app's router) and marks it read.
- Mark read optimistically (the starter does it with TanStack Query) so the badge updates at once. Say what happened and to what — "coreloom-api build failed", not "Build event".
