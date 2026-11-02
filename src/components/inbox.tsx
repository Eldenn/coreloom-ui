'use client'

// Coreloom UI — Inbox (block). Shared conversations for a support or sales team: the list with
// search and filters (status, unread, mine, unassigned), the selected conversation's thread with
// internal notes, and a box to reply or to leave a note. A base for a helpdesk. Front-end only:
// you keep the conversations and pass `onSend`, `onStatusChange`, `onAssign` and `onReadChange`.
import {
  ArrowLeftIcon,
  MailIcon,
  MailOpenIcon,
  PaperclipIcon,
  SearchIcon,
  SendIcon,
  StickyNoteIcon,
  UserIcon,
} from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { formatBytes } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type InboxStatus = 'open' | 'pending' | 'closed'
type InboxFilter = 'all' | 'unread' | 'mine' | 'unassigned'

interface InboxPerson {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface InboxAttachment {
  name: string
  /** In bytes. */
  size?: number
  /** Where to download it; without one it shows as a name only. */
  href?: string
}

interface InboxMessage {
  id: string
  author: InboxPerson
  /** incoming: from the contact; outgoing: a reply from the team; note: internal, the team only. */
  kind: 'incoming' | 'outgoing' | 'note'
  /** Plain text; line breaks are kept. */
  body: string
  sentAt: Date | string
  attachments?: InboxAttachment[]
}

interface InboxConversation {
  id: string
  subject: string
  contact: InboxPerson
  status: InboxStatus
  unread?: boolean
  assignee?: InboxPerson
  labels?: string[]
  /** Where it came from: "Email", "Chat", "WhatsApp"… */
  channel?: string
  updatedAt: Date | string
  /** For the list; the last message's text by default. */
  preview?: string
  messages: InboxMessage[]
}

interface InboxDraft {
  body: string
  kind: 'reply' | 'note'
}

/** The conversations a status, a filter and a search keep, most recent first. */
function filterConversations(
  conversations: readonly InboxConversation[],
  {
    status = 'all',
    filter = 'all',
    query = '',
    currentUserId,
  }: {
    status?: InboxStatus | 'all'
    filter?: InboxFilter
    query?: string
    currentUserId?: string
  },
) {
  const q = query.trim().toLocaleLowerCase()
  return conversations
    .filter((c) => status === 'all' || c.status === status)
    .filter((c) =>
      filter === 'unread'
        ? c.unread === true
        : filter === 'mine'
          ? currentUserId !== undefined && c.assignee?.id === currentUserId
          : filter === 'unassigned'
            ? c.assignee === undefined
            : true,
    )
    .filter(
      (c) =>
        !q ||
        [c.subject, c.contact.name, c.contact.email ?? '', ...(c.labels ?? [])].some((s) =>
          s.toLocaleLowerCase().includes(q),
        ) ||
        c.messages.some((m) => m.body.toLocaleLowerCase().includes(q)),
    )
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
}

/** A time for the list: the hour today, the weekday this week, else the date. */
function formatInboxTime(date: Date | string, now: Date | number, locale: string) {
  const d = new Date(date)
  const n = new Date(now)
  const sameDay = d.toDateString() === n.toDateString()
  if (sameDay) return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const days = (+n - +d) / 86_400_000
  if (days >= 0 && days < 6) return d.toLocaleDateString(locale, { weekday: 'short' })
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() !== n.getFullYear() ? { year: 'numeric' } : {}),
  })
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

function PersonAvatar({ person, size }: { person: InboxPerson; size?: 'sm' | 'default' }) {
  return (
    <Avatar size={size}>
      {person.avatarUrl && <AvatarImage src={person.avatarUrl} alt="" />}
      <AvatarFallback>{initials(person.name)}</AvatarFallback>
    </Avatar>
  )
}

const STATUS_VARIANT = { open: 'default', pending: 'warning', closed: 'secondary' } as const

