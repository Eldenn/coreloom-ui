'use client'

// Coreloom UI — File manager (block). Browse folders in a grid or a list, with a breadcrumb back
// up, select several items (Ctrl/⌘-click, Shift-click, Shift+arrows, Ctrl/⌘+A), drag them onto a
// folder or a crumb to move them (or use Move to, from the keyboard), drop files from the computer
// to upload, and see the selected item in a preview panel. Front-end only: you keep the items and
// do the moving, deleting and uploading in `onMove`, `onDelete` and `onUpload`.
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  FolderInputIcon,
  LayoutGridIcon,
  ListIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import * as React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { DescriptionList } from '@/components/ui/description-list'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { formatBytes } from '@/components/ui/file-upload'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface FileManagerItem {
  id: string
  name: string
  kind: 'folder' | 'file'
  /** The folder it is in; `null` at the root. */
  parentId: string | null
  /** In bytes (files). */
  size?: number
  modifiedAt?: Date | string
  /** Picks the icon and the type shown: `image/png`, `application/pdf`… */
  mimeType?: string
  /** A small image for the grid and the preview (images, videos, PDFs' first page). */
  thumbnailUrl?: string
  owner?: string
}

type FileManagerView = 'grid' | 'list'
type FileSortKey = 'name' | 'size' | 'modified'
type FileType =
  | 'folder'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'code'
  | 'spreadsheet'
  | 'text'
  | 'file'

const EXT: Record<string, FileType> = {
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  avif: 'image',
  mp4: 'video',
  mov: 'video',
  webm: 'video',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  pdf: 'pdf',
  zip: 'archive',
  gz: 'archive',
  tar: 'archive',
  rar: 'archive',
  '7z': 'archive',
  ts: 'code',
  tsx: 'code',
  js: 'code',
  jsx: 'code',
  json: 'code',
  py: 'code',
  css: 'code',
  html: 'code',
  yml: 'code',
  yaml: 'code',
  csv: 'spreadsheet',
  xlsx: 'spreadsheet',
  xls: 'spreadsheet',
  ods: 'spreadsheet',
  md: 'text',
  txt: 'text',
  doc: 'text',
  docx: 'text',
  rtf: 'text',
}

/** What kind of file it is, from its MIME type or else its extension. */
function fileTypeOf(item: Pick<FileManagerItem, 'kind' | 'name' | 'mimeType'>): FileType {
  if (item.kind === 'folder') return 'folder'
  const mime = item.mimeType ?? ''
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime === 'application/pdf') return 'pdf'
  const dot = item.name.lastIndexOf('.')
  const ext = dot > 0 ? item.name.slice(dot + 1).toLowerCase() : ''
  return EXT[ext] ?? (mime.startsWith('text/') ? 'text' : 'file')
}

const TYPE_ICON = {
  folder: FolderIcon,
  image: FileImageIcon,
  video: FileVideoIcon,
  audio: FileAudioIcon,
  pdf: FileTextIcon,
  archive: FileArchiveIcon,
  code: FileCodeIcon,
  spreadsheet: FileSpreadsheetIcon,
  text: FileTextIcon,
  file: FileIcon,
} as const

/** The folders from the root down to `folderId` (included); empty at the root or for an unknown id. */
function fileManagerPath(items: readonly FileManagerItem[], folderId: string | null) {
  const byId = new Map(items.map((i) => [i.id, i]))
  const path: FileManagerItem[] = []
  const seen = new Set<string>()
  let id = folderId
  while (id !== null && !seen.has(id)) {
    seen.add(id)
    const item = byId.get(id)
    if (!item) break
    path.unshift(item)
    id = item.parentId
  }
  return path
}

/** Folders first, then by `key`; names compare the way people count ("2" before "10"). */
function sortFileItems(
  items: readonly FileManagerItem[],
  key: FileSortKey,
  direction: 'asc' | 'desc',
  locale = 'en',
) {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  const sign = direction === 'asc' ? 1 : -1
  const time = (i: FileManagerItem) => (i.modifiedAt ? +new Date(i.modifiedAt) : 0)
  return [...items].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
    const by =
      key === 'size'
        ? (a.size ?? 0) - (b.size ?? 0)
        : key === 'modified'
          ? time(a) - time(b)
          : collator.compare(a.name, b.name)
    return (by || collator.compare(a.name, b.name)) * sign
  })
}

