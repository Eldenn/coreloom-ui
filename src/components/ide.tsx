'use client'

// Coreloom UI — IDE (block). A code workspace in the page, laid out like VS Code: a file explorer,
// tabs of open files, the CodeEditor, a bottom panel (Problems, plus your own: an output, a
// terminal, a preview) and a status bar. Everything runs in the browser: the files are props, and
// saving, running and checking code are callbacks your app wires (`onSave`, `onRun`,
// `diagnostics`). Shortcuts work while focus is inside the IDE: Mod-S saves, Mod-P finds a file,
// Mod-Shift-P opens the commands, Mod-B shows or hides the explorer, Mod-J the panel.
import type { EditorView } from '@codemirror/view'
import {
  CheckIcon,
  CircleXIcon,
  FileBracesIcon,
  FileCodeIcon,
  FileIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  InfoIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PencilIcon,
  PlayIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  TriangleAlertIcon,
  WrapTextIcon,
} from 'lucide-react'
import * as React from 'react'
import type { PanelImperativeHandle } from 'react-resizable-panels'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  CODE_EDITOR_LANGUAGES,
  CodeEditor,
  type CodeEditorCursor,
  type CodeEditorDiagnostic,
  type CodeEditorLanguage,
  languageFromPath,
  useLanguageName,
} from '@/components/ui/code-editor'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TreeView, type TreeViewNode } from '@/components/ui/tree-view'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface IdeFile {
  /** Relative, with "/" between folders: "src/app.tsx". Folders come from the paths. */
  path: string
  content: string
  /** Overrides the language found from the extension. */
  language?: CodeEditorLanguage
  readOnly?: boolean
}

/** A tab of the bottom panel, next to Problems: an output, a terminal, a preview. */
interface IdePanel {
  id: string
  label: string
  content: React.ReactNode
}

type SaveState = 'idle' | 'saving' | 'saved' | 'failed'

function baseName(path: string) {
  return path.split('/').pop() ?? path
}

function folderOf(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

/** The folders that contain a path, outermost first: "a/b/c.ts" → ["a", "a/b"]. */
function ancestorsOf(path: string) {
  const parts = path.split('/').slice(0, -1)
  return parts.map((_, i) => parts.slice(0, i + 1).join('/'))
}

/**
 * Checks a path typed for a new or renamed file. Returns the clean path, or why it can't be used:
 * "empty", "invalid" (absolute, "..", empty segments, a backslash) or "exists".
 */
function checkFilePath(
  input: string,
  existing: readonly string[],
): { path: string } | { error: 'empty' | 'invalid' | 'exists' } {
  const path = input.trim()
  if (!path) return { error: 'empty' }
  const parts = path.split('/')
  if (
    path.startsWith('/') ||
    path.includes('\\') ||
    parts.some((p) => p === '' || p === '.' || p === '..')
  )
    return { error: 'invalid' }
  // A file can't take the place of a folder, nor sit inside a file.
  const clash = existing.some(
    (e) => e === path || e.startsWith(`${path}/`) || path.startsWith(`${e}/`),
  )
  if (clash) return { error: 'exists' }
  return { path }
}

function FileTypeIcon({ path }: { path: string }) {
  const language = languageFromPath(path)
  if (language === 'json') return <FileBracesIcon className="text-warning" />
  if (language === 'markdown' || language === 'text')
    return language === 'text' ? <FileIcon /> : <FileTextIcon className="text-info" />
  return <FileCodeIcon className="text-info" />
}

/** The explorer's nodes from flat paths: folders first, then files, each sorted by name. */
function fileTree(paths: readonly string[]): TreeViewNode[] {
  interface Dir {
    dirs: Map<string, Dir>
    files: string[]
  }
  const root: Dir = { dirs: new Map(), files: [] }
  for (const path of paths) {
    let dir = root
    for (const part of path.split('/').slice(0, -1)) {
      let next = dir.dirs.get(part)
      if (!next) {
        next = { dirs: new Map(), files: [] }
        dir.dirs.set(part, next)
      }
      dir = next
    }
    dir.files.push(path)
  }
  const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' })
  const build = (dir: Dir, prefix: string): TreeViewNode[] => [
    ...[...dir.dirs.keys()].sort(byName).map((name) => {
      const id = `dir:${prefix}${name}`
      const child = dir.dirs.get(name) ?? { dirs: new Map<string, Dir>(), files: [] }
      return {
        id,
        label: name,
        icon: (open: boolean) => (open ? <FolderOpenIcon /> : <FolderIcon />),
        children: build(child, `${prefix}${name}/`),
      }
    }),
    ...[...dir.files]
      .sort((a, b) => byName(baseName(a), baseName(b)))
      .map((path) => ({
        id: `file:${path}`,
        label: baseName(path),
        icon: <FileTypeIcon path={path} />,
      })),
  ]
  return build(root, '')
}

function useCompact(ref: React.RefObject<HTMLElement | null>, below: number) {
  const [compact, setCompact] = React.useState(false)
  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < below)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref, below])
  return compact
}

