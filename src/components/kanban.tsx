'use client'

// Coreloom UI — KanbanBoard (kanban block). Columns of cards you reorder and move by dragging
// (pointer or keyboard, with screen-reader announcements) or from each card's "Move to" menu.
// Built on dnd-kit. The board is controlled: it calls onCardsChange with the new order.
import {
  type Announcements,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, MoreHorizontalIcon } from 'lucide-react'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface KanbanColumn {
  id: string
  title: string
  /** Work-in-progress limit: the count turns amber when reached, red past it. */
  limit?: number
}

interface KanbanCard {
  id: string
  columnId: string
  title: string
  description?: React.ReactNode
  labels?: {
    label: string
    tone?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
  }[]
  assignee?: { name: string; avatar?: string }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

function CardBody({ card }: { card: KanbanCard }) {
  return (
    <>
      <span className="text-[14px] leading-snug font-medium text-foreground">{card.title}</span>
      {card.description && (
        <span className="text-[12px] leading-snug text-muted-foreground">{card.description}</span>
      )}
      {(card.labels?.length || card.assignee) && (
        <span className="mt-1 flex items-center gap-1.5">
          {card.labels?.map((l) => (
            <Badge key={l.label} variant={l.tone ?? 'secondary'}>
              {l.label}
            </Badge>
          ))}
          {card.assignee && (
            <Avatar className="ml-auto size-6">
              {card.assignee.avatar && <AvatarImage src={card.assignee.avatar} alt="" />}
              <AvatarFallback className="text-[10px]">
                {initials(card.assignee.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </span>
      )}
    </>
  )
}

function SortableCard({
  card,
  columns,
  onMove,
  onOpen,
}: {
  card: KanbanCard
  columns: KanbanColumn[]
  onMove: (card: KanbanCard, columnId: string) => void
  onOpen?: (card: KanbanCard) => void
}) {
  const t = useCoreloomI18n().messages.kanban
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })
  return (
    <li
      ref={setNodeRef}
      data-slot="kanban-card"
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group flex items-start gap-1 rounded-md border border-border bg-card p-2 shadow-sm transition-shadow',
        isDragging && 'opacity-40',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t.dragHandle(card.title)}
        className="mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      {onOpen ? (
        <button
          type="button"
          onClick={() => {
            onOpen(card)
          }}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1 rounded-sm px-1 py-0.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <CardBody card={card} />
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-1 px-1 py-0.5">
          <CardBody card={card} />
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.actions(card.title)}
            className="size-6 shrink-0"
          >
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.moveTo}</DropdownMenuLabel>
          {columns
            .filter((c) => c.id !== card.columnId)
            .map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => {
                  onMove(card, c.id)
                }}
              >
                {c.title}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

function Column({
  column,
  cards,
  columns,
  onMove,
  onOpen,
  footer,
}: {
  column: KanbanColumn
  cards: KanbanCard[]
  columns: KanbanColumn[]
  onMove: (card: KanbanCard, columnId: string) => void
  onOpen?: (card: KanbanCard) => void
  footer?: React.ReactNode
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.kanban
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const headingId = React.useId()
  const count = cards.length
  const tone =
    column.limit === undefined
      ? ''
      : count > column.limit
        ? 'text-destructive'
        : count === column.limit
          ? 'text-warning'
          : ''
  return (
    <section
      aria-labelledby={headingId}
      data-slot="kanban-column"
      className={cn(
        'flex w-72 shrink-0 flex-col gap-2 rounded-lg border border-border-subtle bg-surface/60 p-2',
        isOver && 'border-primary/60',
      )}
    >
      <header className="flex items-center justify-between gap-2 px-1.5 pt-1">
        <h3 id={headingId} className="m-0 text-[13px] font-semibold text-foreground">
          {column.title}
        </h3>
        <span className={cn('font-mono text-[11px] text-muted-foreground', tone)}>
          {column.limit === undefined
            ? formatNumber(count)
            : t.limit(formatNumber(count), formatNumber(column.limit))}
        </span>
      </header>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="m-0 flex min-h-16 list-none flex-col gap-2 p-0">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              columns={columns}
              onMove={onMove}
              onOpen={onOpen}
            />
          ))}
          {cards.length === 0 && (
            <li className="flex h-16 items-center justify-center rounded-md border border-dashed border-border text-[12px] text-muted-foreground">
              {t.empty}
            </li>
          )}
        </ul>
      </SortableContext>
      {footer}
    </section>
  )
}