/**
 * Whether the items can move into `targetId` (`null`: the root): not into one of themselves or
 * their own subfolders, and not where all of them already are.
 */
function canMoveTo(
  items: readonly FileManagerItem[],
  ids: readonly string[],
  targetId: string | null,
) {
  if (ids.length === 0) return false
  if (targetId !== null) {
    const path = fileManagerPath(items, targetId).map((f) => f.id)
    if (ids.some((id) => path.includes(id))) return false
  }
  const moving = items.filter((i) => ids.includes(i.id))
  return moving.some((i) => i.parentId !== targetId)
}

/** The ids from `anchor` to `to` (both included) in display order; just `to` without an anchor. */
function selectRange(order: readonly string[], anchor: string | undefined, to: string) {
  const a = anchor === undefined ? -1 : order.indexOf(anchor)
  const b = order.indexOf(to)
  if (b < 0) return []
  if (a < 0) return [to]
  return order.slice(Math.min(a, b), Math.max(a, b) + 1)
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(initial)
  // Not `??`: `null` is a value here (the root folder), only `undefined` means uncontrolled.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- null is a real value
  const current = value === undefined ? inner : value
  const set = (v: T) => {
    setInner(v)
    onChange?.(v)
  }
  return [current, set] as const
}

const DRAG_TYPE = 'application/x-coreloom-files'

/**
 * The focused item, button or crumb goes away when the folder or its items change: on the next
 * frame, focus the item that holds the Tab stop, or the empty state when nothing is left.
 */
function focusFolderContents(
  list: React.RefObject<HTMLElement | null>,
  empty: React.RefObject<HTMLElement | null>,
) {
  requestAnimationFrame(() => {
    const item = list.current?.querySelector<HTMLElement>('[role=option][tabindex="0"]')
    const target = item ?? list.current ?? empty.current
    target?.focus()
  })
}

/** A column header of the list view. `direction` is set on the column the list is sorted by. */
function SortButton({
  label,
  name,
  direction,
  onClick,
  className,
}: {
  label: string
  /** The accessible name: the column and, when sorted by it, the direction. */
  name: string
  direction?: 'asc' | 'desc'
  onClick: () => void
  className?: string
}) {
  const Arrow = direction === 'desc' ? ArrowDownIcon : ArrowUpIcon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      aria-pressed={direction !== undefined}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring',
        direction && 'text-foreground',
        className,
      )}
    >
      {label}
      {direction && <Arrow className="size-3" aria-hidden />}
    </button>
  )
}

/**
 * The tick on an item, for the mouse and for touch (the keyboard selects with Space). Hidden until
 * the item is hovered or focused; always there on a touch screen, where nothing hovers.
 */
function SelectionMark({
  selected,
  view,
  onToggle,
}: {
  selected: boolean
  view: FileManagerView
  onToggle: () => void
}) {
  return (
    <span
      aria-hidden
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        // The box is 16 px; `before` widens what a finger can hit to 24 px.
        'absolute flex size-4 items-center justify-center rounded-[4px] border bg-background text-[10px] leading-none before:absolute before:-inset-1',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border-strong opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100',
        view === 'grid'
          ? 'top-2 left-2'
          : 'top-1/2 left-2.5 hidden -translate-y-1/2 pointer-coarse:flex',
      )}
    >
      {selected ? '✓' : ''}
    </span>
  )
}

