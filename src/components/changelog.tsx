'use client'

// Coreloom UI — Changelog (changelog block). A product's public changelog page: one entry per
// release with its date, version, title, an image or video, and its changes tagged New, Improved,
// Fixed, Security or Deprecated. Chips filter by kind; older entries show on demand; every entry
// has its own anchor to link to. The entries come from the app (a CMS, Markdown files, an API).
import { LinkIcon, RssIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChipGroup } from '@/components/ui/chip-group'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const CHANGE_KINDS = ['new', 'improved', 'fixed', 'security', 'deprecated'] as const
type ChangeKind = (typeof CHANGE_KINDS)[number]

interface ChangelogChange {
  kind: ChangeKind
  text: React.ReactNode
}

interface ChangelogEntry {
  /** Also the entry's anchor: `#<id>`. */
  id: string
  date: Date
  /** "2.4.0". */
  version?: string
  title: React.ReactNode
  /** A paragraph under the title. */
  summary?: React.ReactNode
  /** A screenshot or a video, full width under the summary. */
  media?: React.ReactNode
  /** The list of changes, each tagged with its kind. */
  changes?: ChangelogChange[]
  /** Anything else (rich text), after the changes. */
  body?: React.ReactNode
}

const kindVariant = {
  new: 'success',
  improved: 'default',
  fixed: 'secondary',
  security: 'warning',
  deprecated: 'outline',
} as const

/** "2026-10-14", in local time (toISOString would shift late-evening dates to the next day). */
function isoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** The kinds an entry's changes use, in the order of CHANGE_KINDS. */
function changeKinds(entry: ChangelogEntry): ChangeKind[] {
  const used = new Set(entry.changes?.map((c) => c.kind))
  return CHANGE_KINDS.filter((k) => used.has(k))
}

/**
 * The entries that have at least one change of the given kinds, each keeping only those changes.
 * No kinds: every entry, unchanged.
 */