function KanbanBoard({
  columns,
  cards,
  onCardsChange,
  onCardOpen,
  columnFooter,
  className,
}: {
  columns: KanbanColumn[]
  /** In display order; a card's column is its `columnId`. */
  cards: KanbanCard[]
  onCardsChange: (cards: KanbanCard[]) => void
  /** Clicking a card's title (open a sheet with the details…). */
  onCardOpen?: (card: KanbanCard) => void
  /** Under each column ("Add a card" button…). */
  columnFooter?: (column: KanbanColumn) => React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.kanban
  // While dragging, the board shows a working copy; the parent hears about the result on drop.
  const [items, setItems] = React.useState(cards)
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null)
  const [announcement, setAnnouncement] = React.useState('')
  React.useEffect(() => {
    if (activeId === null) setItems(cards)
  }, [cards, activeId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columnOf = (id: UniqueIdentifier, list = items) =>
    columns.some((c) => c.id === id) ? String(id) : list.find((c) => c.id === id)?.columnId
  const titleOf = (id: UniqueIdentifier) => items.find((c) => c.id === id)?.title ?? String(id)
  const columnTitle = (id?: string) => columns.find((c) => c.id === id)?.title ?? ''
  const positionOf = (id: UniqueIdentifier, list = items) => {
    const col = columnOf(id, list)
    return list.filter((c) => c.columnId === col).findIndex((c) => c.id === id) + 1
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => t.picked(titleOf(active.id), columnTitle(columnOf(active.id))),
    onDragOver: ({ active, over }) =>
      over
        ? t.over(
            titleOf(active.id),
            columnTitle(columnOf(over.id)),
            Math.max(positionOf(over.id), 1),
          )
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t.dropped(
            titleOf(active.id),
            columnTitle(columnOf(over.id)),
            Math.max(positionOf(active.id), 1),
          )
        : undefined,
    onDragCancel: ({ active }) => t.cancelled(titleOf(active.id)),
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)
  }

  // Crossing into another column moves the card there right away, so the drop position is live.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const from = columnOf(active.id)
    const to = columnOf(over.id)
    if (!from || !to || from === to) return
    setItems((prev) => {
      const card = prev.find((c) => c.id === active.id)
      if (!card) return prev
      const rest = prev.filter((c) => c.id !== active.id)
      const overIndex = rest.findIndex((c) => c.id === over.id)
      const moved = { ...card, columnId: to }
      if (overIndex >= 0) rest.splice(overIndex, 0, moved)
      else {
        let last = -1
        rest.forEach((c, i) => c.columnId === to && (last = i))
        rest.splice(last + 1, 0, moved)
      }
      return rest
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    let next = items
    if (
      over &&
      active.id !== over.id &&
      columnOf(active.id) === columnOf(over.id) &&
      !columns.some((c) => c.id === over.id)
    ) {
      next = arrayMove(
        items,
        items.findIndex((c) => c.id === active.id),
        items.findIndex((c) => c.id === over.id),
      )
    }
    setItems(next)
    const before = cards.map((c) => `${c.id}:${c.columnId}`).join()
    if (next.map((c) => `${c.id}:${c.columnId}`).join() !== before) onCardsChange(next)
  }

  const moveTo = (card: KanbanCard, columnId: string) => {
    const rest = items.filter((c) => c.id !== card.id)
    onCardsChange([...rest, { ...card, columnId }])
    setAnnouncement(t.moved(card.title, columnTitle(columnId)))
  }

  const active = activeId !== null ? items.find((c) => c.id === activeId) : undefined

  return (
    <div data-slot="kanban" className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements, screenReaderInstructions: { draggable: t.instructions } }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveId(null)
          setItems(cards)
        }}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            columns={columns}
            cards={items.filter((c) => c.columnId === column.id)}
            onMove={moveTo}
            onOpen={onCardOpen}
            footer={columnFooter?.(column)}
          />
        ))}
        <DragOverlay>
          {active ? (
            <div className="flex w-68 flex-col gap-1 rounded-md border border-primary bg-card p-2 pl-9 shadow-lg">
              <CardBody card={active} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}

export { KanbanBoard, type KanbanCard, type KanbanColumn }
