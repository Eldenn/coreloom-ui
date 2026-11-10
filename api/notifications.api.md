# @coreloom/notifications

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/notifications.tsx

```ts
type NotificationItem = {}
NotificationItem.id: string
NotificationItem.title: React.ReactNode
NotificationItem.description?: React.ReactNode
NotificationItem.time?: React.ReactNode
NotificationItem.read?: boolean | undefined
NotificationItem.icon?: React.ReactNode
NotificationItem.href?: string | undefined
function NotificationsMenu
NotificationsMenu.items: NotificationItem[]
NotificationsMenu.onMarkRead?: ((id: string) => void) | undefined
NotificationsMenu.onMarkAllRead?: (() => void) | undefined
NotificationsMenu.viewAllHref?: string | undefined
NotificationsMenu.className?: string | undefined
```
