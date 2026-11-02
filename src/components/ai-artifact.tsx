'use client'

// Coreloom UI — AI artifact (block). A document or a piece of code a model wrote, opened in a panel
// beside the chat: every version it went through, a before / after view of what changed, Copy,
// Download and Restore. Front-end only: the app keeps the versions (from a tool's output or `data-*`
// parts) and decides what Restore does.
//
//   const [open, setOpen] = React.useState(false)
//   <ArtifactLayout open={open} panel={<ArtifactPanel artifact={doc} onClose={() => setOpen(false)} />}>
//     <Chat … tools={{ writeDocument: { display: 'inline', render: () =>
//       <ArtifactCard title={doc.title} kind="markdown" versions={doc.versions.length}
//         active={open} onOpen={() => setOpen(true)} /> } }} />
//   </ArtifactLayout>
//
// Parts: ArtifactPanel (header, versions, Preview / Source / Changes), ArtifactCard (the chip in a
// message that opens it), ArtifactLayout (chat and panel side by side, resizable; the panel covers the
// chat when the space is narrow) and diffLines (the line diff behind Changes).
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
  DownloadIcon,
  FileTextIcon,
  PanelRightOpenIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react'
import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type DiffLine, diffLines, DiffViewer } from '@/components/ui/diff-viewer'
import { Markdown } from '@/components/ui/markdown'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** What the content is: Markdown (rendered in Preview), code (in `language`) or plain text. */
type ArtifactKind = 'markdown' | 'code' | 'text'

/** One state of the artifact. The last version is the latest. */
interface ArtifactVersion {
  id: string
  content: string
  /** What changed, in a few words: "Shorter intro", "Added error handling". */
  label?: string
  /** When the version was written; shown as a time next to the label. */
  createdAt?: Date | string
}

interface Artifact {
  id: string
  title: string
  kind: ArtifactKind
  /** For code: "tsx", "python", "sql"… shown as a badge and used for the file extension. */
  language?: string
  /** The downloaded file's name. Default: the title, slugged, with an extension from the kind. */
  filename?: string
  versions: readonly ArtifactVersion[]
}

type ArtifactView = 'preview' | 'source' | 'changes'

// ——— Download ———

const EXTENSIONS: Record<string, string> = {
  typescript: 'ts',
  ts: 'ts',
  tsx: 'tsx',
  javascript: 'js',
  js: 'js',
  jsx: 'jsx',
  python: 'py',
  py: 'py',
  ruby: 'rb',
  rust: 'rs',
  go: 'go',
  java: 'java',
  kotlin: 'kt',
  swift: 'swift',
  csharp: 'cs',
  'c#': 'cs',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  php: 'php',
  sql: 'sql',
  json: 'json',
  yaml: 'yaml',
  yml: 'yml',
  toml: 'toml',
  html: 'html',
  css: 'css',
  bash: 'sh',
  shell: 'sh',
  sh: 'sh',
  markdown: 'md',
  md: 'md',
}

/** The file name Download uses: `filename`, or the title in lowercase with dashes and an extension. */
function artifactFilename(artifact: Pick<Artifact, 'title' | 'kind' | 'language' | 'filename'>) {
  if (artifact.filename) return artifact.filename
  const ext =
    artifact.kind === 'markdown'
      ? 'md'
      : artifact.kind === 'code'
        ? (EXTENSIONS[artifact.language?.toLowerCase() ?? ''] ?? 'txt')
        : 'txt'
  const base =
    artifact.title
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'artifact'
  return `${base}.${ext}`
}