const subscribeNothing = () => () => undefined

/** ⌘ or Ctrl: read on the client only, so server and first client render agree (Ctrl). */
function useIsMac() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  )
}

function Shortcut({ keys }: { keys: string[] }) {
  return (
    <KbdGroup>
      {keys.map((k) => (
        <Kbd key={k}>{k}</Kbd>
      ))}
    </KbdGroup>
  )
}

function IconButton({
  label,
  shortcut,
  pressed,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  pressed?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-pressed={pressed}
          aria-keyshortcuts={shortcut}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

interface IdeProps {
  /** The project's files (controlled). */
  files?: IdeFile[]
  defaultFiles?: IdeFile[]
  /** Every edit, creation, rename and deletion: the new list of files. */
  onFilesChange?: (files: IdeFile[]) => void
  /** Files open in tabs at first (paths), and the one shown. */
  defaultOpen?: string[]
  defaultActive?: string
  /**
   * Mod-S, the Save command or Save all: store the file. Resolve to mark it saved, reject to say
   * it failed. Without `onSave`, files are never marked modified.
   */
  onSave?: (file: IdeFile) => void | Promise<void>
  /** Shows Run in the title bar: run the project (in a worker, a sandboxed iframe, your API). */
  onRun?: (files: IdeFile[], active: string | undefined) => void
  running?: boolean
  /** Problems by file path, shown in the code and in the Problems panel. */
  diagnostics?: Record<string, CodeEditorDiagnostic[]>
  /** More tabs in the bottom panel, after Problems. */
  panels?: IdePanel[]
  /** The bottom panel is shown (controlled): open it when your app runs something. */
  panelOpen?: boolean
  defaultPanelOpen?: boolean
  onPanelOpenChange?: (open: boolean) => void
  /** The bottom panel's tab: "problems" or a panel's id (controlled). */
  panel?: string
  defaultPanel?: string
  onPanelChange?: (panel: string) => void
  /** The project's name in the title bar. */
  title?: React.ReactNode
  /** At the end of the title bar: a share button, a branch picker. */
  actions?: React.ReactNode
  /** Nothing can be edited, created, renamed or deleted. */
  readOnly?: boolean
  /** Shows New file, Rename and Delete. */
  fileOperations?: boolean
  defaultWrap?: boolean
  tabSize?: number
  className?: string
  'aria-label'?: string
}

function Ide({
  files: filesProp,
  defaultFiles = [],
  onFilesChange,
  defaultOpen,
  defaultActive,
  onSave,
  onRun,
  running = false,
  diagnostics = {},
  panels = [],
  panelOpen: panelOpenProp,
  defaultPanelOpen = false,
  onPanelOpenChange,
  panel: panelProp,
  defaultPanel = 'problems',
  onPanelChange,
  title,
  actions,
  readOnly = false,
  fileOperations = true,
  defaultWrap = false,
  tabSize = 2,
  className,
  'aria-label': ariaLabel,
}: IdeProps) {
  const t = useCoreloomI18n().messages.ide
  const common = useCoreloomI18n().messages.common
  const nameOf = useLanguageName()
  const id = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const compact = useCompact(rootRef, 640)
  const mac = useIsMac()
  const mod = mac ? '⌘' : 'Ctrl'

  const [innerFiles, setInnerFiles] = React.useState(defaultFiles)
  const files = filesProp ?? innerFiles
  const setFiles = (next: IdeFile[]) => {
    if (filesProp === undefined) setInnerFiles(next)
    onFilesChange?.(next)
  }
  const paths = files.map((f) => f.path)
  const fileAt = (path: string | undefined) => files.find((f) => f.path === path)

  const [open, setOpen] = React.useState<string[]>(() => {
    const first =
      defaultOpen ?? (defaultActive ? [defaultActive] : files.slice(0, 1).map((f) => f.path))
    return first.filter((p) => files.some((f) => f.path === p))
  })
  const [activeState, setActiveState] = React.useState<string | undefined>(defaultActive ?? open[0])
  // Files can disappear from a controlled list: keep only tabs that still exist.
  const openTabs = open.filter((p) => paths.includes(p))
  const active = activeState && openTabs.includes(activeState) ? activeState : openTabs[0]
  const activeFile = fileAt(active)

  // What was last saved, per path: a file whose text differs is modified.
  const [saved, setSaved] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(files.map((f) => [f.path, f.content])),
  )
  const isDirty = (file: IdeFile) => onSave !== undefined && saved[file.path] !== file.content
  const [saveState, setSaveState] = React.useState<SaveState>('idle')
  const [announcement, setAnnouncement] = React.useState('')

  const [expanded, setExpanded] = React.useState<string[]>(() =>
    active ? ancestorsOf(active).map((p) => `dir:${p}`) : [],
  )
  const [explorerOpen, setExplorerOpen] = React.useState(true)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [innerPanelOpen, setInnerPanelOpen] = React.useState(defaultPanelOpen)
  const panelOpen = panelOpenProp ?? innerPanelOpen
  const setPanelOpen = (next: boolean | ((open: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(panelOpen) : next
    if (panelOpenProp === undefined) setInnerPanelOpen(value)
    if (value !== panelOpen) onPanelOpenChange?.(value)
  }
  const [innerPanel, setInnerPanel] = React.useState(defaultPanel)
  const panel = panelProp ?? innerPanel
  const setPanel = (next: string) => {
    if (panelProp === undefined) setInnerPanel(next)
    if (next !== panel) onPanelChange?.(next)
  }
  const [wrap, setWrap] = React.useState(defaultWrap)
  const [cursor, setCursor] = React.useState<CodeEditorCursor>({ line: 1, column: 1, selected: 0 })
  const [palette, setPalette] = React.useState<'files' | 'commands' | 'language' | null>(null)
  const [pathDialog, setPathDialog] = React.useState<{
    mode: 'new' | 'rename'
    from?: string
  } | null>(null)
  const [toDelete, setToDelete] = React.useState<string | null>(null)
  const viewRef = React.useRef<EditorView | null>(null)
  const explorerPanel = React.useRef<PanelImperativeHandle | null>(null)
  const bottomPanelRef = React.useRef<PanelImperativeHandle | null>(null)
  // Open or collapse the resizable panels when their state changes (a button, a shortcut).
  React.useEffect(() => {
    const panel = explorerPanel.current
    if (!panel) return
    if (explorerOpen && panel.isCollapsed()) panel.expand()
    else if (!explorerOpen && !panel.isCollapsed()) panel.collapse()
  }, [explorerOpen, compact])
  React.useEffect(() => {
    const panel = bottomPanelRef.current
    if (!panel) return
    if (panelOpen && panel.isCollapsed()) {
      panel.expand()
      if (panel.getSize().asPercentage < 10) panel.resize('32%')
    } else if (!panelOpen && !panel.isCollapsed()) panel.collapse()
  }, [panelOpen, compact])
  const [reveal, setReveal] = React.useState<{ path: string; line: number; column: number } | null>(
    null,
  )

  const openFile = (path: string, options?: { focus?: boolean }) => {
    if (!paths.includes(path)) return
    if (!open.includes(path)) setOpen([...openTabs, path])
    setActiveState(path)
    setExpanded((prev) => [
      ...prev,
      ...ancestorsOf(path)
        .map((p) => `dir:${p}`)
        .filter((d) => !prev.includes(d)),
    ])
    setSheetOpen(false)
    if (options?.focus !== false) requestAnimationFrame(() => viewRef.current?.focus())
  }

  const closeTab = (path: string) => {
    const index = openTabs.indexOf(path)
    const next = openTabs.filter((p) => p !== path)
    setOpen(next)
    if (path === active) {
      const neighbour = next[Math.min(index, next.length - 1)]
      setActiveState(neighbour)
      // Focus moves to the tab that takes its place, or the tab bar's empty state.
      requestAnimationFrame(() => {
        const target = neighbour
          ? document.getElementById(`${id}-tab-${neighbour}`)
          : rootRef.current?.querySelector<HTMLElement>('[data-slot=ide-empty]')
        target?.focus()
      })
    }
  }

  const save = async (paths: string[]) => {
    if (!onSave) return
    const targets = files.filter((f) => paths.includes(f.path) && isDirty(f))
    if (targets.length === 0) return
    setSaveState('saving')
    try {
      for (const file of targets) await onSave(file)
      setSaved((prev) => ({
        ...prev,
        ...Object.fromEntries(targets.map((f) => [f.path, f.content])),
      }))
      setSaveState('saved')
      setAnnouncement(
        targets.length === 1
          ? t.savedFile(baseName(targets[0]?.path ?? ''))
          : t.savedFiles(targets.length),
      )
    } catch {
      setSaveState('failed')
      setAnnouncement(t.saveFailed)
    }
  }

  const updateContent = (path: string, content: string) => {
    setFiles(files.map((f) => (f.path === path ? { ...f, content } : f)))
    if (saveState !== 'saving') setSaveState('idle')
  }

  const setLanguage = (path: string, language: CodeEditorLanguage) => {
    setFiles(files.map((f) => (f.path === path ? { ...f, language } : f)))
    requestAnimationFrame(() => viewRef.current?.focus())
  }

  const createOrRename = (path: string) => {
    if (pathDialog?.mode === 'rename' && pathDialog.from) {
      const from = pathDialog.from
      setFiles(files.map((f) => (f.path === from ? { ...f, path } : f)))
      setOpen(openTabs.map((p) => (p === from ? path : p)))
      if (active === from) setActiveState(path)
      setSaved((prev) => {
        if (!(from in prev)) return prev
        const { [from]: before, ...rest } = prev
        return { ...rest, [path]: before }
      })
      setAnnouncement(t.renamed(baseName(from), baseName(path)))
    } else {
      setFiles([...files, { path, content: '' }])
      setOpen([...openTabs, path])
      setActiveState(path)
      setAnnouncement(t.created(baseName(path)))
    }
    setExpanded((prev) => [
      ...prev,
      ...ancestorsOf(path)
        .map((p) => `dir:${p}`)
        .filter((d) => !prev.includes(d)),
    ])
    setPathDialog(null)
    requestAnimationFrame(() => viewRef.current?.focus())
  }

  const deleteFile = (path: string) => {
    setFiles(files.filter((f) => f.path !== path))
    closeTab(path)
    setAnnouncement(t.deleted(baseName(path)))
    setToDelete(null)
  }

  const problems = Object.entries(diagnostics).flatMap(([path, list]) =>
    paths.includes(path) ? list.map((d) => ({ ...d, path })) : [],
  )
  const errorCount = problems.filter((p) => p.severity === 'error').length
  const warningCount = problems.filter((p) => p.severity === 'warning').length

  // Jump to a problem once its file is the one in the editor.
  React.useEffect(() => {
    const view = viewRef.current
    if (!reveal || !view || reveal.path !== active) return
    const doc = view.state.doc
    const line = doc.line(Math.min(Math.max(reveal.line, 1), doc.lines))
    const pos = line.from + Math.min(Math.max(reveal.column - 1, 0), line.length)
    view.dispatch({ selection: { anchor: pos }, scrollIntoView: true })
    view.focus()
    setReveal(null)
  }, [reveal, active])

  const editable = !readOnly
  const canEditFiles = editable && fileOperations
  const toggleExplorer = () => {
    if (compact) setSheetOpen((o) => !o)
    else setExplorerOpen((o) => !o)
  }

  const commands: {
    id: string
    label: string
    icon: React.ReactNode
    keys?: string[]
    run: () => void
    hidden?: boolean
  }[] = [
    {
      id: 'save',
      label: t.save,
      icon: <SaveIcon />,
      keys: [mod, 'S'],
      run: () => void save(active ? [active] : []),
      hidden: !onSave || !active,
    },
    {
      id: 'save-all',
      label: t.saveAll,
      icon: <SaveIcon />,
      run: () => void save(paths),
      hidden: !onSave,
    },
    {
      id: 'new',
      label: t.newFile,
      icon: <FilePlusIcon />,
      run: () => {
        setPathDialog({ mode: 'new' })
      },
      hidden: !canEditFiles,
    },
    {
      id: 'rename',
      label: t.renameFile,
      icon: <PencilIcon />,
      run: () => {
        if (active) setPathDialog({ mode: 'rename', from: active })
      },
      hidden: !canEditFiles || !active,
    },
    {
      id: 'delete',
      label: t.deleteFile,
      icon: <Trash2Icon />,
      run: () => {
        if (active) setToDelete(active)
      },
      hidden: !canEditFiles || !active,
    },
    {
      id: 'run',
      label: t.run,
      icon: <PlayIcon />,
      run: () => onRun?.(files, active),
      hidden: !onRun || running,
    },
    {
      id: 'explorer',
      label: t.toggleExplorer,
      icon: <PanelLeftIcon />,
      keys: [mod, 'B'],
      run: toggleExplorer,
    },
    {
      id: 'panel',
      label: t.togglePanel,
      icon: <PanelBottomIcon />,
      keys: [mod, 'J'],
      run: () => {
        setPanelOpen((o) => !o)
      },
    },
    {
      id: 'language',
      label: t.changeLanguage,
      icon: <FileCodeIcon />,
      run: () => {
        setPalette('language')
      },
      hidden: !active,
    },
    {
      id: 'wrap',
      label: t.toggleWrap,
      icon: <WrapTextIcon />,
      run: () => {
        setWrap((w) => !w)
      },
    },
  ]

  const onKeyDown = (e: React.KeyboardEvent) => {
    const modKey = mac ? e.metaKey : e.ctrlKey
    if (!modKey || e.altKey) return
    const key = e.key.toLowerCase()
    const handled =
      key === 's'
        ? () => void save(e.shiftKey ? paths : active ? [active] : [])
        : key === 'p'
          ? () => {
              setPalette(e.shiftKey ? 'commands' : 'files')
            }
          : key === 'b' && !e.shiftKey
            ? toggleExplorer
            : key === 'j' && !e.shiftKey
              ? () => {
                  setPanelOpen((o) => !o)
                }
              : undefined
    if (!handled) return
    e.preventDefault()
    e.stopPropagation()
    handled()
  }

  const onTabKeyDown = (e: React.KeyboardEvent, path: string) => {
    const index = openTabs.indexOf(path)
    const go = (i: number) => {
      const next = openTabs[(i + openTabs.length) % openTabs.length]
      if (!next) return
      setActiveState(next)
      document.getElementById(`${id}-tab-${next}`)?.focus()
    }
    if (e.key === 'ArrowRight') go(index + 1)
    else if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(openTabs.length - 1)
    else if (e.key === 'Delete' || e.key === 'Backspace') closeTab(path)
    else if (e.key === 'Enter') viewRef.current?.focus()
    else return
    e.preventDefault()
  }

  const tree = fileTree(paths)
  const explorer = (
    <div data-slot="ide-explorer" className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex h-10 shrink-0 items-center gap-1 pr-1.5 pl-3">
        <p
          id={`${id}-explorer`}
          className="mr-auto font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {t.explorer}
        </p>
        {canEditFiles ? (
          <IconButton
            label={t.newFile}
            onClick={() => {
              setPathDialog({ mode: 'new' })
            }}
          >
            <FilePlusIcon />
          </IconButton>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1.5 pb-2">
        {tree.length > 0 ? (
          <TreeView
            nodes={tree}
            aria-labelledby={`${id}-explorer`}
            expanded={expanded}
            onExpandedChange={setExpanded}
            selectionMode="single"
            selected={active ? `file:${active}` : null}
            onAction={(node) => {
              if (node.id.startsWith('file:')) openFile(node.id.slice(5))
              else
                setExpanded((prev) =>
                  prev.includes(node.id) ? prev.filter((d) => d !== node.id) : [...prev, node.id],
                )
            }}
            className="[&_[data-slot=tree-view-row]]:h-7 [&_[data-slot=tree-view-row]]:text-[13px]"
          />
        ) : (
          <p className="px-2 py-3 text-[13px] text-muted-foreground">{t.noFiles}</p>
        )}
      </div>
    </div>
  )

  const tabs = (
    <div className="flex h-10 shrink-0 items-stretch border-b border-border-subtle bg-card">
      <div
        role="tablist"
        aria-label={t.openFiles}
        className="flex min-w-0 flex-1 [scrollbar-width:thin] items-stretch overflow-x-auto"
      >
        {openTabs.map((path) => {
          const file = fileAt(path)
          const selected = path === active
          const dirty = file ? isDirty(file) : false
          const fileProblems = diagnostics[path] ?? []
          const hasError = fileProblems.some((d) => d.severity === 'error')
          return (
            <button
              key={path}
              type="button"
              role="tab"
              id={`${id}-tab-${path}`}
              aria-selected={selected}
              aria-label={dirty ? `${baseName(path)}, ${t.modified}` : undefined}
              aria-controls={`${id}-editor`}
              tabIndex={selected ? 0 : -1}
              title={path}
              data-active={selected || undefined}
              className={cn(
                'group/tab relative flex max-w-[220px] shrink-0 items-center gap-1.5 border-r border-border-subtle pr-1.5 pl-3 text-[13px] text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring [&_svg]:size-3.5 [&_svg]:shrink-0',
                selected &&
                  'bg-inset text-foreground after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary',
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('[data-slot=ide-tab-close]')) {
                  closeTab(path)
                  return
                }
                setActiveState(path)
              }}
              onAuxClick={(e) => {
                // The middle button closes, as in browsers and VS Code.
                if (e.button === 1) closeTab(path)
              }}
              onKeyDown={(e) => {
                onTabKeyDown(e, path)
              }}
            >
              <FileTypeIcon path={path} />
              <span className={cn('truncate', hasError && 'text-destructive')}>
                {baseName(path)}
              </span>
              <span
                data-slot="ide-tab-close"
                aria-hidden
                title={t.close(baseName(path))}
                className="relative flex size-5 items-center justify-center rounded-sm hover:bg-background"
              >
                {dirty ? (
                  <span className="size-2 rounded-full bg-foreground group-hover/tab:hidden" />
                ) : null}
                <CircleXIcon
                  className={cn(
                    'opacity-0 group-hover/tab:opacity-100 group-data-[active]/tab:opacity-100',
                    dirty && 'hidden group-hover/tab:block',
                  )}
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const editor = (
    <div className="flex h-full min-h-0 flex-col bg-inset">
      {tabs}
      {activeFile ? (
        <div
          role="tabpanel"
          id={`${id}-editor`}
          aria-labelledby={`${id}-tab-${activeFile.path}`}
          className="flex min-h-0 flex-1 flex-col"
        >
          <p className="flex h-7 shrink-0 items-center gap-1 truncate px-3 font-mono text-[11.5px] text-muted-foreground">
            {activeFile.path.split('/').join(' › ')}
          </p>
          <CodeEditor
            path={activeFile.path}
            value={activeFile.content}
            language={activeFile.language}
            readOnly={readOnly || activeFile.readOnly}
            wrap={wrap}
            tabSize={tabSize}
            diagnostics={diagnostics[activeFile.path]}
            onValueChange={(content) => {
              updateContent(activeFile.path, content)
            }}
            onCursorChange={setCursor}
            onViewChange={(view) => {
              viewRef.current = view
            }}
            aria-label={t.editorLabel(activeFile.path)}
            className="min-h-0 flex-1 rounded-none border-0 bg-inset has-[.cm-content:focus-visible]:ring-inset"
          />
        </div>
      ) : (
        <Empty data-slot="ide-empty" tabIndex={-1} className="flex-1 border-0 outline-none">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileCodeIcon />
            </EmptyMedia>
            <EmptyTitle>{t.noFileOpen}</EmptyTitle>
            <EmptyDescription>{t.noFileOpenHint(<Shortcut keys={[mod, 'P']} />)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )

  const problemList = (
    <div className="h-full overflow-auto py-1">
      {problems.length === 0 ? (
        <p className="px-3 py-2 text-[13px] text-muted-foreground">{t.noProblems}</p>
      ) : (
        <ul aria-label={t.problems}>
          {problems.map((p, i) => (
            <li key={`${p.path}:${String(p.line)}:${String(p.column ?? 0)}:${String(i)}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-1 text-left text-[13px] outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring [&_svg]:mt-0.5 [&_svg]:size-3.5 [&_svg]:shrink-0"
                onClick={() => {
                  openFile(p.path, { focus: false })
                  setReveal({ path: p.path, line: p.line, column: p.column ?? 1 })
                }}
              >
                {p.severity === 'error' ? (
                  <CircleXIcon className="text-destructive" />
                ) : p.severity === 'warning' ? (
                  <TriangleAlertIcon className="text-warning" />
                ) : (
                  <InfoIcon className="text-info" />
                )}
                <span className="sr-only">{`${t.severity[p.severity]}: `}</span>
                <span className="min-w-0 flex-1 text-foreground">
                  {p.message}
                  {p.source ? (
                    <span className="text-muted-foreground">{` ${p.source}`}</span>
                  ) : null}
                </span>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                  {`${baseName(p.path)} ${t.position(p.line, p.column ?? 1)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const bottomPanel = (
    <Tabs
      value={panel}
      onValueChange={setPanel}
      data-slot="ide-panel"
      className="flex h-full min-h-0 flex-col gap-0 bg-card"
    >
      <div className="flex shrink-0 items-center border-b border-border-subtle pr-1.5 pl-3">
        <TabsList variant="line" aria-label={t.panel} className="h-9 border-0">
          <TabsTrigger value="problems" className="text-[12px]">
            {t.problems}
            {problems.length > 0 ? (
              <span className="rounded-full bg-secondary px-1.5 font-mono text-[11px] text-fg-secondary">
                {problems.length}
              </span>
            ) : null}
          </TabsTrigger>
          {panels.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className="text-[12px]">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="ml-auto">
          <IconButton
            label={t.closePanel}
            onClick={() => {
              setPanelOpen(false)
              requestAnimationFrame(() => viewRef.current?.focus())
            }}
          >
            <PanelBottomIcon />
          </IconButton>
        </div>
      </div>
      <TabsContent value="problems" className="mt-0 min-h-0 flex-1">
        {problemList}
      </TabsContent>
      {panels.map((p) => (
        <TabsContent key={p.id} value={p.id} className="mt-0 min-h-0 flex-1 overflow-auto">
          {p.content}
        </TabsContent>
      ))}
    </Tabs>
  )

  const activeLanguage = activeFile
    ? (activeFile.language ?? languageFromPath(activeFile.path))
    : undefined
  const languageName = activeLanguage ? nameOf(activeLanguage) : null

  const visibleCommands = commands.filter((c) => !c.hidden)

  return (
    // The shortcuts listen here, so they only act while focus is inside the IDE.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keyboard shortcuts for the controls inside
    <section
      ref={rootRef}
      data-slot="ide"
      aria-label={ariaLabel ?? t.label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex h-[600px] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground',
        className,
      )}
    >
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border px-1.5">
        <IconButton
          label={t.toggleExplorer}
          shortcut={`${mac ? 'Meta' : 'Control'}+B`}
          pressed={compact ? sheetOpen : explorerOpen}
          onClick={toggleExplorer}
        >
          <PanelLeftIcon />
        </IconButton>
        <div className="min-w-0 truncate px-1.5 text-[13px] font-medium">{title}</div>
        <Button
          variant="outline"
          size="sm"
          className="mx-auto hidden h-7 w-full max-w-[320px] justify-start gap-2 text-[12.5px] font-normal text-muted-foreground sm:flex"
          aria-keyshortcuts={`${mac ? 'Meta' : 'Control'}+P`}
          onClick={() => {
            setPalette('files')
          }}
        >
          <SearchIcon />
          <span className="truncate">{t.searchFiles}</span>
          <span className="ml-auto">
            <Shortcut keys={[mod, 'P']} />
          </span>
        </Button>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <span className="sm:hidden">
            <IconButton
              label={t.searchFiles}
              onClick={() => {
                setPalette('files')
              }}
            >
              <SearchIcon />
            </IconButton>
          </span>
          <IconButton
            label={t.togglePanel}
            shortcut={`${mac ? 'Meta' : 'Control'}+J`}
            pressed={panelOpen}
            onClick={() => {
              setPanelOpen((o) => !o)
            }}
          >
            <PanelBottomIcon />
          </IconButton>
          {onRun ? (
            <Button
              size="sm"
              className="h-7"
              disabled={running}
              aria-busy={running || undefined}
              onClick={() => {
                onRun(files, active)
              }}
            >
              <PlayIcon />
              {running ? t.running : t.run}
            </Button>
          ) : null}
          {actions}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {compact ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className={cn('min-h-0', panelOpen ? 'basis-3/5' : 'flex-1')}>{editor}</div>
            {panelOpen ? (
              <div className="min-h-0 basis-2/5 border-t border-border">{bottomPanel}</div>
            ) : null}
          </div>
        ) : (
          // Panels collapse instead of unmounting, so hiding the explorer or the panel keeps the
          // editor (its undo history, its focus) as it is.
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel
              id="explorer"
              panelRef={explorerPanel}
              collapsible
              collapsedSize={0}
              defaultSize={explorerOpen ? '24%' : 0}
              minSize={160}
              maxSize="45%"
              onResize={(size) => {
                if (size.inPixels > 0 !== explorerOpen) setExplorerOpen(size.inPixels > 0)
              }}
            >
              {explorerOpen ? explorer : null}
            </ResizablePanel>
            <ResizableHandle
              aria-label={t.resizeExplorer}
              disabled={!explorerOpen}
              className={cn(!explorerOpen && 'hidden')}
            />
            <ResizablePanel id="main" minSize="40%">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel id="editor" minSize={120}>
                  {editor}
                </ResizablePanel>
                <ResizableHandle
                  aria-label={t.resizePanel}
                  disabled={!panelOpen}
                  className={cn(!panelOpen && 'hidden')}
                />
                <ResizablePanel
                  id="panel"
                  panelRef={bottomPanelRef}
                  collapsible
                  collapsedSize={0}
                  defaultSize={panelOpen ? '32%' : 0}
                  minSize={96}
                  onResize={(size) => {
                    if (size.inPixels > 0 !== panelOpen) setPanelOpen(size.inPixels > 0)
                  }}
                >
                  {panelOpen ? bottomPanel : null}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <div
        data-slot="ide-status-bar"
        className="flex h-7 shrink-0 items-center gap-3 overflow-hidden border-t border-border bg-card px-2 font-mono text-[11.5px] whitespace-nowrap text-muted-foreground"
      >
        <button
          type="button"
          className="flex items-center gap-2 rounded-sm px-1 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring [&_svg]:size-3.5"
          aria-label={t.problemsSummary(errorCount, warningCount)}
          onClick={() => {
            setPanel('problems')
            setPanelOpen(true)
          }}
        >
          <span className="flex items-center gap-1">
            <CircleXIcon />
            {errorCount}
          </span>
          <span className="flex items-center gap-1">
            <TriangleAlertIcon />
            {warningCount}
          </span>
        </button>
        <span aria-hidden={saveState === 'idle'}>
          {saveState === 'saving'
            ? t.saving
            : saveState === 'failed'
              ? t.saveFailed
              : saveState === 'saved'
                ? t.saved
                : activeFile && isDirty(activeFile)
                  ? t.unsaved
                  : null}
        </span>
        {activeFile ? (
          <span className="ml-auto flex items-center gap-3">
            {readOnly || activeFile.readOnly ? <span>{t.readOnly}</span> : null}
            <span>
              {t.position(cursor.line, cursor.column)}
              {cursor.selected > 0 ? ` ${t.selected(cursor.selected)}` : ''}
            </span>
            <span className="hidden sm:inline">{t.spaces(tabSize)}</span>
            <button
              type="button"
              aria-label={`${t.changeLanguage}: ${languageName ?? ''}`}
              className="rounded-sm px-1 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
              onClick={() => {
                setPalette('language')
              }}
            >
              {languageName}
            </button>
          </span>
        ) : null}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>

      <Sheet open={compact && sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[85%] max-w-[320px] gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t.explorer}</SheetTitle>
            <SheetDescription>{t.explorerDescription}</SheetDescription>
          </SheetHeader>
          {explorer}
        </SheetContent>
      </Sheet>

      <CommandDialog
        open={palette !== null}
        onOpenChange={(o) => {
          if (!o) setPalette(null)
        }}
        title={
          palette === 'commands'
            ? t.commands
            : palette === 'language'
              ? t.changeLanguage
              : t.goToFile
        }
        description={t.paletteDescription}
      >
        <CommandInput
          placeholder={
            palette === 'commands'
              ? t.searchCommands
              : palette === 'language'
                ? t.searchLanguages
                : t.searchFiles
          }
        />
        <CommandList>
          <CommandEmpty>{common.noResults}</CommandEmpty>
          {palette === 'files' ? (
            <CommandGroup heading={t.files}>
              {paths.map((path) => (
                <CommandItem
                  key={path}
                  value={path}
                  onSelect={() => {
                    setPalette(null)
                    openFile(path)
                  }}
                >
                  <FileTypeIcon path={path} />
                  <span className="truncate">{baseName(path)}</span>
                  {folderOf(path) ? (
                    <span className="truncate text-[12px] text-muted-foreground">
                      {folderOf(path)}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {palette === 'language' && active ? (
            <CommandGroup heading={t.languages}>
              {CODE_EDITOR_LANGUAGES.map(({ value }) => (
                <CommandItem
                  key={value}
                  value={`${nameOf(value)} ${value}`}
                  onSelect={() => {
                    setPalette(null)
                    setLanguage(active, value)
                  }}
                >
                  {nameOf(value)}
                  {value === activeLanguage ? (
                    <CheckIcon className="ml-auto" aria-label={t.current} />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {palette === 'language' ? null : (
            <CommandGroup heading={t.commands}>
              {visibleCommands.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`> ${c.label}`}
                  onSelect={() => {
                    setPalette(null)
                    c.run()
                  }}
                >
                  {c.icon}
                  {c.label}
                  {c.keys ? <CommandShortcut>{c.keys.join(' ')}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <PathDialog
        state={pathDialog}
        existing={paths}
        onCancel={() => {
          setPathDialog(null)
        }}
        onSubmit={createOrRename}
      />

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(o) => {
          if (!o) setToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle(baseName(toDelete ?? ''))}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (toDelete) deleteFile(toDelete)
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

/** New file or Rename: one path field, checked as you submit. */
function PathDialog({
  state,
  existing,
  onCancel,
  onSubmit,
}: {
  state: { mode: 'new' | 'rename'; from?: string } | null
  existing: readonly string[]
  onCancel: () => void
  onSubmit: (path: string) => void
}) {
  const t = useCoreloomI18n().messages.ide
  const common = useCoreloomI18n().messages.common
  const id = React.useId()
  const [error, setError] = React.useState<'empty' | 'invalid' | 'exists' | null>(null)
  const rename = state?.mode === 'rename'
  return (
    <Dialog
      open={state !== null}
      onOpenChange={(o) => {
        if (!o) {
          setError(null)
          onCancel()
        }
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{rename ? t.renameFile : t.newFile}</DialogTitle>
          <DialogDescription>{t.pathHint}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const value = new FormData(e.currentTarget).get('path')
            const others = existing.filter((p) => p !== state?.from)
            const result = checkFilePath(typeof value === 'string' ? value : '', others)
            if ('error' in result) {
              setError(result.error)
              return
            }
            setError(null)
            onSubmit(result.path)
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={`${id}-path`}>{t.path}</Label>
            <Input
              id={`${id}-path`}
              name="path"
              defaultValue={state?.from ?? (state ? '' : undefined)}
              placeholder="src/utils/format.ts"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              aria-invalid={error !== null || undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={() => {
                if (error) setError(null)
              }}
            />
            {error ? (
              <p id={`${id}-error`} className="text-[12.5px] text-destructive">
                {t.pathErrors[error]}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null)
                onCancel()
              }}
            >
              {common.cancel}
            </Button>
            <Button type="submit">{rename ? t.rename : t.create}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { checkFilePath, fileTree, Ide, type IdeFile, type IdePanel, type IdeProps }
