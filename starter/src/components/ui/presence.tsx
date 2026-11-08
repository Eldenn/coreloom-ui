'use client'

// Coreloom UI — Presence. Who else is here, for collaborative screens: PresenceAvatars (the people on
// the page, with what they're doing), PresenceActivity ("Ada is editing…") and RemoteCursors (other
// people's pointers over a canvas or a document, with their names). There is no transport: your app
// sends and receives positions (a websocket, Liveblocks, Yjs awareness…) and passes them in.
// `cursorPosition(event, element)` turns a pointer event into the 0–1 position to send.
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCoreloomI18n } from '@/lib/i18n'
import { initials } from '@/lib/initials'
import { cn } from '@/lib/utils'

interface PresenceUser {
  id: string
  name: string
  avatarUrl?: string
  /** `idle`: here, but away for a while (dimmed). Default `active`. */
  status?: 'active' | 'idle'
  /** What they're doing, in a few words: "editing", "viewing Pricing". */
  activity?: string
  /** A colour for their cursor and ring, as a CSS colour (a token: `var(--chart-2)`). By default one is picked from their id. */
  color?: string
}

interface RemoteCursor {
  /** The user's id, matched against `users` for the name and colour. */
  id: string
  /** From the left edge of the area, 0 to 1. */
  x: number
  /** From the top edge of the area, 0 to 1. */
  y: number
}

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

/** A stable colour per user: theirs, or one of the chart colours picked from their id. */
function presenceColor(user: Pick<PresenceUser, 'id' | 'color'>) {
  if (user.color) return user.color
  let hash = 0
  for (const ch of user.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

/** A pointer's position inside `element`, from 0 to 1 on each axis (clamped): what to send. */
function cursorPosition(
  event: { clientX: number; clientY: number },
  element: {
    getBoundingClientRect: () => { left: number; top: number; width: number; height: number }
  },
): { x: number; y: number } {
  const box = element.getBoundingClientRect()
  const clamp = (n: number) => Math.min(1, Math.max(0, n))
  return {
    x: box.width ? clamp((event.clientX - box.left) / box.width) : 0,
    y: box.height ? clamp((event.clientY - box.top) / box.height) : 0,
  }
}

function useNames(users: readonly PresenceUser[]) {
  const { locale } = useCoreloomI18n()
  return React.useMemo(
    () =>
      new Intl.ListFormat(locale, { type: 'conjunction' }).format(
        users.map((u) => (u.activity ? `${u.name} (${u.activity})` : u.name)),
      ),
    [locale, users],
  )
}

function PresenceAvatar({ user, size }: { user: PresenceUser; size: 'sm' | 'default' | 'lg' }) {
  const t = useCoreloomI18n().messages.presence
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          size={size}
          // Focusable so the name in the tooltip shows with the keyboard too.
          tabIndex={0}
          role="img"
          data-status={user.status ?? 'active'}
          className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring data-[status=idle]:grayscale"
          style={{ boxShadow: `0 0 0 2px var(--background), 0 0 0 3.5px ${presenceColor(user)}` }}
          aria-label={user.status === 'idle' ? t.idleName(user.name) : user.name}
        >
          {user.avatarUrl && (
            // Only the photo is dimmed when idle: the initials keep their contrast.
            <AvatarImage src={user.avatarUrl} alt="" className="in-data-[status=idle]:opacity-55" />
          )}
          <AvatarFallback aria-hidden>{initials(user.name)}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        {user.name}
        {user.activity ? ` · ${user.activity}` : ''}
        {user.status === 'idle' ? ` · ${t.idle}` : ''}
      </TooltipContent>
    </Tooltip>
  )
}

/** The people on the page: a stack of avatars, the extra ones counted ("+3"), names on hover and focus. */
function PresenceAvatars({
  users,
  max = 4,
  size = 'sm',
  className,
}: {
  users: readonly PresenceUser[]
  /** Avatars shown before the rest are counted. */
  max?: number
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const t = useCoreloomI18n().messages.presence
  const shown = users.slice(0, Math.max(0, max))
  const rest = users.slice(shown.length)
  const everyone = useNames(users)
  const others = useNames(rest)
  if (!users.length) return null
  return (
    <div
      data-slot="presence-avatars"
      role="group"
      aria-label={t.here(users.length)}
      className={cn('flex items-center', className)}
    >
      <AvatarGroup className="-space-x-1.5">
        {shown.map((u) => (
          <PresenceAvatar key={u.id} user={u} size={size} />
        ))}
        {rest.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t.more(rest.length, others)}
                data-size={size}
                className="relative z-0 flex size-6 shrink-0 cursor-default items-center justify-center rounded-full border border-border bg-secondary font-mono text-[10.5px] font-medium text-fg-secondary ring-2 ring-background outline-none focus-visible:ring-[3px] focus-visible:ring-ring data-[size=default]:size-8 data-[size=lg]:size-10"
              >
                +{rest.length}
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">{others}</TooltipContent>
          </Tooltip>
        )}
      </AvatarGroup>
      <span className="sr-only">{everyone}</span>
    </div>
  )
}