function filterChangelog(entries: ChangelogEntry[], kinds: readonly ChangeKind[]) {
  if (kinds.length === 0) return entries
  const keep = new Set(kinds)
  return entries.flatMap((entry) => {
    const changes = entry.changes?.filter((c) => keep.has(c.kind)) ?? []
    return changes.length ? [{ ...entry, changes }] : []
  })
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.changelog
  const titleId = `${entry.id}-title`
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(entry.date)
  return (
    <article
      id={entry.id}
      aria-labelledby={titleId}
      tabIndex={-1}
      className="grid scroll-mt-24 gap-4 rounded-md border-t border-border-subtle pt-10 outline-none first:border-t-0 first:pt-0 focus-visible:ring-[3px] focus-visible:ring-ring md:grid-cols-[180px_minmax(0,1fr)] md:gap-10"
    >
      <div className="flex flex-row flex-wrap items-center gap-3 self-start md:sticky md:top-24 md:flex-col md:items-start md:gap-2">
        <time dateTime={isoDate(entry.date)} className="text-[13.5px] text-muted-foreground">
          {date}
        </time>
        {!!entry.version && (
          <Badge variant="outline" className="font-mono">
            {t.version(entry.version)}
          </Badge>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="group flex items-start gap-2">
          <h2
            id={titleId}
            className="m-0 font-display text-[24px] leading-[1.25] font-semibold tracking-[-0.015em] text-foreground"
          >
            {entry.title}
          </h2>
          <a
            href={`#${entry.id}`}
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm text-fg-secondary outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <LinkIcon aria-hidden className="size-4" />
            <span className="sr-only">{t.link}</span>
          </a>
        </div>
        {!!entry.summary && (
          <p className="m-0 max-w-[70ch] text-[15px] leading-[1.65] text-fg-secondary">
            {entry.summary}
          </p>
        )}
        {!!entry.media && (
          <div className="overflow-hidden rounded-lg border border-border bg-inset [&>img]:w-full [&>video]:w-full">
            {entry.media}
          </div>
        )}
        {!!entry.changes?.length && (
          <ul className="m-0 flex max-w-[70ch] list-none flex-col gap-2.5 p-0">
            {entry.changes.map((change, i) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- an entry's changes are a static list
              <li key={i} className="flex items-start gap-3 text-[14.5px] leading-[1.6]">
                <Badge
                  variant={kindVariant[change.kind]}
                  className="mt-0.5 min-w-24 shrink-0 justify-center"
                >
                  {t.kinds[change.kind]}
                </Badge>
                <span className="min-w-0 text-fg-secondary">{change.text}</span>
              </li>
            ))}
          </ul>
        )}
        {!!entry.body && (
          <div className="max-w-[70ch] text-[15px] leading-[1.65] text-fg-secondary [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-4 [&_p]:my-3">
            {entry.body}
          </div>
        )}
      </div>
    </article>
  )
}

function Changelog({
  entries,
  title,
  description,
  feedUrl,
  onSubscribe,
  pageSize = 10,
  kinds: kindsProp,
  defaultKinds = [],
  onKindsChange,
  className,
}: {
  /** Newest first. */
  entries: ChangelogEntry[]
  /** The page's title (an `h1`). Leave it out when the page already has one. */
  title?: React.ReactNode
  description?: React.ReactNode
  /** An RSS or Atom feed: shows a "Feed" link. */
  feedUrl?: string
  /** Shows "Subscribe to updates" (open your own form or dialog). */
  onSubscribe?: () => void
  /** Entries shown before "Show older updates". Default 10. */
  pageSize?: number
  /** The kinds to show; empty shows everything. */
  kinds?: ChangeKind[]
  defaultKinds?: ChangeKind[]
  onKindsChange?: (kinds: ChangeKind[]) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.changelog
  const [innerKinds, setInnerKinds] = React.useState<ChangeKind[]>(defaultKinds)
  const kinds = kindsProp ?? innerKinds
  const [shown, setShown] = React.useState(pageSize)
  const listRef = React.useRef<HTMLDivElement>(null)
  const filtered = filterChangelog(entries, kinds)
  const visible = filtered.slice(0, shown)
  const used = CHANGE_KINDS.filter((k) => entries.some((e) => changeKinds(e).includes(k)))

  function showOlder() {
    const first = visible.length
    setShown((n) => n + pageSize)
    // Focus the first entry that appeared: the button may be gone, and that's where reading resumes.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLElement>(':scope > article')[first]?.focus()
    })
  }

  return (
    <div data-slot="changelog" className={cn('flex w-full flex-col gap-10', className)}>
      {(!!title || !!description || !!feedUrl || !!onSubscribe) && (
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            {!!title && (
              <h1 className="m-0 font-display text-[clamp(32px,4vw,44px)] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
                {title}
              </h1>
            )}
            {!!description && (
              <p className="m-0 max-w-[60ch] text-[16px] leading-[1.6] text-fg-secondary">
                {description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {!!feedUrl && (
              <Button asChild variant="ghost">
                <a href={feedUrl}>
                  <RssIcon aria-hidden />
                  {t.feed}
                </a>
              </Button>
            )}
            {!!onSubscribe && (
              <Button variant="secondary" onClick={onSubscribe}>
                {t.subscribe}
              </Button>
            )}
          </div>
        </header>
      )}
      {used.length > 1 && (
        <ChipGroup
          aria-label={t.filter}
          value={kinds}
          onValueChange={(v) => {
            const next = CHANGE_KINDS.filter((k) => v.includes(k))
            setInnerKinds(next)
            onKindsChange?.(next)
          }}
          options={used.map((k) => ({ value: k, label: t.kinds[k] }))}
        />
      )}
      <div ref={listRef} className="flex flex-col gap-10">
        {visible.map((entry) => (
          <Entry key={entry.id} entry={entry} />
        ))}
      </div>
      {filtered.length === 0 && <p className="m-0 text-[14px] text-muted-foreground">{t.empty}</p>}
      {filtered.length > visible.length && (
        <Button variant="secondary" className="self-center" onClick={showOlder}>
          {t.showOlder}
        </Button>
      )}
    </div>
  )
}

export {
  CHANGE_KINDS,
  type ChangeKind,
  changeKinds,
  Changelog,
  type ChangelogChange,
  type ChangelogEntry,
  filterChangelog,
}