function InboxStatusBadge({ status }: { status: InboxStatus }) {
  const t = useCoreloomI18n().messages.inbox
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      <BadgeDot />
      {t.statuses[status]}
    </Badge>
  )
}

function Inbox({
  conversations,
  currentUser,
  teammates = [],
  selectedId: selectedProp,
  defaultSelectedId,
  onSelectedChange,
  defaultStatus = 'open',
  defaultFilter = 'all',
  onSend,
  onStatusChange,
  onAssign,
  onReadChange,
  now,
  className,
}: {
  conversations: InboxConversation[]
  /** Who is using the inbox: "Mine" filters on it, and it signs replies. */
  currentUser: InboxPerson
  /** People a conversation can be assigned to (the current user is added first). */
  teammates?: InboxPerson[]
  selectedId?: string | null
  defaultSelectedId?: string
  onSelectedChange?: (id: string | null) => void
  defaultStatus?: InboxStatus | 'all'
  defaultFilter?: InboxFilter
  /** Sends a reply or saves an internal note. Return a promise to keep the box busy until it ends. */
  onSend?: (conversationId: string, draft: InboxDraft) => void | Promise<void>
  onStatusChange?: (conversationId: string, status: InboxStatus) => void
  /** `null` unassigns. */
  onAssign?: (conversationId: string, personId: string | null) => void
  /** Opening an unread conversation calls it with `false`; Mark as unread with `true`. */
  onReadChange?: (conversationId: string, unread: boolean) => void
  /** The time to show list dates from; the current time by default. */
  now?: Date
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.inbox
  const baseId = React.useId()
  const [innerSelected, setInnerSelected] = React.useState<string | null>(defaultSelectedId ?? null)
  const selectedId = selectedProp === undefined ? innerSelected : selectedProp
  const [status, setStatus] = React.useState<InboxStatus | 'all'>(defaultStatus)
  const [filter, setFilter] = React.useState<InboxFilter>(defaultFilter)
  const [query, setQuery] = React.useState('')
  // On a phone the list and the thread take turns; `pane` says which one shows.
  const [pane, setPane] = React.useState<'list' | 'thread'>('list')
  const [announce, setAnnounce] = React.useState('')
  const threadRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const [clock] = React.useState(() => Date.now())
  const at = now ?? clock

  const shown = filterConversations(conversations, {
    status,
    filter,
    query,
    currentUserId: currentUser.id,
  })
  const current = conversations.find((c) => c.id === selectedId)
  const people = [currentUser, ...teammates.filter((p) => p.id !== currentUser.id)]

  const select = (id: string) => {
    setInnerSelected(id)
    onSelectedChange?.(id)
    setPane('thread')
    const c = conversations.find((x) => x.id === id)
    if (c?.unread) onReadChange?.(id, false)
    // On a phone the list hides: take focus to the thread so it isn't lost.
    requestAnimationFrame(() => {
      if (threadRef.current?.offsetParent && !listVisible()) threadRef.current.focus()
    })
  }

  const listVisible = () => (listRef.current ? listRef.current.offsetParent !== null : false)

  const back = () => {
    setPane('list')
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>('[aria-current=true]')?.focus()
    })
  }

  return (
    <div
      data-slot="inbox"
      className={cn(
        'flex h-[640px] min-w-0 overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div
        className={cn(
          'w-full min-w-0 flex-col border-border-subtle md:flex md:w-80 md:shrink-0 md:border-r',
          pane === 'list' ? 'flex' : 'hidden',
        )}
      >
        <div className="flex flex-col gap-2 border-b border-border-subtle p-3">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                }}
                placeholder={t.search}
                aria-label={t.search}
                className="h-8 pl-8 text-[13px]"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as InboxStatus | 'all')
              }}
            >
              <SelectTrigger size="sm" aria-label={t.status} className="w-[7.5rem] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t.statuses.open}</SelectItem>
                <SelectItem value="pending">{t.statuses.pending}</SelectItem>
                <SelectItem value="closed">{t.statuses.closed}</SelectItem>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SegmentedControl
            size="sm"
            fullWidth
            aria-label={t.filter}
            value={filter}
            onValueChange={(v) => {
              setFilter(v as InboxFilter)
            }}
            options={[
              { value: 'all', label: t.filters.all },
              { value: 'unread', label: t.filters.unread },
              { value: 'mine', label: t.filters.mine },
              { value: 'unassigned', label: t.filters.unassigned },
            ]}
          />
        </div>
        {shown.length === 0 ? (
          <p className="m-0 px-4 py-8 text-center text-[13px] text-muted-foreground">
            {conversations.length === 0 ? t.noConversations : t.noMatch}
          </p>
        ) : (
          <ul
            ref={listRef}
            aria-label={t.conversations}
            className="m-0 flex min-h-0 flex-1 list-none flex-col overflow-y-auto p-1.5"
          >
            {shown.map((c) => {
              const active = c.id === selectedId
              const last = c.messages.at(-1)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={active ? true : undefined}
                    onClick={() => {
                      select(c.id)
                    }}
                    className={cn(
                      'flex w-full cursor-pointer gap-3 rounded-md px-2.5 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                      active
                        ? 'bg-primary-subtle [&_.text-muted-foreground]:text-fg-secondary'
                        : 'hover:bg-accent/60',
                    )}
                  >
                    <PersonAvatar person={c.contact} size="sm" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'truncate text-[13px] text-foreground',
                            c.unread && 'font-semibold',
                          )}
                        >
                          {c.contact.name}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground">
                          {formatInboxTime(c.updatedAt, at, locale)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 truncate text-[12.5px]',
                          c.unread ? 'font-medium text-foreground' : 'text-fg-secondary',
                        )}
                      >
                        {c.unread && (
                          <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <span className="truncate">{c.subject}</span>
                      </span>
                      <span className="truncate text-[12px] text-muted-foreground">
                        {c.preview ?? last?.body}
                      </span>
                      <span className="sr-only">
                        {[
                          c.unread ? t.unread : undefined,
                          t.statuses[c.status],
                          c.assignee ? t.assignedTo(c.assignee.name) : t.unassigned,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div
        ref={threadRef}
        tabIndex={-1}
        aria-labelledby={current ? `${baseId}-subject` : undefined}
        aria-label={current ? undefined : t.conversation}
        role="region"
        className={cn(
          'min-w-0 flex-1 flex-col outline-none md:flex',
          pane === 'thread' ? 'flex' : 'hidden',
        )}
      >
        {current ? (
          <Thread
            key={current.id}
            conversation={current}
            people={people}
            subjectId={`${baseId}-subject`}
            onBack={back}
            onSend={onSend}
            onStatusChange={
              onStatusChange
                ? (s) => {
                    onStatusChange(current.id, s)
                    setAnnounce(t.statusSet(t.statuses[s]))
                  }
                : undefined
            }
            onAssign={
              onAssign
                ? (id) => {
                    onAssign(current.id, id)
                    const who = people.find((p) => p.id === id)
                    setAnnounce(who ? t.assignedTo(who.name) : t.unassigned)
                  }
                : undefined
            }
            onMarkUnread={
              onReadChange
                ? () => {
                    onReadChange(current.id, true)
                    setAnnounce(t.markedUnread)
                    back()
                  }
                : undefined
            }
            onSent={(kind) => {
              setAnnounce(kind === 'note' ? t.noteSaved : t.replySent)
            }}
          />
        ) : (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailIcon />
              </EmptyMedia>
              <EmptyTitle>{t.noSelection}</EmptyTitle>
              <EmptyDescription>{t.noSelectionHint}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  )
}

function Thread({
  conversation: c,
  people,
  subjectId,
  onBack,
  onSend,
  onStatusChange,
  onAssign,
  onMarkUnread,
  onSent,
}: {
  conversation: InboxConversation
  people: InboxPerson[]
  subjectId: string
  onBack: () => void
  onSend?: (conversationId: string, draft: InboxDraft) => void | Promise<void>
  onStatusChange?: (status: InboxStatus) => void
  onAssign?: (personId: string | null) => void
  onMarkUnread?: () => void
  onSent: (kind: InboxDraft['kind']) => void
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.inbox
  const scrollRef = React.useRef<HTMLOListElement>(null)

  // Open on the latest message.
  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [c.messages.length])

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2.5 md:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label={t.back}
          onClick={onBack}
        >
          <ArrowLeftIcon aria-hidden />
        </Button>
        <div className="flex min-w-0 flex-1 basis-48 flex-col">
          <p id={subjectId} className="m-0 truncate text-[14px] font-semibold text-foreground">
            {c.subject}
          </p>
          <p className="m-0 truncate text-[12.5px] text-muted-foreground">
            {c.contact.name}
            {c.contact.email ? ` · ${c.contact.email}` : ''}
            {c.channel ? ` · ${c.channel}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {onStatusChange ? (
            <Select
              value={c.status}
              onValueChange={(v) => {
                onStatusChange(v as InboxStatus)
              }}
            >
              <SelectTrigger size="sm" aria-label={t.status} className="w-[7.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t.statuses.open}</SelectItem>
                <SelectItem value="pending">{t.statuses.pending}</SelectItem>
                <SelectItem value="closed">{t.statuses.closed}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <InboxStatusBadge status={c.status} />
          )}
          {onAssign ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-40">
                  {c.assignee ? (
                    <Avatar size="sm" className="size-4">
                      {c.assignee.avatarUrl && <AvatarImage src={c.assignee.avatarUrl} alt="" />}
                      <AvatarFallback className="text-[8px]">
                        {initials(c.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserIcon aria-hidden />
                  )}
                  <span className="truncate">
                    <span className="sr-only">{t.assignee}: </span>
                    {c.assignee?.name ?? t.unassigned}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t.assignTo}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={c.assignee?.id ?? ''}
                  onValueChange={(v) => {
                    onAssign(v || null)
                  }}
                >
                  {people.map((p, i) => (
                    <DropdownMenuRadioItem key={p.id} value={p.id}>
                      {i === 0 ? t.me(p.name) : p.name}
                    </DropdownMenuRadioItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="">{t.unassigned}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : c.assignee ? (
            <span className="text-[12.5px] text-muted-foreground">
              {t.assignedTo(c.assignee.name)}
            </span>
          ) : null}
          {onMarkUnread && (
            <Button variant="ghost" size="icon-sm" aria-label={t.markUnread} onClick={onMarkUnread}>
              <MailOpenIcon aria-hidden />
            </Button>
          )}
        </div>
        {c.labels && c.labels.length > 0 && (
          <div className="flex w-full flex-wrap gap-1">
            {c.labels.map((l) => (
              <Badge key={l} variant="secondary" className="text-[11px]">
                {l}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ol
        ref={scrollRef}
        aria-label={t.messages}
        // A scrollable list must be reachable from the keyboard (axe: scrollable-region-focusable).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see above
        tabIndex={0}
        className="m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring md:p-4"
      >
        {c.messages.map((m) => (
          <li
            key={m.id}
            className={cn(
              'flex gap-3 rounded-lg border p-3',
              m.kind === 'note'
                ? 'border-warning/40 bg-warning-subtle'
                : m.kind === 'outgoing'
                  ? 'border-border-subtle bg-inset'
                  : 'border-border bg-card',
            )}
          >
            <PersonAvatar person={m.author} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[13px] font-medium text-foreground">{m.author.name}</span>
                {m.kind === 'note' && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-warning uppercase">
                    <StickyNoteIcon className="size-3" aria-hidden />
                    {t.internalNote}
                  </span>
                )}
                {m.kind === 'outgoing' && <span className="sr-only">{t.reply}</span>}
                <time
                  dateTime={new Date(m.sentAt).toISOString()}
                  className="ml-auto font-mono text-[11px] text-fg-secondary"
                >
                  {new Date(m.sentAt).toLocaleString(locale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <p className="m-0 text-[13px] leading-[1.6] break-words whitespace-pre-wrap text-foreground">
                {m.body}
              </p>
              {m.attachments && m.attachments.length > 0 && (
                <ul aria-label={t.attachments} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {m.attachments.map((a) => {
                    const label = (
                      <>
                        <PaperclipIcon className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{a.name}</span>
                        {a.size !== undefined && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {formatBytes(a.size, locale)}
                          </span>
                        )}
                      </>
                    )
                    const cls =
                      'inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[12px] text-foreground'
                    return (
                      <li key={a.name} className="max-w-full">
                        {a.href && /^(https?:|\/|#)/.test(a.href) ? (
                          <a
                            href={a.href}
                            download
                            className={cn(
                              cls,
                              'outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring',
                            )}
                          >
                            {label}
                          </a>
                        ) : (
                          <span className={cls}>{label}</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {onSend && <Composer conversation={c} onSend={onSend} onSent={onSent} />}
    </>
  )
}

function Composer({
  conversation,
  onSend,
  onSent,
}: {
  conversation: InboxConversation
  onSend: (conversationId: string, draft: InboxDraft) => void | Promise<void>
  onSent: (kind: InboxDraft['kind']) => void
}) {
  const t = useCoreloomI18n().messages.inbox
  const id = React.useId()
  const [kind, setKind] = React.useState<InboxDraft['kind']>('reply')
  const [body, setBody] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const send = async () => {
    const text = body.trim()
    if (!text || busy) return
    setBusy(true)
    setError(false)
    try {
      await onSend(conversation.id, { body: text, kind })
      setBody('')
      onSent(kind)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
      ref.current?.focus()
    }
  }

  return (
    <form
      aria-label={t.composer}
      aria-busy={busy || undefined}
      onSubmit={(e) => {
        e.preventDefault()
        void send()
      }}
      className={cn(
        'flex flex-col gap-2 border-t border-border-subtle p-3 md:px-4',
        kind === 'note' && 'bg-warning-subtle/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <SegmentedControl
          size="sm"
          aria-label={t.replyOrNote}
          value={kind}
          onValueChange={(v) => {
            setKind(v as InboxDraft['kind'])
          }}
          options={[
            { value: 'reply', label: t.reply },
            { value: 'note', label: t.internalNote },
          ]}
        />
        <span className="hidden text-[11.5px] text-muted-foreground sm:inline">
          {t.sendHint} <Kbd>Ctrl</Kbd> <Kbd>Enter</Kbd>
        </span>
      </div>
      <label htmlFor={`${id}-body`} className="sr-only">
        {kind === 'note' ? t.notePlaceholder : t.replyPlaceholder(conversation.contact.name)}
      </label>
      <Textarea
        ref={ref}
        id={`${id}-body`}
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            void send()
          }
        }}
        aria-invalid={error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={
          kind === 'note' ? t.notePlaceholder : t.replyPlaceholder(conversation.contact.name)
        }
        className="max-h-48 min-h-[72px] text-[13px]"
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="m-0 text-[12.5px] text-destructive">
          {t.sendError}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={!body.trim() || busy}>
          {busy ? (
            <Spinner aria-hidden />
          ) : kind === 'note' ? (
            <StickyNoteIcon aria-hidden />
          ) : (
            <SendIcon aria-hidden />
          )}
          {kind === 'note' ? t.saveNote : t.send}
        </Button>
      </div>
    </form>
  )
}

export {
  filterConversations,
  formatInboxTime,
  Inbox,
  type InboxAttachment,
  type InboxConversation,
  type InboxDraft,
  type InboxFilter,
  type InboxMessage,
  type InboxPerson,
  type InboxStatus,
  InboxStatusBadge,
}
