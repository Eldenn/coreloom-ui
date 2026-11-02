'use client'

// Coreloom UI — NodeEditor canvas extras. Notes and groups that sit on the canvas behind the nodes:
// a note is text for the people reading the workflow, a group frames related nodes and moves them
// together. Neither runs nor is checked. Also the "Find" list that jumps to a node, a note or a
// group. NodeEditor uses all of it; the helpers work on any graph with `notes` and `groups`.
import { type Node, type NodeProps, NodeResizer } from '@xyflow/react'
import { GripHorizontalIcon } from 'lucide-react'
import * as React from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** The colours a note or a group can take (semantic tints, so they follow the theme). */
type CanvasColor = 'neutral' | 'yellow' | 'green' | 'blue' | 'red' | 'cyan'

interface CanvasRect {
  position: { x: number; y: number }
  width: number
  height: number
}

/** Text on the canvas, for the people reading the workflow. */
interface WorkflowNote extends CanvasRect {
  id: string
  text: string
  /** Default: yellow. */
  color?: CanvasColor
}

/** A labelled frame around related nodes; moving it moves what's inside. */
interface WorkflowGroup extends CanvasRect {
  id: string
  label: string
  /** Default: neutral. */
  color?: CanvasColor
}

/** What the helpers need of a graph: its nodes' ids and positions, and its notes and groups. */
interface CanvasGraph {
  nodes: { id: string; position: { x: number; y: number } }[]
  notes?: WorkflowNote[]
  groups?: WorkflowGroup[]
}

type Sizes = ReadonlyMap<string, { width: number; height: number }>

const CANVAS_COLORS: readonly CanvasColor[] = ['neutral', 'yellow', 'green', 'blue', 'red', 'cyan']
const NOTE_SIZE = { width: 240, height: 140 }
const GROUP_SIZE = { width: 420, height: 260 }
/** Room around the nodes a group is made from, and the header above them. */
const GROUP_PAD = 32
const GROUP_HEADER = 36
/** A card whose size isn't measured yet. */
const NODE_SIZE = { width: 240, height: 72 }

const COLORS: Record<CanvasColor, { surface: string; border: string; mini: string }> = {
  neutral: {
    surface: 'bg-secondary/50',
    border: 'border-border-strong',
    mini: 'var(--color-secondary)',
  },
  yellow: {
    surface: 'bg-warning-subtle',
    border: 'border-warning/50',
    mini: 'var(--color-warning-subtle)',
  },
  green: {
    surface: 'bg-success-subtle',
    border: 'border-success/50',
    mini: 'var(--color-success-subtle)',
  },
  blue: { surface: 'bg-info-subtle', border: 'border-info/50', mini: 'var(--color-info-subtle)' },
  red: {
    surface: 'bg-destructive-subtle',
    border: 'border-destructive/50',
    mini: 'var(--color-destructive-subtle)',
  },
  cyan: {
    surface: 'bg-primary-subtle',
    border: 'border-primary/50',
    mini: 'var(--color-primary-subtle)',
  },
}

/** The minimap's fill for a note or a group of this colour. */
const canvasColorFill = (color: CanvasColor) => COLORS[color].mini

function takenIds(wf: CanvasGraph) {
  return new Set([
    ...wf.nodes.map((n) => n.id),
    ...(wf.notes ?? []).map((n) => n.id),
    ...(wf.groups ?? []).map((g) => g.id),
  ])
}

function freeCanvasId(base: string, taken: ReadonlySet<string>) {
  for (let i = 1; ; i++) if (!taken.has(`${base}-${String(i)}`)) return `${base}-${String(i)}`
}

/** Adds a note at `position` (its top-left). */
function addNote<W extends CanvasGraph>(
  wf: W,
  options: {
    position: { x: number; y: number }
    text?: string
    color?: CanvasColor
    width?: number
    height?: number
  },
): { workflow: W; id: string } {
  const id = freeCanvasId('note', takenIds(wf))
  const note: WorkflowNote = {
    id,
    position: { x: Math.round(options.position.x), y: Math.round(options.position.y) },
    width: options.width ?? NOTE_SIZE.width,
    height: options.height ?? NOTE_SIZE.height,
    text: options.text ?? '',
    ...(options.color ? { color: options.color } : {}),
  }
  return { workflow: { ...wf, notes: [...(wf.notes ?? []), note] }, id }
}