function FileManager({
  items,
  folderId: folderIdProp,
  defaultFolderId = null,
  onFolderChange,
  view: viewProp,
  defaultView = 'grid',
  onViewChange,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectionChange,
  onOpen,
  onMove,
  onDelete,
  onUpload,
  rootLabel,
  actions,
  preview = true,
  renderPreview,
  className,
}: {
  /** Every file and folder, flat; `parentId` builds the tree. */
  items: FileManagerItem[]
  /** The folder shown (`null`: the root). Controlled with `onFolderChange`. */
  folderId?: string | null
  defaultFolderId?: string | null
  onFolderChange?: (folderId: string | null) => void
  view?: FileManagerView
  defaultView?: FileManagerView
  onViewChange?: (view: FileManagerView) => void
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** A file opened (double-click, Enter, Open); folders open in place. */
  onOpen?: (item: FileManagerItem) => void
  /** Turns on drag and drop and Move to. Update `items` with the new `parentId`. */
  onMove?: (ids: string[], folderId: string | null) => void
  /** Adds Delete (and the Delete key) for the selection. */
  onDelete?: (ids: string[]) => void
  /** Adds Upload and dropping files from the computer, into the folder shown. */
  onUpload?: (files: File[], folderId: string | null) => void
  /** The root's name in the breadcrumb. Default "All files". */
  rootLabel?: string
  /** More buttons in the toolbar ("New folder"). */
  actions?: React.ReactNode
  /** Shows the details panel. Default true. */
  preview?: boolean
  /** Replaces the preview's image or icon for a file: a PDF viewer, a video player. */
  renderPreview?: (item: FileManagerItem) => React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.fileManager
  const baseId = React.useId()
  const root = rootLabel ?? t.root

  const [folderId, setFolderIdRaw] = useControllable(folderIdProp, defaultFolderId, onFolderChange)
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [selectedList, setSelectedList] = useControllable(
    selectedProp,
    defaultSelectedIds,
    onSelectionChange,
  )
  const selected = React.useMemo(() => new Set(selectedList), [selectedList])
  const [sort, setSort] = React.useState<{ key: FileSortKey; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  })
  const [anchor, setAnchor] = React.useState<string>()
  const [focusId, setFocusId] = React.useState<string>()
  const [announce, setAnnounce] = React.useState('')
  const [dropTarget, setDropTarget] = React.useState<string | null | undefined>(undefined)
  const [uploading, setUploading] = React.useState(false)
  const dragIds = React.useRef<string[]>([])
  const listRef = React.useRef<HTMLUListElement>(null)
  const emptyRef = React.useRef<HTMLDivElement>(null)
  const uploadRef = React.useRef<HTMLInputElement>(null)

  const path = fileManagerPath(items, folderId)
  const here = React.useMemo(
    () =>
      sortFileItems(
        items.filter((i) => i.parentId === folderId),
        sort.key,
        sort.dir,
        locale,
      ),
    [items, folderId, sort, locale],
  )
  const order = here.map((i) => i.id)
  const selectedItems = items.filter((i) => selected.has(i.id))
  const activeId = focusId !== undefined && order.includes(focusId) ? focusId : order.at(0)
  const folderName = (id: string | null) =>
    id === null ? root : (items.find((i) => i.id === id)?.name ?? root)

  const select = (ids: string[], announceIt = true) => {
    setSelectedList(ids)
    if (announceIt) setAnnounce(ids.length ? t.selected(ids.length) : t.selectionCleared)
  }

  const focusContents = () => {
    focusFolderContents(listRef, emptyRef)
  }

  const openFolder = (id: string | null) => {
    setFolderIdRaw(id)
    select([], false)
    setAnchor(undefined)
    setFocusId(undefined)
    setAnnounce(t.opened(folderName(id)))
    focusContents()
  }

  // The Delete key and the toolbar's Delete: the selection (and its toolbar) goes with the items.
  const deleteSelected = () => {
    if (!onDelete || selectedList.length === 0) return
    onDelete(selectedList)
    select([], false)
    focusContents()
  }

  const open = (item: FileManagerItem) => {
    if (item.kind === 'folder') openFolder(item.id)
    else onOpen?.(item)
  }

  const move = (ids: string[], target: string | null) => {
    if (!onMove || !canMoveTo(items, ids, target)) return
    onMove(ids, target)
    select([], false)
    setAnnounce(t.moved(ids.length, folderName(target)))
    focusContents()
  }

  const focusItem = (id: string | undefined) => {
    if (id === undefined) return
    setFocusId(id)
    listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus()
  }

  const onItemClick = (e: React.MouseEvent, id: string) => {
    setFocusId(id)
    if (e.shiftKey) {
      select(selectRange(order, anchor, id))
      return
    }
    setAnchor(id)
    if (e.metaKey || e.ctrlKey) {
      select(selected.has(id) ? selectedList.filter((s) => s !== id) : [...selectedList, id])
      return
    }
    select([id])
  }

  const toggle = (id: string) => {
    setAnchor(id)
    setFocusId(id)
    select(selected.has(id) ? selectedList.filter((s) => s !== id) : [...selectedList, id])
  }

  // How many items fit on one row of the grid, to move up and down by a row.
  const columns = () => {
    const els = listRef.current?.querySelectorAll<HTMLElement>('[role=option]')
    if (!els || els.length === 0 || view === 'list') return 1
    const top = els[0].offsetTop
    let n = 0
    for (const el of els) {
      if (el.offsetTop !== top) break
      n++
    }
    return Math.max(1, n)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = activeId === undefined ? -1 : order.indexOf(activeId)
    const mod = e.metaKey || e.ctrlKey
    let next: number | undefined
    switch (e.key) {
      case 'ArrowRight':
        next = view === 'grid' ? i + 1 : undefined
        break
      case 'ArrowLeft':
        next = view === 'grid' ? i - 1 : undefined
        break
      case 'ArrowDown':
        next = i + columns()
        break
      case 'ArrowUp':
        if (e.altKey) {
          e.preventDefault()
          if (folderId !== null) openFolder(path.at(-2)?.id ?? null)
          return
        }
        next = i - columns()
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = order.length - 1
        break
      case ' ':
        e.preventDefault()
        if (activeId !== undefined) toggle(activeId)
        return
      case 'Enter': {
        const item = here.find((h) => h.id === activeId)
        if (item) {
          e.preventDefault()
          open(item)
        }
        return
      }
      case 'Backspace':
        if (folderId !== null) {
          e.preventDefault()
          openFolder(path.at(-2)?.id ?? null)
        }
        return
      case 'Delete':
        if (onDelete && selectedList.length) {
          e.preventDefault()
          deleteSelected()
        }
        return
      case 'Escape':
        if (selectedList.length) {
          e.preventDefault()
          select([])
        }
        return
      case 'a':
      case 'A':
        if (mod) {
          e.preventDefault()
          select(order)
        }
        return
      default:
        return
    }
    if (next === undefined) return
    e.preventDefault()
    const clamped = Math.max(0, Math.min(order.length - 1, next))
    const id = order.at(clamped)
    if (id === undefined) return
    focusItem(id)
    if (e.shiftKey) select(selectRange(order, anchor ?? activeId, id))
    else if (!mod) {
      setAnchor(id)
    }
  }

  // Drops: items from this list onto a folder or a crumb; files from the computer onto the list.
  const dropProps = (target: string | null) =>
    onMove
      ? {
          onDragOver: (e: React.DragEvent) => {
            if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
            if (!canMoveTo(items, dragIds.current, target)) return
            e.preventDefault()
            e.stopPropagation()
            e.dataTransfer.dropEffect = 'move'
            setDropTarget(target)
          },
          onDragLeave: () => {
            setDropTarget(undefined)
          },
          onDrop: (e: React.DragEvent) => {
            if (!e.dataTransfer.types.includes(DRAG_TYPE)) return
            e.preventDefault()
            e.stopPropagation()
            setDropTarget(undefined)
            move(dragIds.current, target)
          },
        }
      : {}

  const dragProps = (id: string) =>
    onMove
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            const ids = selected.has(id) ? selectedList : [id]
            if (!selected.has(id)) select([id], false)
            dragIds.current = ids
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData(DRAG_TYPE, ids.join(','))
            e.dataTransfer.setData('text/plain', ids.map((s) => folderName(s)).join('\n'))
          },
          onDragEnd: () => {
            dragIds.current = []
            setDropTarget(undefined)
          },
        }
      : {}

  const uploadDrop = onUpload
    ? {
        onDragOver: (e: React.DragEvent) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setUploading(true)
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setUploading(false)
        },
        onDrop: (e: React.DragEvent) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setUploading(false)
          const files = Array.from(e.dataTransfer.files)
          if (files.length) {
            onUpload(files, folderId)
            setAnnounce(t.uploading(files.length, folderName(folderId)))
          }
        },
      }
    : {}

  // Every folder but the ones being moved (and their subfolders), as Move to targets.
  const targets = React.useMemo(() => {
    const out: { id: string | null; name: string; depth: number }[] = [
      { id: null, name: root, depth: 0 },
    ]
    const walk = (parent: string | null, depth: number) => {
      for (const f of sortFileItems(
        items.filter((i) => i.kind === 'folder' && i.parentId === parent),
        'name',
        'asc',
        locale,
      )) {
        if (selected.has(f.id)) continue
        out.push({ id: f.id, name: f.name, depth })
        walk(f.id, depth + 1)
      }
    }
    walk(null, 1)
    return out
  }, [items, selected, root, locale])

  const sortHeader = (key: FileSortKey, label: string, cls?: string) => {
    const active = sort.key === key
    return (
      <SortButton
        label={label}
        name={active ? t.sortedBy(label, sort.dir) : t.sortBy(label)}
        direction={active ? sort.dir : undefined}
        className={cls}
        onClick={() => {
          setSort({ key, dir: active && sort.dir === 'asc' ? 'desc' : 'asc' })
        }}
      />
    )
  }

  const single = selectedItems.length === 1 ? selectedItems[0] : undefined
  const totalSize = selectedItems.reduce((n, i) => n + (i.size ?? 0), 0)

  return (
    <div
      data-slot="file-manager"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap overflow-x-auto">
            {[{ id: null, name: root }, ...path].map((f, i, all) => {
              const last = i === all.length - 1
              const id = f.id
              return (
                <React.Fragment key={id ?? '__root'}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem
                    {...dropProps(id)}
                    className={cn(
                      'shrink-0 rounded-sm',
                      dropTarget === id && 'bg-primary-subtle ring-2 ring-ring',
                    )}
                  >
                    {last ? (
                      <BreadcrumbPage className="truncate">{f.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button
                          type="button"
                          className="cursor-pointer rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                          onClick={() => {
                            openFolder(id)
                          }}
                        >
                          {f.name}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap items-center gap-1.5">
          {actions}
          {onUpload && (
            <>
              <input
                ref={uploadRef}
                type="file"
                multiple
                hidden
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  e.target.value = ''
                  if (files.length) {
                    onUpload(files, folderId)
                    setAnnounce(t.uploading(files.length, folderName(folderId)))
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  uploadRef.current?.click()
                }}
              >
                <UploadIcon aria-hidden />
                {t.upload}
              </Button>
            </>
          )}
          <SegmentedControl
            size="sm"
            iconOnly
            aria-label={t.view}
            value={view}
            onValueChange={(v) => {
              setView(v as FileManagerView)
            }}
            options={[
              { value: 'grid', label: t.grid, icon: <LayoutGridIcon /> },
              { value: 'list', label: t.list, icon: <ListIcon /> },
            ]}
          />
        </div>
      </div>

      {selectedList.length > 0 && (onMove ?? onDelete) && (
        <div
          role="toolbar"
          aria-label={t.selectionActions}
          className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-inset px-3 py-1.5"
        >
          <span className="mr-auto text-[12.5px] text-fg-secondary">
            {t.selected(selectedList.length)}
          </span>
          {onMove && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FolderInputIcon aria-hidden />
                  {t.moveTo}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                <DropdownMenuLabel>{t.moveTo}</DropdownMenuLabel>
                {targets.map((f) => (
                  <DropdownMenuItem
                    key={f.id ?? '__root'}
                    disabled={!canMoveTo(items, selectedList, f.id)}
                    onSelect={() => {
                      move(selectedList, f.id)
                    }}
                    style={{ paddingLeft: 8 + f.depth * 12 }}
                  >
                    <FolderIcon aria-hidden />
                    {f.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={deleteSelected}
            >
              <Trash2Icon aria-hidden />
              {t.delete}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              select([])
              focusContents()
            }}
          >
            {t.clear}
          </Button>
        </div>
      )}

      <div
        className={cn(
          'grid min-h-0 flex-1',
          preview && 'lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]',
        )}
      >
        <div {...uploadDrop} className="relative min-h-56 min-w-0 p-2">
          {view === 'list' && here.length > 0 && (
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 border-b border-border-subtle px-3 pb-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase sm:grid-cols-[minmax(0,1fr)_5.5rem_9rem] pointer-coarse:pl-9">
              {sortHeader('name', t.name)}
              {sortHeader('size', t.size, 'justify-end')}
              {sortHeader('modified', t.modified, 'hidden sm:inline-flex')}
            </div>
          )}
          {here.length === 0 ? (
            <Empty
              ref={emptyRef}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              className="h-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon />
                </EmptyMedia>
                <EmptyTitle>{t.emptyFolder}</EmptyTitle>
                {onUpload && <EmptyDescription>{t.emptyFolderHint}</EmptyDescription>}
              </EmptyHeader>
            </Empty>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              aria-multiselectable
              aria-label={t.contents(folderName(folderId))}
              aria-orientation={view === 'grid' ? undefined : 'vertical'}
              aria-describedby={`${baseId}-help`}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              className={cn(
                'm-0 list-none rounded-md p-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                view === 'grid'
                  ? 'grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2 pt-1'
                  : 'flex flex-col',
              )}
            >
              {here.map((item) => {
                const type = fileTypeOf(item)
                const Icon = TYPE_ICON[type]
                const isSelected = selected.has(item.id)
                const isTarget = item.kind === 'folder' && dropTarget === item.id
                const detail =
                  item.kind === 'folder'
                    ? t.itemCount(items.filter((i) => i.parentId === item.id).length)
                    : item.size !== undefined
                      ? formatBytes(item.size, locale)
                      : undefined
                return (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- the listbox handles the keys (roving focus)
                  <li
                    key={item.id}
                    role="option"
                    data-id={item.id}
                    aria-selected={isSelected}
                    tabIndex={item.id === activeId ? 0 : -1}
                    {...dragProps(item.id)}
                    {...(item.kind === 'folder' ? dropProps(item.id) : {})}
                    onFocus={() => {
                      setFocusId(item.id)
                    }}
                    onClick={(e) => {
                      onItemClick(e, item.id)
                    }}
                    onDoubleClick={() => {
                      open(item)
                    }}
                    className={cn(
                      'group relative cursor-default rounded-md outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring',
                      isSelected
                        ? 'bg-primary-subtle [&_.text-muted-foreground]:text-fg-secondary'
                        : 'hover:bg-accent/60',
                      isTarget && 'ring-2 ring-ring',
                      view === 'grid'
                        ? 'flex flex-col items-center gap-2 border border-transparent p-3 text-center'
                        : 'grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 px-3 py-1.5 sm:grid-cols-[minmax(0,1fr)_5.5rem_9rem] pointer-coarse:pl-9',
                      view === 'grid' && isSelected && 'border-primary/40',
                    )}
                  >
                    <SelectionMark
                      selected={isSelected}
                      view={view}
                      onToggle={() => {
                        toggle(item.id)
                      }}
                    />
                    {view === 'grid' ? (
                      <>
                        <span className="flex size-16 items-center justify-center overflow-hidden rounded-md bg-inset">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt=""
                              draggable={false}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Icon
                              className={cn(
                                'size-8',
                                type === 'folder' ? 'text-primary' : 'text-muted-foreground',
                              )}
                              aria-hidden
                            />
                          )}
                        </span>
                        <span className="line-clamp-2 w-full text-[12.5px] break-words text-foreground">
                          {item.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {detail ?? ' '}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={cn(
                              'size-4 shrink-0',
                              type === 'folder' ? 'text-primary' : 'text-muted-foreground',
                            )}
                            aria-hidden
                          />
                          <span className="truncate text-[13px] text-foreground">{item.name}</span>
                        </span>
                        <span className="text-right font-mono text-[12px] text-fg-secondary tabular-nums">
                          {detail ?? '—'}
                        </span>
                        <span className="hidden font-mono text-[12px] text-fg-secondary sm:inline">
                          {item.modifiedAt
                            ? new Date(item.modifiedAt).toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </>
                    )}
                    <span className="sr-only">, {t.types[type]}</span>
                  </li>
                )
              })}
            </ul>
          )}
          {uploading && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-md border-2 border-dashed border-primary bg-primary-subtle/80 text-[13px] font-medium text-primary-text"
            >
              {t.dropToUpload(folderName(folderId))}
            </div>
          )}
        </div>

        {preview && (
          <aside
            aria-label={t.details}
            className="flex min-w-0 flex-col gap-4 border-t border-border-subtle p-4 lg:border-t-0 lg:border-l"
          >
            {single ? (
              <>
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-inset">
                  {renderPreview && single.kind === 'file' ? (
                    renderPreview(single)
                  ) : single.thumbnailUrl ? (
                    <img
                      src={single.thumbnailUrl}
                      alt={t.previewOf(single.name)}
                      className="size-full object-contain"
                    />
                  ) : (
                    React.createElement(TYPE_ICON[fileTypeOf(single)], {
                      className: cn(
                        'size-12',
                        single.kind === 'folder' ? 'text-primary' : 'text-muted-foreground',
                      ),
                      'aria-hidden': true,
                    })
                  )}
                </div>
                <p className="m-0 text-[14px] font-semibold break-words text-foreground">
                  {single.name}
                </p>
                <DescriptionList
                  layout="stacked"
                  items={[
                    { term: t.type, value: t.types[fileTypeOf(single)] },
                    single.kind === 'folder'
                      ? {
                          term: t.contains,
                          value: t.itemCount(items.filter((i) => i.parentId === single.id).length),
                        }
                      : {
                          term: t.size,
                          value:
                            single.size !== undefined
                              ? formatBytes(single.size, locale)
                              : undefined,
                        },
                    {
                      term: t.modified,
                      value: single.modifiedAt
                        ? new Date(single.modifiedAt).toLocaleString(locale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : undefined,
                    },
                    ...(single.owner ? [{ term: t.owner, value: single.owner }] : []),
                    {
                      term: t.location,
                      value: [
                        root,
                        ...fileManagerPath(items, single.parentId).map((f) => f.name),
                      ].join(' / '),
                    },
                  ]}
                />
                {(single.kind === 'folder' || onOpen) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                      open(single)
                    }}
                  >
                    {t.open}
                  </Button>
                )}
              </>
            ) : selectedItems.length > 1 ? (
              <div className="flex flex-col gap-1">
                <p className="m-0 text-[14px] font-semibold text-foreground">
                  {t.selected(selectedItems.length)}
                </p>
                {totalSize > 0 && (
                  <p className="m-0 font-mono text-[12.5px] text-muted-foreground">
                    {formatBytes(totalSize, locale)}
                  </p>
                )}
              </div>
            ) : (
              <p className="m-0 text-[13px] text-muted-foreground">{t.selectToPreview}</p>
            )}
          </aside>
        )}
      </div>

      <p id={`${baseId}-help`} className="sr-only">
        {onMove ? t.keyboardHelpMove : t.keyboardHelp}
      </p>
      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  )
}

export {
  canMoveTo,
  FileManager,
  type FileManagerItem,
  fileManagerPath,
  type FileManagerView,
  type FileSortKey,
  type FileType,
  fileTypeOf,
  selectRange,
  sortFileItems,
}