/**
 * "Ada is editing…": who is doing something right now, for a line under an editor or a field.
 * Announced politely when it changes; pass `announce={false}` when the area has its own live region.
 */
function PresenceActivity({
  users,
  verb,
  announce = true,
  className,
}: {
  /** The people doing it now; nothing shows when empty. */
  users: readonly Pick<PresenceUser, 'id' | 'name' | 'color'>[]
  /** What they're doing, as a function of the names and their count (default "is editing"). */
  verb?: (names: string, count: number) => string
  announce?: boolean
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.presence
  // Past three names, the rest are counted: "Ada, Grace and 2 others".
  const names = React.useMemo(() => {
    const listed =
      users.length > 3 ? users.slice(0, 2).map((u) => u.name) : users.map((u) => u.name)
    if (users.length > 3) listed.push(t.others(users.length - 2))
    return new Intl.ListFormat(locale, { type: 'conjunction' }).format(listed)
  }, [users, locale, t])
  const text = users.length ? (verb ?? t.editing)(names, users.length) : ''
  return (
    <p
      data-slot="presence-activity"
      role={announce ? 'status' : undefined}
      className={cn(
        'm-0 flex min-h-5 items-center gap-2 text-[12.5px] text-muted-foreground',
        className,
      )}
    >
      {users.length > 0 && (
        <span aria-hidden className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1 animate-bounce rounded-full bg-current motion-reduce:animate-none"
              style={{ animationDelay: `${String(i * 150)}ms` }}
            />
          ))}
        </span>
      )}
      {text}
    </p>
  )
}

/**
 * Other people's pointers over an area (a canvas, a document): an arrow in their colour with their
 * name. Wrap the area; positions are fractions of its size, so they hold at any width. Cursors are
 * decorative (hidden from screen readers): say who is here with PresenceAvatars.
 */
function RemoteCursors({
  users,
  cursors,
  children,
  className,
}: {
  users: readonly PresenceUser[]
  cursors: readonly RemoteCursor[]
  children?: React.ReactNode
  className?: string
}) {
  const byId = new Map(users.map((u) => [u.id, u]))
  return (
    <div data-slot="remote-cursors" className={cn('relative', className)}>
      {children}
      <div
        aria-hidden
        // A size container, so cursors move in cqw / cqh: fractions of the area at any size.
        className="[container-type:size] pointer-events-none absolute inset-0 overflow-hidden"
      >
        {cursors.map((c) => {
          const user = byId.get(c.id)
          if (!user) return null
          const color = presenceColor(user)
          return (
            <div
              key={c.id}
              data-slot="remote-cursor"
              data-idle={user.status === 'idle' || undefined}
              className="absolute top-0 left-0 transition-transform duration-fast ease-out motion-reduce:transition-none"
              style={{
                transform: `translate(${String(c.x * 100)}cqw, ${String(c.y * 100)}cqh)`,
              }}
            >
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                className="block drop-shadow-sm in-data-idle:opacity-50"
              >
                <path
                  d="M1 1 L1 15 L5 11.5 L8 17 L10.5 15.8 L7.6 10.4 L13 10 Z"
                  fill={color}
                  stroke="var(--background)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="-mt-1 ml-3 block w-max max-w-40 truncate rounded-sm border bg-card px-1.5 py-0.5 text-[11.5px] font-medium text-foreground shadow-sm"
                style={{ borderColor: color }}
              >
                {user.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export {
  cursorPosition,
  PresenceActivity,
  PresenceAvatars,
  presenceColor,
  type PresenceUser,
  type RemoteCursor,
  RemoteCursors,
}
