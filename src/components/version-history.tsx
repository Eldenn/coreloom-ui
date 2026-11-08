'use client'

// Coreloom UI — VersionHistory (block). The saved versions of a document, a diagram or a prompt:
// a list grouped by day (who, when, a name for the ones that matter), the selected version's
// content or its changes against the version before it (or the current one), Name and Restore.
// Pass each version's text as `content` to compare them with DiffViewer, or draw a version
// yourself with `renderPreview`. Restoring is your callback: usually it saves a new version.
import { HistoryIcon, RotateCcwIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { EditableText } from '@/components/ui/editable-text'
import { Label } from '@/components/ui/label'
import { Popconfirm } from '@/components/ui/popconfirm'
import { RelativeTime } from '@/components/ui/relative-time'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface DocumentVersion {
  id: string
  createdAt: Date
  /** A name given to the version ("Sent to legal"); unnamed versions are listed by their time. */
  name?: string
  author?: string
  /** What changed, in a few words. */
  summary?: string
  /** The version's text, to show it and compare it with DiffViewer. */
  content?: string
}

const TARGETS = ['previous', 'current', 'none'] as const
type CompareTarget = (typeof TARGETS)[number]

/** Versions by day, newest first, keeping each day's order. */
function groupVersionsByDay(versions: readonly DocumentVersion[]) {
  const sorted = [...versions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  const days: { day: Date; versions: DocumentVersion[] }[] = []
  for (const v of sorted) {
    const last = days.at(-1)
    if (last?.day.toDateString() === v.createdAt.toDateString()) last.versions.push(v)
    else days.push({ day: v.createdAt, versions: [v] })
  }
  return days
}

/** The version to compare with: the one saved just before, or the newest. */
function comparedVersion(
  versions: readonly DocumentVersion[],
  selected: DocumentVersion,
  target: CompareTarget,
) {
  if (target === 'none') return undefined
  const sorted = [...versions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  if (target === 'current') return sorted[0] === selected ? undefined : sorted[0]
  return sorted[sorted.indexOf(selected) + 1]
}

function VersionList({
  versions,
  selectedId,
  currentId,
  onSelect,
}: {
  versions: DocumentVersion[]
  selectedId: string
  currentId: string | undefined
  onSelect: (id: string) => void
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.versionHistory
  const day = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  const time = (d: Date) => d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  return (
    <nav aria-label={t.versions}>
      {groupVersionsByDay(versions).map((g) => (
        <div key={g.day.toDateString()} className="mb-2">
          <p className="m-0 px-3 pt-2 pb-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {day(g.day)}
          </p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {g.versions.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  aria-current={v.id === selectedId || undefined}
                  className="relative flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring aria-[current]:bg-secondary aria-[current]:before:absolute aria-[current]:before:inset-y-2 aria-[current]:before:left-0 aria-[current]:before:w-0.5 aria-[current]:before:rounded-full aria-[current]:before:bg-primary"
                  onClick={() => {
                    onSelect(v.id)
                  }}
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {v.name ?? time(v.createdAt)}
                    </span>
                    {v.id === currentId && (
                      <Badge variant="success" className="ml-auto shrink-0">
                        {t.current}
                      </Badge>
                    )}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {[v.name ? time(v.createdAt) : null, v.author].filter(Boolean).join(' · ')}
                  </span>
                  {v.summary && (
                    <span className="line-clamp-2 text-[12px] text-fg-secondary">{v.summary}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function VersionPreview({
  version,
  compared,
  renderPreview,
}: {
  version: DocumentVersion
  compared: DocumentVersion | undefined
  renderPreview?: (version: DocumentVersion) => React.ReactNode
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.versionHistory
  const name = (v: DocumentVersion) =>
    v.name ??
    v.createdAt.toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    })
  if (compared?.content !== undefined && version.content !== undefined)
    return (
      <DiffViewer
        before={compared.content}
        after={version.content}
        beforeLabel={name(compared)}
        afterLabel={name(version)}
        title={t.changesSince(name(compared))}
        emptyText={t.noChanges}
        wrap
      />
    )
  if (renderPreview) return <>{renderPreview(version)}</>
  if (version.content !== undefined)
    return (
      <pre className="m-0 rounded-md border border-border bg-inset px-4 py-3 font-mono text-[12.5px] leading-[1.6] whitespace-pre-wrap text-foreground">
        {version.content}
      </pre>
    )
  return <p className="m-0 text-[13px] text-muted-foreground">{t.noPreview}</p>
}

function VersionHeader({
  version,
  titleId,
  isCurrent,
  compare,
  onCompareChange,
  onRestore,
  onRename,
}: {
  version: DocumentVersion
  titleId: string
  isCurrent: boolean
  compare: CompareTarget
  onCompareChange: (target: CompareTarget) => void
  onRestore?: (id: string) => unknown
  onRename?: (id: string, name: string) => unknown
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.versionHistory
  const when = version.createdAt.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle px-4 py-3">
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-0.5">
        <p id={titleId} className="sr-only">
          {version.name ?? when}
        </p>
        {onRename ? (
          <EditableText
            key={version.id}
            defaultValue={version.name ?? ''}
            placeholder={t.namePlaceholder}
            label={t.nameLabel}
            maxLength={80}
            className="text-[14px] font-medium"
            onValueChange={(name) => void onRename(version.id, name.trim())}
          />
        ) : (
          <span aria-hidden className="truncate text-[14px] font-medium text-foreground">
            {version.name ?? when}
          </span>
        )}
        <span className="text-[12.5px] text-muted-foreground">
          {version.author ? t.savedBy(version.author) : t.saved}{' '}
          <RelativeTime date={version.createdAt} />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={compare}
          onValueChange={(v) => {
            const target = TARGETS.find((x) => x === v)
            if (target) onCompareChange(target)
          }}
        >
          <SelectTrigger size="sm" aria-label={t.compareWith} className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="previous">{t.compare.previous}</SelectItem>
            <SelectItem value="current">{t.compare.current}</SelectItem>
            <SelectItem value="none">{t.compare.none}</SelectItem>
          </SelectContent>
        </Select>
        {onRestore && !isCurrent && (
          <Popconfirm
            title={t.restoreTitle}
            description={t.restoreDescription}
            confirmLabel={t.restore}
            onConfirm={() => onRestore(version.id)}
          >
            <Button size="sm" variant="outline">
              <RotateCcwIcon />
              {t.restore}
            </Button>
          </Popconfirm>
        )}
      </div>
    </div>
  )
}

function VersionHistory({
  versions,
  currentId,
  defaultSelectedId,
  defaultCompare = 'previous',
  onRestore,
  onRename,
  renderPreview,
  className,
}: {
  /** Every saved version, in any order. */
  versions: DocumentVersion[]
  /** The version in use now (default: the newest). It can't be restored. */
  currentId?: string
  defaultSelectedId?: string
  /** What the selected version is compared with: the version before it, the current one, or nothing. */
  defaultCompare?: CompareTarget
  /** Makes this version the current one again. Shows Restore (asks first). */
  onRestore?: (id: string) => unknown
  /** Names a version, or clears its name with ''. Makes names editable. */
  onRename?: (id: string, name: string) => unknown
  /** Draws a version (a diagram, a rendered page) when there is no text to compare. */
  renderPreview?: (version: DocumentVersion) => React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.versionHistory
  const newest = groupVersionsByDay(versions).at(0)?.versions.at(0)
  const current = currentId ?? newest?.id
  const [selectedId, setSelectedId] = React.useState(defaultSelectedId ?? newest?.id ?? '')
  const [compare, setCompare] = React.useState<CompareTarget>(defaultCompare)
  const [namedOnly, setNamedOnly] = React.useState(false)
  const id = React.useId()
  const listed = namedOnly ? versions.filter((v) => Boolean(v.name) || v.id === current) : versions
  const selected = versions.find((v) => v.id === selectedId) ?? newest

  if (!selected)
    return (
      <div
        data-slot="version-history"
        className={cn(
          'flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center',
          className,
        )}
      >
        <HistoryIcon aria-hidden className="size-6 text-muted-foreground" />
        <p className="m-0 text-[14px] font-medium text-foreground">{t.empty}</p>
      </div>
    )

  const compared = comparedVersion(versions, selected, compare)

  return (
    <div
      data-slot="version-history"
      className={cn(
        'grid overflow-hidden rounded-lg border border-border bg-card md:h-[560px] md:grid-cols-[280px_minmax(0,1fr)]',
        className,
      )}
    >
      <div className="flex min-h-0 flex-col border-border max-md:max-h-72 max-md:border-b md:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
          <Label htmlFor={`${id}-named`} className="text-[12.5px] font-normal text-fg-secondary">
            {t.namedOnly}
          </Label>
          <Switch id={`${id}-named`} size="sm" checked={namedOnly} onCheckedChange={setNamedOnly} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
          <VersionList
            versions={listed}
            selectedId={selected.id}
            currentId={current}
            onSelect={setSelectedId}
          />
        </div>
      </div>
      <section aria-labelledby={`${id}-title`} className="flex min-h-0 min-w-0 flex-col">
        <VersionHeader
          version={selected}
          titleId={`${id}-title`}
          isCurrent={selected.id === current}
          compare={compare}
          onCompareChange={setCompare}
          onRestore={onRestore}
          onRename={onRename}
        />
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <VersionPreview version={selected} compared={compared} renderPreview={renderPreview} />
        </div>
      </section>
    </div>
  )
}

export {
  comparedVersion,
  type CompareTarget,
  type DocumentVersion,
  groupVersionsByDay,
  VersionHistory,
}