/** The box around some nodes and notes, from their positions and (measured) sizes. */
function boundsOf(wf: CanvasGraph, ids: readonly string[], sizes: Sizes = new Map()) {
  const want = new Set(ids)
  const boxes = [
    ...wf.nodes
      .filter((n) => want.has(n.id))
      .map((n) => ({ ...n.position, ...(sizes.get(n.id) ?? NODE_SIZE) })),
    ...(wf.notes ?? [])
      .filter((n) => want.has(n.id))
      .map((n) => ({ ...n.position, width: n.width, height: n.height })),
  ]
  if (!boxes.length) return null
  const x = Math.min(...boxes.map((b) => b.x))
  const y = Math.min(...boxes.map((b) => b.y))
  return {
    x,
    y,
    width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
    height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
  }
}

/** The group's frame around a box: padding on every side, and the header on top. */
const frameAround = (box: { x: number; y: number; width: number; height: number }) => ({
  position: { x: Math.round(box.x - GROUP_PAD), y: Math.round(box.y - GROUP_PAD - GROUP_HEADER) },
  width: Math.round(box.width + GROUP_PAD * 2),
  height: Math.round(box.height + GROUP_PAD * 2 + GROUP_HEADER),
})

/**
 * Adds a group: around `nodeIds` (nodes or notes) when given, otherwise an empty frame at
 * `position`. `sizes` are the cards' measured sizes, for a snug frame.
 */
function addGroup<W extends CanvasGraph>(
  wf: W,
  options: {
    label: string
    nodeIds?: readonly string[]
    sizes?: Sizes
    position?: { x: number; y: number }
    color?: CanvasColor
  },
): { workflow: W; id: string } {
  const id = freeCanvasId('group', takenIds(wf))
  const box = options.nodeIds?.length ? boundsOf(wf, options.nodeIds, options.sizes) : null
  const rect: CanvasRect = box
    ? frameAround(box)
    : {
        position: {
          x: Math.round(options.position?.x ?? 0),
          y: Math.round(options.position?.y ?? 0),
        },
        ...GROUP_SIZE,
      }
  const group: WorkflowGroup = {
    id,
    ...rect,
    label: options.label,
    ...(options.color ? { color: options.color } : {}),
  }
  return { workflow: { ...wf, groups: [...(wf.groups ?? []), group] }, id }
}

function updateNote<W extends CanvasGraph>(
  wf: W,
  id: string,
  patch: Partial<Omit<WorkflowNote, 'id'>>,
): W {
  if (!wf.notes?.some((n) => n.id === id)) return wf
  return { ...wf, notes: wf.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }
}

function updateGroup<W extends CanvasGraph>(
  wf: W,
  id: string,
  patch: Partial<Omit<WorkflowGroup, 'id'>>,
): W {
  if (!wf.groups?.some((g) => g.id === id)) return wf
  return { ...wf, groups: wf.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) }
}

/** Removes notes and groups (a group's nodes stay where they are). Other ids are ignored. */
function removeCanvasItems<W extends CanvasGraph>(wf: W, ids: readonly string[]): W {
  const gone = new Set(ids)
  const notes = wf.notes?.filter((n) => !gone.has(n.id))
  const groups = wf.groups?.filter((g) => !gone.has(g.id))
  if (notes?.length === wf.notes?.length && groups?.length === wf.groups?.length) return wf
  return {
    ...wf,
    ...(notes ? { notes } : {}),
    ...(groups ? { groups } : {}),
  }
}

/** The nodes and notes inside a group: those whose middle lies in its frame. */
function groupMembers(wf: CanvasGraph, groupId: string, sizes: Sizes = new Map()): string[] {
  const g = wf.groups?.find((x) => x.id === groupId)
  if (!g) return []
  const inside = (x: number, y: number) =>
    x >= g.position.x &&
    x <= g.position.x + g.width &&
    y >= g.position.y &&
    y <= g.position.y + g.height
  return [
    ...wf.nodes
      .filter((n) => {
        const s = sizes.get(n.id) ?? NODE_SIZE
        return inside(n.position.x + s.width / 2, n.position.y + s.height / 2)
      })
      .map((n) => n.id),
    ...(wf.notes ?? [])
      .filter((n) => inside(n.position.x + n.width / 2, n.position.y + n.height / 2))
      .map((n) => n.id),
  ]
}

/**
 * Moves a group by `delta` and everything inside it. `members` overrides who moves along (the ones
 * inside when a drag started); `skip` are ids that already moved on their own.
 */