function download(content: string, filename: string, kind: ArtifactKind) {
  const type = kind === 'markdown' ? 'text/markdown' : 'text/plain'
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  // Some browsers start the download after the click returns: free the URL a moment later.
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

// ——— Panel ———

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function SourceView({ content, streaming }: { content: string; streaming: boolean }) {
  return (
    <pre
      data-slot="artifact-source"
      data-streaming={streaming || undefined}
      className="m-0 overflow-x-auto px-5 py-4 font-mono text-[13px] leading-[1.7] text-foreground"
    >
      <code>{content}</code>
    </pre>
  )
}

function ArtifactPanel({
  artifact,
  version: versionProp,
  defaultVersion,
  onVersionChange,
  view: viewProp,
  defaultView,
  onViewChange,
  streaming = false,
  onRestore,
  onClose,
  actions,
  className,
}: {
  artifact: Artifact
  /** The version shown, by id (controlled). Without it, the panel follows the latest version. */
  version?: string
  defaultVersion?: string
  onVersionChange?: (versionId: string) => void
  /** `preview` (Markdown only), `source` or `changes` (against the previous version). */
  view?: ArtifactView
  defaultView?: ArtifactView
  onViewChange?: (view: ArtifactView) => void
  /** The latest version is still being written: a caret, "Writing…", and Restore is held back. */
  streaming?: boolean
  /** Shown on older versions: "Restore this version". Add its content as a new version. */
  onRestore?: (version: ArtifactVersion) => void
  /** Shows a Close button in the header. */
  onClose?: () => void
  /** More buttons in the header, before Copy (Share, Open in editor…). */
  actions?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.ai.artifact
  const { versions, kind } = artifact
  const markdown = kind === 'markdown'

  // Uncontrolled, `null` means "the latest", so new versions show as they arrive.
  const [picked, setPicked] = React.useState<string | null>(defaultVersion ?? null)
  const wanted = versionProp ?? picked
  const found = wanted === null ? -1 : versions.findIndex((v) => v.id === wanted)
  const index = found === -1 ? versions.length - 1 : found
  const current = versions.at(index)
  const previous = index > 0 ? versions.at(index - 1) : undefined
  const latest = index === versions.length - 1
  const writing = streaming && latest

  const selectVersion = (i: number) => {
    const next = versions.at(i)
    if (!next) return
    setPicked(i === versions.length - 1 && versionProp === undefined ? null : next.id)
    onVersionChange?.(next.id)
  }

  const [viewState, setViewState] = React.useState<ArtifactView>(
    defaultView ?? (markdown ? 'preview' : 'source'),
  )
  let view = viewProp ?? viewState
  if (view === 'preview' && !markdown) view = 'source'

  const time = (value: Date | string | undefined) => {
    if (value === undefined) return undefined
    const date = typeof value === 'string' ? new Date(value) : value
    return Number.isNaN(date.getTime())
      ? undefined
      : new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
  }

  const KindIcon = kind === 'code' ? CodeIcon : FileTextIcon
  const content = current?.content ?? ''
  const at = time(current?.createdAt)

  return (
    <section
      data-slot="artifact-panel"
      aria-label={artifact.title}
      className={cn('flex h-full min-h-0 min-w-0 flex-col bg-background', className)}
    >
      <div className="flex min-h-14 items-center gap-2.5 border-b border-border-subtle py-2 pr-2 pl-4">
        <KindIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="m-0 truncate text-[14px] font-semibold text-foreground">{artifact.title}</p>
          <p className="m-0 flex min-w-0 items-center gap-1.5 text-[12px] text-muted-foreground">
            <span className="shrink-0">
              {kind === 'code' && artifact.language ? artifact.language : t.kinds[kind]}
            </span>
            {writing && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex shrink-0 items-center gap-1 text-primary-text">
                  <Spinner aria-hidden role={undefined} className="size-3" />
                  {t.writing}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {actions}
          <CopyButton value={content} label={t.copy} />
          <IconButton
            label={t.download}
            disabled={!current}
            onClick={() => {
              download(content, artifactFilename(artifact), kind)
            }}
          >
            <DownloadIcon />
          </IconButton>
          {onClose && (
            <IconButton label={t.close} onClick={onClose}>
              <XIcon />
            </IconButton>
          )}
        </div>
      </div>

      <Tabs
        value={view}
        onValueChange={(value) => {
          const next = value as ArtifactView
          setViewState(next)
          onViewChange?.(next)
        }}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border-subtle px-3 py-2">
          <TabsList aria-label={t.views}>
            {markdown && <TabsTrigger value="preview">{t.preview}</TabsTrigger>}
            <TabsTrigger value="source">{markdown ? t.source : t.kinds[kind]}</TabsTrigger>
            <TabsTrigger value="changes">{t.changes}</TabsTrigger>
          </TabsList>
          {versions.length > 1 && (
            <div role="group" aria-label={t.versions} className="flex min-w-0 items-center gap-1">
              <IconButton
                label={t.previousVersion}
                disabled={index <= 0}
                onClick={() => {
                  selectVersion(index - 1)
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <span className="min-w-0 truncate text-center text-[12.5px] text-muted-foreground">
                <span aria-hidden className="font-mono text-foreground tabular-nums">
                  {t.versionShort(index + 1)}
                </span>
                <span className="sr-only">{t.versionOf(index + 1, versions.length)}</span>
                {current?.label && <span> · {current.label}</span>}
                {at && <span> · {at}</span>}
              </span>
              <IconButton
                label={t.nextVersion}
                disabled={latest}
                onClick={() => {
                  selectVersion(index + 1)
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </div>
          )}
        </div>

        {!latest && current && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-inset px-4 py-2 text-[13px] text-muted-foreground">
            <span>{t.olderVersion(index + 1, versions.length)}</span>
            <span className="flex items-center gap-1.5">
              {onRestore && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={streaming}
                  onClick={() => {
                    onRestore(current)
                    // Uncontrolled, follow the latest again: the restored version the app appends.
                    if (versionProp === undefined) setPicked(null)
                  }}
                >
                  <RotateCcwIcon />
                  {t.restore}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectVersion(versions.length - 1)
                }}
              >
                {t.showLatest}
              </Button>
            </span>
          </div>
        )}

        <div
          className="min-h-0 flex-1 overflow-auto"
          aria-busy={writing || undefined}
          data-slot="artifact-content"
        >
          {!current || (content === '' && !writing) ? (
            <p className="m-0 p-5 text-[13.5px] text-muted-foreground">{t.empty}</p>
          ) : (
            <>
              {markdown && (
                <TabsContent value="preview" className="mx-auto max-w-3xl px-6 py-5">
                  <Markdown streaming={writing}>{content}</Markdown>
                </TabsContent>
              )}
              <TabsContent value="source">
                <SourceView content={content} streaming={writing} />
              </TabsContent>
              <TabsContent value="changes">
                {previous ? (
                  <>
                    <p className="m-0 px-4 pt-3 text-[12.5px] text-muted-foreground">
                      {t.comparedWith(index)}
                    </p>
                    <DiffViewer
                      data-slot="artifact-diff"
                      before={previous.content}
                      after={content}
                      emptyText={t.noChanges}
                    />
                  </>
                ) : (
                  <p className="m-0 p-5 text-[13.5px] text-muted-foreground">{t.firstVersion}</p>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </section>
  )
}

// ——— Card ———

function ArtifactCard({
  title,
  kind,
  language,
  versions,
  streaming = false,
  active = false,
  onOpen,
  className,
}: {
  title: string
  kind: ArtifactKind
  language?: string
  /** How many versions there are: "v3" from 2 on. */
  versions?: number
  /** Still being written: "Writing…" with a spinner. */
  streaming?: boolean
  /** The panel shows this artifact now. */
  active?: boolean
  onOpen: () => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.artifact
  const KindIcon = kind === 'code' ? CodeIcon : FileTextIcon
  return (
    <button
      type="button"
      data-slot="artifact-card"
      data-active={active || undefined}
      aria-expanded={active}
      onClick={onOpen}
      className={cn(
        'group/artifact flex w-full max-w-md cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors outline-none hover:border-border-strong hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring data-[active]:border-primary',
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-inset text-muted-foreground">
        <KindIcon aria-hidden className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13.5px] font-medium text-foreground">{title}</span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          {kind === 'code' && language ? language : t.kinds[kind]}
          {versions !== undefined && versions > 1 && (
            <Badge variant="outline" className="h-4 px-1.5 font-mono text-[10.5px]">
              {t.versionShort(versions)}
            </Badge>
          )}
          {streaming && (
            <span className="inline-flex items-center gap-1 text-primary-text">
              <Spinner aria-hidden role={undefined} className="size-3" />
              {t.writing}
            </span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[12.5px] text-muted-foreground group-hover/artifact:text-foreground">
        <span className="max-sm:sr-only">{t.open}</span>
        <PanelRightOpenIcon aria-hidden className="size-4" />
      </span>
    </button>
  )
}

// ——— Layout ———

/** The root's width, read after layout (and 0 before), so the layout can switch to stacking. */
function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [ref])
  return width
}

function ArtifactLayout({
  open,
  panel,
  children,
  defaultSize = '50%',
  minSize = '30%',
  stackBelow = 720,
  className,
}: {
  /** Whether the panel shows. */
  open: boolean
  /** The `ArtifactPanel`, or anything to show beside the chat. */
  panel: React.ReactNode
  /** The chat. It stays mounted while the panel opens and closes, so its draft and scroll stay. */
  children: React.ReactNode
  /** The panel's starting width (percent string, or pixels). */
  defaultSize?: string | number
  minSize?: string | number
  /** Below this width (px) the panel covers the chat instead of sitting beside it. */
  stackBelow?: number
  className?: string
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const width = useWidth(rootRef)
  const stacked = width > 0 && width < stackBelow

  // Opening moves focus into the panel; closing gives it back to whatever opened it (the card), but
  // only when focus was in the panel — someone typing in the chat keeps their place.
  const openerRef = React.useRef<HTMLElement | null>(null)
  const focusInside = React.useRef(false)
  const wasOpen = React.useRef(open)
  React.useEffect(() => {
    if (open && !wasOpen.current) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      panelRef.current?.focus()
    } else if (!open && wasOpen.current) {
      const lost = document.activeElement === document.body || document.activeElement === null
      if (focusInside.current || lost) {
        const opener = openerRef.current
        // A panel that started open has no opener: the last card in the chat, else the composer.
        const root = rootRef.current
        const fallback =
          [...(root?.querySelectorAll<HTMLElement>('[data-slot="artifact-card"]') ?? [])].at(-1) ??
          root?.querySelector<HTMLElement>('textarea, [contenteditable="true"]')
        if (opener?.isConnected && opener !== document.body) opener.focus()
        else fallback?.focus()
      }
      focusInside.current = false
    }
    wasOpen.current = open
  }, [open])

  const panelBox = open && (
    <div
      ref={panelRef}
      tabIndex={-1}
      data-slot="artifact-layout-panel"
      className={cn(
        'h-full min-h-0 outline-none',
        stacked && 'absolute inset-0 z-10 border-l-0 bg-background',
      )}
      onFocus={() => {
        focusInside.current = true
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) focusInside.current = false
      }}
    >
      {panel}
    </div>
  )

  return (
    <div
      ref={rootRef}
      data-slot="artifact-layout"
      data-stacked={stacked || undefined}
      className={cn('relative h-full min-h-0 w-full', className)}
    >
      {/* The chat is always the group's first panel, so opening the artifact never remounts it. */}
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="chat" minSize="30%">
          <div className="h-full min-h-0" inert={open && stacked}>
            {children}
          </div>
        </ResizablePanel>
        {open && !stacked && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel id="artifact" defaultSize={defaultSize} minSize={minSize}>
              {panelBox}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      {stacked && panelBox}
    </div>
  )
}

export {
  type Artifact,
  ArtifactCard,
  artifactFilename,
  type ArtifactKind,
  ArtifactLayout,
  ArtifactPanel,
  type ArtifactVersion,
  type ArtifactView,
  type DiffLine,
  diffLines,
}
