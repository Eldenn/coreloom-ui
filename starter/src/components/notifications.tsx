'use client'

// Coreloom UI — NotificationsMenu (notifications block). A bell for the app header with the unread
// count, and a popover listing notifications: All / Unread tabs, mark one or all as read, links.
// Notifications are data; the read state is yours (call your API in onMarkRead / onMarkAllRead).
import { BellIcon, CheckCheckIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Already formatted: "2 min ago". */
  time?: React.ReactNode
  read?: boolean
  /** An icon or an Avatar. */
  icon?: React.ReactNode
  /** Opening the notification goes here (and marks it read). */
  href?: string
}

function NotificationsMenu({
  items,
  onMarkRead,
  onMarkAllRead,
  viewAllHref,
  className,
}: {
  items: NotificationItem[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  /** A "View all" link at the bottom, to a full notifications page. */
  viewAllHref?: string
  className?: string
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.notifications
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<'all' | 'unread'>('all')
  const unread = items.filter((i) => !i.read).length
  const shown = tab === 'unread' ? items.filter((i) => !i.read) : items

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unread ? t.triggerUnread(formatNumber(unread), unread) : t.trigger}
          data-slot="notifications-trigger"
          className={cn('relative', className)}
        >
          <BellIcon />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] leading-none font-semibold text-primary-foreground"
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(380px,calc(100vw-2rem))] p-0"
        aria-label={t.title}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="m-0 font-display text-[15px] font-semibold text-foreground">{t.title}</h2>
          {onMarkAllRead && unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[12px]"
              onClick={onMarkAllRead}
            >
              <CheckCheckIcon />
              {t.markAllRead}
            </Button>
          )}
        </div>
        {/* A filter, not tabs: one list whose content changes. */}
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={tab}
          onValueChange={(v) => v && setTab(v as typeof tab)}
          aria-label={t.title}
          className="mx-4 mt-3"
        >
          <ToggleGroupItem value="all">{t.all}</ToggleGroupItem>
          <ToggleGroupItem value="unread">
            {t.unread}
            {unread > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {formatNumber(unread)}
              </span>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
        {shown.length === 0 ? (
          <p className="m-0 px-4 py-10 text-center text-[13px] text-muted-foreground">
            {tab === 'unread' ? t.emptyUnread : t.empty}
          </p>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <ul className="m-0 list-none p-2">
              {shown.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  markReadLabel={t.markRead}
                  onMarkRead={onMarkRead}
                  onOpen={() => {
                    if (!item.read) onMarkRead?.(item.id)
                    setOpen(false)
                  }}
                />
              ))}
            </ul>
          </ScrollArea>
        )}
        {viewAllHref && (
          <div className="border-t border-border p-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <AppLink
                href={viewAllHref}
                onClick={() => {
                  setOpen(false)
                }}
              >
                {t.viewAll}
              </AppLink>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({
  item,
  markReadLabel,
  onMarkRead,
  onOpen,
}: {
  item: NotificationItem
  markReadLabel: string
  onMarkRead?: (id: string) => void
  onOpen: () => void
}) {
  const body = (
    <>
      <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground [&_svg]:size-4">
        {item.icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-[13px] leading-snug',
            item.read ? 'text-fg-secondary' : 'font-medium text-foreground',
          )}
        >
          {item.title}
        </span>
        {item.description && (
          <span className="text-[12px] leading-snug text-muted-foreground">{item.description}</span>
        )}
        {item.time && (
          <span className="font-mono text-[11px] text-muted-foreground">{item.time}</span>
        )}
      </span>
    </>
  )
  const rowClass =
    'flex w-full gap-3 rounded-md p-2 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring'
  return (
    <li
      data-slot="notification"
      data-unread={!item.read || undefined}
      className="group relative flex items-start gap-1"
    >
      {item.href ? (
        <AppLink href={item.href} className={rowClass} onClick={onOpen}>
          {body}
        </AppLink>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
      {!item.read &&
        (onMarkRead ? (
          <button
            type="button"
            aria-label={markReadLabel}
            onClick={() => {
              onMarkRead(item.id)
            }}
            className="mt-2 mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="size-2 rounded-full bg-primary" />
          </button>
        ) : (
          <span aria-hidden className="mt-4 mr-3 size-2 shrink-0 rounded-full bg-primary" />
        ))}
    </li>
  )
}

export { type NotificationItem, NotificationsMenu }