function moveGroup<W extends CanvasGraph>(
  wf: W,
  groupId: string,
  delta: { x: number; y: number },
  options: { members?: readonly string[]; sizes?: Sizes; skip?: ReadonlySet<string> } = {},
): W {
  const g = wf.groups?.find((x) => x.id === groupId)
  if (!g || (delta.x === 0 && delta.y === 0)) return wf
  const along = new Set(options.members ?? groupMembers(wf, groupId, options.sizes))
  for (const id of options.skip ?? []) along.delete(id)
  const shift = (p: { x: number; y: number }) => ({ x: p.x + delta.x, y: p.y + delta.y })
  return {
    ...wf,
    nodes: wf.nodes.map((n) => (along.has(n.id) ? { ...n, position: shift(n.position) } : n)),
    ...(wf.notes
      ? {
          notes: wf.notes.map((n) => (along.has(n.id) ? { ...n, position: shift(n.position) } : n)),
        }
      : {}),
    groups: (wf.groups ?? []).map((x) =>
      x.id === groupId ? { ...x, position: shift(x.position) } : x,
    ),
  }
}

/**
 * After the nodes moved (Tidy up), fits each group that held nodes in `before` around the same nodes
 * in `after`. Empty groups stay where they were.
 */
function refitGroups<W extends CanvasGraph>(before: CanvasGraph, after: W, sizes?: Sizes): W {
  if (!after.groups?.length) return after
  const groups = after.groups.map((g) => {
    const members = groupMembers(before, g.id, sizes)
    const box = members.length ? boundsOf(after, members, sizes) : null
    return box ? { ...g, ...frameAround(box) } : g
  })
  return { ...after, groups }
}

/** Keeps a text field's draft while it's being edited, and follows the value otherwise (undo). */
function useDraft(value: string) {
  const [draft, setDraft] = React.useState(value)
  const [from, setFrom] = React.useState(value)
  if (from !== value) {
    setFrom(value)
    setDraft(value)
  }
  return [draft, setDraft] as const
}

interface CanvasItemData extends Record<string, unknown> {
  readOnly: boolean
  /** Saves a change of text (a note) or label (a group). */
  onText: (text: string) => void
  onResizeStart: () => void
  onResizeEnd: () => void
}

interface NoteData extends CanvasItemData {
  note: WorkflowNote
}

interface FrameData extends CanvasItemData {
  group: WorkflowGroup
}

type NoteNode = Node<NoteData, 'note'>
type FrameNode = Node<FrameData, 'frame'>

const resizeLine = '!border-primary/60'
const resizeHandle =
  '!pointer-events-auto !size-2.5 !rounded-[3px] !border !border-primary !bg-card'

function NoteCard({ data, selected }: NodeProps<NoteNode>) {
  const t = useCoreloomI18n().messages.nodeCanvas
  const { note, readOnly, onText, onResizeStart, onResizeEnd } = data
  const [draft, setDraft] = useDraft(note.text)
  const color = COLORS[note.color ?? 'yellow']
  return (
    <div
      className={cn(
        'flex size-full flex-col overflow-hidden rounded-lg border shadow-xs group-focus-visible/note:ring-[3px] group-focus-visible/note:ring-ring',
        color.surface,
        selected ? 'border-primary ring-2 ring-primary/40' : color.border,
      )}
    >
      {!readOnly && (
        <NodeResizer
          isVisible={selected}
          minWidth={140}
          minHeight={72}
          lineClassName={resizeLine}
          handleClassName={resizeHandle}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
        />
      )}
      <div
        aria-hidden
        className={cn(
          'flex h-5 shrink-0 items-center justify-center text-muted-foreground',
          !readOnly && 'cl-canvas-drag cursor-grab',
        )}
      >
        {!readOnly && <GripHorizontalIcon className="size-3.5" />}
      </div>
      {readOnly ? (
        <p className="m-0 min-h-0 flex-1 overflow-auto px-3 pb-3 text-[13px] leading-5 break-words whitespace-pre-wrap text-foreground">
          {note.text}
        </p>
      ) : (
        <textarea
          aria-label={t.noteText}
          placeholder={t.notePlaceholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
          }}
          onBlur={() => {
            if (draft !== note.text) onText(draft)
          }}
          onKeyDown={(e) => {
            // Escape leaves the text (saved) and hands focus back to the note.
            if (e.key === 'Escape') {
              e.stopPropagation()
              e.currentTarget.closest<HTMLElement>('.react-flow__node')?.focus()
            }
          }}
          className="nodrag nowheel nopan min-h-0 flex-1 resize-none bg-transparent px-3 pb-3 text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
        />
      )}
    </div>
  )
}

function GroupFrame({ data, selected }: NodeProps<FrameNode>) {
  const t = useCoreloomI18n().messages.nodeCanvas
  const { group, readOnly, onText, onResizeStart, onResizeEnd } = data
  const [draft, setDraft] = useDraft(group.label)
  const color = COLORS[group.color ?? 'neutral']
  return (
    <div
      className={cn(
        'flex size-full flex-col rounded-xl border border-dashed group-focus-visible/frame:ring-[3px] group-focus-visible/frame:ring-ring',
        color.surface,
        selected ? 'border-primary ring-2 ring-primary/30' : color.border,
      )}
    >
      {!readOnly && (
        <NodeResizer
          isVisible={selected}
          minWidth={160}
          minHeight={96}
          lineClassName={cn(resizeLine, '!pointer-events-auto')}
          handleClassName={resizeHandle}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
        />
      )}
      {/* The header is the only part that takes the pointer: clicks inside the frame reach the canvas. */}
      <div
        className={cn(
          'pointer-events-auto flex h-9 max-w-full shrink-0 items-center gap-1 self-start rounded-tl-xl rounded-br-lg px-2',
          !readOnly && 'cl-canvas-drag cursor-grab',
        )}
      >
        {!readOnly && (
          <GripHorizontalIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        {readOnly ? (
          <span className="truncate px-1 text-[13px] font-semibold text-foreground">
            {group.label}
          </span>
        ) : (
          <input
            aria-label={t.groupName}
            value={draft}
            placeholder={t.groupDefault}
            onChange={(e) => {
              setDraft(e.target.value)
            }}
            onBlur={() => {
              if (draft !== group.label) onText(draft)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.stopPropagation()
                e.currentTarget.closest<HTMLElement>('.react-flow__node')?.focus()
              }
            }}
            className="nodrag [field-sizing:content] min-w-12 truncate rounded-sm bg-transparent px-1 py-0.5 text-[13px] font-semibold text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        )}
      </div>
    </div>
  )
}

const CANVAS_NODE_TYPES = { note: NoteCard, frame: GroupFrame }

/** One entry of the "Find" list. */
interface CanvasFinderItem {
  id: string
  label: string
  /** A second line: the kind of node, the start of a note. */
  hint?: string
  section: 'nodes' | 'notes' | 'groups'
  icon?: React.ComponentType<{ className?: string }>
}

/** The "Find" list: what's on the canvas, searchable; picking one jumps to it. */
function CanvasFinder({
  items,
  onPick,
}: {
  items: readonly CanvasFinderItem[]
  onPick: (id: string) => void
}) {
  const t = useCoreloomI18n().messages.nodeCanvas
  const sections = (['nodes', 'notes', 'groups'] as const).filter((s) =>
    items.some((i) => i.section === s),
  )
  return (
    <Command>
      <CommandInput placeholder={t.findPlaceholder} />
      <CommandList>
        <CommandEmpty>{t.findEmpty}</CommandEmpty>
        {sections.map((s) => (
          <CommandGroup key={s} heading={t.sections[s]}>
            {items
              .filter((i) => i.section === s)
              .map((i) => {
                const Icon = i.icon
                return (
                  <CommandItem
                    key={i.id}
                    value={`${i.label} ${i.hint ?? ''} ${i.id}`}
                    onSelect={() => {
                      onPick(i.id)
                    }}
                    className="items-start"
                  >
                    {Icon && (
                      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {i.label}
                      </span>
                      {i.hint && (
                        <span className="truncate text-[12px] text-muted-foreground">{i.hint}</span>
                      )}
                    </span>
                  </CommandItem>
                )
              })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

export {
  addGroup,
  addNote,
  boundsOf,
  CANVAS_COLORS,
  CANVAS_NODE_TYPES,
  type CanvasColor,
  canvasColorFill,
  CanvasFinder,
  type CanvasFinderItem,
  type CanvasGraph,
  type FrameData,
  type FrameNode,
  groupMembers,
  moveGroup,
  type NoteData,
  type NoteNode,
  refitGroups,
  removeCanvasItems,
  updateGroup,
  updateNote,
  type WorkflowGroup,
  type WorkflowNote,
}
