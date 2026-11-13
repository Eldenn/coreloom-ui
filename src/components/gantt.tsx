'use client'

// Coreloom UI — Gantt (roadmap block). Tasks as bars on a timeline, with milestones, dependencies
// drawn as arrows, groups, a "today" line and a day / week / month zoom. Give it `onTaskChange` and
// people can move a bar or drag its ends (with the mouse, or the arrow keys); you save the new dates.
// It stores nothing: tasks come in as props, changes go out through callbacks.
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type GanttZoom = 'day' | 'week' | 'month'
type GanttTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface GanttTask {
  id: string
  name: string
  /** First day of the task. */
  start: Date
  /** Last day of the task (included). Ignored for milestones. */
  end: Date
  /** 0 to 100: drawn as a fill inside the bar. */
  progress?: number
  /** Tasks with the same group sit under one heading, in the order they first appear. */
  group?: string
  /** Ids of the tasks that must finish first: an arrow goes from each of them to this one. */
  dependsOn?: string[]
  /** A single date, drawn as a diamond. */
  milestone?: boolean
  tone?: GanttTone
}

interface GanttRange {
  start: Date
  end: Date
}

const DAY = 86_400_000
/** Width of one day, in pixels, at each zoom. */
const DAY_WIDTH: Record<GanttZoom, number> = { day: 40, week: 18, month: 5 }
/** Empty days shown before the first task and after the last one. */
const PADDING: Record<GanttZoom, number> = { day: 3, week: 7, month: 20 }
const ROW = 40

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Whole days from a to b. Rounded, so a daylight-saving change (23 or 25 hours) still counts 1. */
const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY)
/** Monday of d's week. */
const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))

/** The days the timeline covers for these tasks: padded, and aligned to whole weeks or months. */
function ganttRange(tasks: readonly GanttTask[], zoom: GanttZoom, today?: Date): GanttRange {
  const dates = tasks.flatMap((t) => (t.milestone ? [t.start] : [t.start, t.end]))
  // With no tasks, show the month ahead of today rather than a sliver.
  const now = startOfDay(today ?? new Date())
  dates.push(now)
  if (!tasks.length) dates.push(addDays(now, 30))
  const min = new Date(Math.min(...dates.map((d) => startOfDay(d).getTime())))
  const max = new Date(Math.max(...dates.map((d) => startOfDay(d).getTime())))
  let start = addDays(min, -PADDING[zoom])
  let end = addDays(max, PADDING[zoom])
  if (zoom === 'week') {
    start = startOfWeek(start)
    end = addDays(startOfWeek(end), 6)
  } else if (zoom === 'month') {
    start = new Date(start.getFullYear(), start.getMonth(), 1)
    end = new Date(end.getFullYear(), end.getMonth() + 1, 0)
  }
  return { start, end }
}

interface GanttColumn {
  key: string
  /** First day of the column, counted from the range's start. */
  offset: number
  days: number
  label: string
}

/** The scale's two rows: the units (days, weeks or months) and the bands above them. */
function ganttColumns(range: GanttRange, zoom: GanttZoom, locale: string) {
  const total = dayDiff(range.start, range.end) + 1
  const units: GanttColumn[] = []
  const bands: GanttColumn[] = []
  const month = new Intl.DateTimeFormat(locale, { month: 'short' })
  const monthYear = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const dayNumber = new Intl.DateTimeFormat(locale, { day: 'numeric' })
  const push = (list: GanttColumn[], key: string, offset: number, label: string) => {
    const last = list.at(-1)
    if (last?.key === key) last.days++
    else list.push({ key, offset, days: 1, label })
  }
  for (let i = 0; i < total; i++) {
    const d = addDays(range.start, i)
    if (zoom === 'day') {
      units.push({ key: `d${i}`, offset: i, days: 1, label: dayNumber.format(d) })
      push(bands, `${d.getFullYear()}-${d.getMonth()}`, i, monthYear.format(d))
    } else if (zoom === 'week') {
      const monday = startOfWeek(d)
      push(units, monday.toDateString(), i, `${dayNumber.format(monday)} ${month.format(monday)}`)
      push(bands, `${d.getFullYear()}-${d.getMonth()}`, i, monthYear.format(d))
    } else {
      push(units, `${d.getFullYear()}-${d.getMonth()}`, i, month.format(d))
      push(bands, String(d.getFullYear()), i, String(d.getFullYear()))
    }
  }
  return { units, bands, total }
}

/** A task's dates after `delta` days of a move or of a drag on one of its ends. */
function shiftTask(
  task: Pick<GanttTask, 'start' | 'end' | 'milestone'>,
  mode: 'move' | 'start' | 'end',
  delta: number,
): GanttRange {
  const end = task.milestone ? task.start : task.end
  if (mode === 'move') return { start: addDays(task.start, delta), end: addDays(end, delta) }
  if (mode === 'start') {
    const start = addDays(task.start, delta)
    return { start: start > end ? end : start, end }
  }
  const next = addDays(end, delta)
  return { start: task.start, end: next < task.start ? task.start : next }
}

/** True when a task starts before the one it waits for has ended. A milestone never makes one late. */
const startsBeforeEnd = (from: GanttTask, fromDates: GanttRange, dates: GanttRange) =>
  !from.milestone && dayDiff(fromDates.end, dates.start) <= 0

/** What the arrow keys change: Alt moves the first day alone, Shift the last one. */
function keyMode(e: { altKey: boolean; shiftKey: boolean }): Drag['mode'] {
  if (e.altKey) return 'start'
  return e.shiftKey ? 'end' : 'move'
}

const tones: Record<GanttTone, { bar: string; fill: string; diamond: string }> = {
  primary: {
    bar: 'border-primary/55 bg-primary-subtle',
    fill: 'bg-primary/30',
    diamond: 'bg-primary',
  },
  success: {
    bar: 'border-success/55 bg-success-subtle',
    fill: 'bg-success/30',
    diamond: 'bg-success',
  },
  warning: {
    bar: 'border-warning/55 bg-warning-subtle',
    fill: 'bg-warning/30',
    diamond: 'bg-warning',
  },
  danger: {
    bar: 'border-destructive/55 bg-destructive-subtle',
    fill: 'bg-destructive/30',
    diamond: 'bg-destructive',
  },
  info: { bar: 'border-info/55 bg-info-subtle', fill: 'bg-info/30', diamond: 'bg-info' },
  neutral: {
    bar: 'border-border-strong bg-secondary',
    fill: 'bg-border-strong/60',
    diamond: 'bg-border-strong',
  },
}

type Row =
  { kind: 'group'; key: string; label: string } | { kind: 'task'; key: string; task: GanttTask }

interface Drag {
  id: string
  mode: 'move' | 'start' | 'end'
  pointerId: number
  originX: number
  delta: number
}

function Gantt({
  tasks,
  zoom: zoomProp,
  defaultZoom = 'week',
  onZoomChange,
  today: todayProp,
  selectedId,
  onTaskClick,
  onTaskChange,
  title,
  toolbar,
  className,
}: {
  tasks: GanttTask[]
  zoom?: GanttZoom
  /** "week" by default. */
  defaultZoom?: GanttZoom
  onZoomChange?: (zoom: GanttZoom) => void
  /** Where the "today" line goes and what Today scrolls to. The current date by default. */
  today?: Date
  /** Outlines this task's bar. */
  selectedId?: string
  onTaskClick?: (task: GanttTask) => void
  /** Makes bars movable: called once a move or a resize ends, with the new first and last days. */
  onTaskChange?: (id: string, range: GanttRange) => unknown
  title?: React.ReactNode
  /** Extra controls at the right of the toolbar (a filter, an "Add task" button). */
  toolbar?: React.ReactNode
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.gantt
  const [zoomState, setZoomState] = React.useState<GanttZoom>(defaultZoom)
  const zoom = zoomProp ?? zoomState
  const [now] = React.useState(() => new Date())
  const today = todayProp ?? now
  const [drag, setDrag] = React.useState<Drag | null>(null)
  const [announcement, setAnnouncement] = React.useState('')
  const scroller = React.useRef<HTMLDivElement>(null)
  const dragged = React.useRef(false)
  const titleId = React.useId()
  const hintId = React.useId()
  const markerId = React.useId()

  const range = React.useMemo(() => ganttRange(tasks, zoom, today), [tasks, zoom, today])
  const scale = React.useMemo(() => ganttColumns(range, zoom, locale), [range, zoom, locale])
  const dayWidth = DAY_WIDTH[zoom]
  const width = scale.total * dayWidth
  const fullDate = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const rows = React.useMemo<Row[]>(() => {
    const out: Row[] = []
    const groups = new Map<string, GanttTask[]>()
    const loose: GanttTask[] = []
    for (const task of tasks) {
      if (task.group === undefined) loose.push(task)
      else groups.set(task.group, [...(groups.get(task.group) ?? []), task])
    }
    for (const task of loose) out.push({ kind: 'task', key: task.id, task })
    for (const [label, list] of groups) {
      out.push({ kind: 'group', key: `group:${label}`, label })
      for (const task of list) out.push({ kind: 'task', key: task.id, task })
    }
    return out
  }, [tasks])

  /** The dates drawn for a task: its own, or the ones under the pointer while it is dragged. */
  const datesOf = (task: GanttTask): GanttRange =>
    drag?.id === task.id
      ? shiftTask(task, drag.mode, drag.delta)
      : { start: task.start, end: task.milestone ? task.start : task.end }
  const x = (d: Date) => dayDiff(range.start, d) * dayWidth
  const rowOf = new Map(rows.map((r, i) => [r.key, i]))
  const byId = new Map(tasks.map((task) => [task.id, task]))

  const setZoom = (next: GanttZoom) => {
    if (zoomProp === undefined) setZoomState(next)
    onZoomChange?.(next)
  }

  const scrollToToday = React.useCallback(
    (behavior: ScrollBehavior) => {
      const el = scroller.current
      if (!el) return
      const list = el.querySelector<HTMLElement>('[data-slot=gantt-corner]')?.offsetWidth ?? 0
      const left = dayDiff(range.start, today) * dayWidth - (el.clientWidth - list) / 3
      el.scrollTo({ left: Math.max(0, left), behavior })
    },
    [range.start, today, dayWidth],
  )
  // Open on today, and keep it in view when the zoom changes the scale under it.
  React.useLayoutEffect(() => {
    scrollToToday('instant')
  }, [scrollToToday])

  const describe = (task: GanttTask, dates: GanttRange) => {
    const parts = [
      task.milestone
        ? t.milestone(task.name, fullDate.format(dates.start))
        : t.task(task.name, fullDate.format(dates.start), fullDate.format(dates.end)),
    ]
    if (task.progress !== undefined && !task.milestone)
      parts.push(t.progress(Math.round(task.progress)))
    const waitsFor = (task.dependsOn ?? []).flatMap((id) => byId.get(id) ?? [])
    if (waitsFor.length) parts.push(t.dependsOn(waitsFor.map((from) => from.name).join(', ')))
    // The red, dashed arrow in words: the drawing is hidden from assistive technology.
    const late = waitsFor.filter((from) => startsBeforeEnd(from, datesOf(from), dates))
    if (late.length) parts.push(t.startsBefore(late.map((from) => from.name).join(', ')))
    return parts.join(', ')
  }

  const commit = (task: GanttTask, next: GanttRange) => {
    const end = task.milestone ? task.start : task.end
    if (dayDiff(task.start, next.start) === 0 && dayDiff(end, next.end) === 0) return
    void onTaskChange?.(task.id, next)
    setAnnouncement(
      task.milestone
        ? t.milestone(task.name, fullDate.format(next.start))
        : t.task(task.name, fullDate.format(next.start), fullDate.format(next.end)),
    )
  }

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, task: GanttTask) => {
    if (!onTaskChange || e.button !== 0) return
    const edge = (e.target as HTMLElement).dataset.edge
    const mode = edge === 'start' || edge === 'end' ? edge : 'move'
    e.currentTarget.setPointerCapture(e.pointerId)
    dragged.current = false
    setDrag({ id: task.id, mode, pointerId: e.pointerId, originX: e.clientX, delta: 0 })
  }
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (drag?.pointerId !== e.pointerId) return
    const delta = Math.round((e.clientX - drag.originX) / dayWidth)
    if (delta !== drag.delta) {
      dragged.current = true
      setDrag({ ...drag, delta })
    }
  }
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>, task: GanttTask) => {
    if (drag?.pointerId !== e.pointerId) return
    commit(task, shiftTask(task, drag.mode, drag.delta))
    setDrag(null)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, task: GanttTask) => {
    if (!onTaskChange || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
    e.preventDefault()
    const step = e.key === 'ArrowLeft' ? -1 : 1
    commit(task, shiftTask(task, task.milestone ? 'move' : keyMode(e), step))
  }

  const todayX = x(today)
  const showToday = todayX >= 0 && todayX < width

  return (
    <div
      data-slot="gantt"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <p
          id={titleId}
          className="m-0 mr-auto font-display text-[15px] font-semibold text-foreground"
        >
          {title ?? t.title}
        </p>
        {toolbar}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            scrollToToday(still ? 'auto' : 'smooth')
          }}
        >
          {t.today}
        </Button>
        <SegmentedControl
          size="sm"
          aria-label={t.zoom}
          value={zoom}
          onValueChange={(v) => setZoom(v as GanttZoom)}
          options={[
            { value: 'day', label: t.day },
            { value: 'week', label: t.week },
            { value: 'month', label: t.month },
          ]}
        />
      </div>
      {onTaskChange && (
        <p id={hintId} className="sr-only">
          {t.editHint}
        </p>
      )}
      <div
        ref={scroller}
        role="group"
        aria-labelledby={titleId}
        className="relative max-h-[560px] overflow-auto overscroll-x-contain [--gantt-list:136px] sm:[--gantt-list:220px]"
      >
        {rows.length === 0 ? (
          <p className="m-0 px-4 py-10 text-center text-[13px] text-muted-foreground">{t.empty}</p>
        ) : (
          <div className="relative" style={{ width: `calc(var(--gantt-list) + ${width}px)` }}>
            {/* Scale */}
            <div aria-hidden className="sticky top-0 z-20 flex border-b border-border bg-card">
              <div
                data-slot="gantt-corner"
                className="sticky left-0 z-10 flex w-(--gantt-list) shrink-0 items-end border-r border-border bg-card px-3 pb-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
              >
                {t.tasks}
              </div>
              <div className="relative shrink-0" style={{ width }}>
                <div className="relative h-6 border-b border-border-subtle">
                  {scale.bands.map((b) => (
                    <span
                      key={b.key}
                      className="absolute top-0 flex h-6 items-center truncate border-l border-border-subtle px-2 text-[12px] font-medium text-fg-secondary first:border-l-0"
                      style={{ left: b.offset * dayWidth, width: b.days * dayWidth }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
                <div className="relative h-6">
                  {scale.units.map((u) => (
                    <span
                      key={u.key}
                      className={cn(
                        'absolute top-0 flex h-6 items-center truncate border-l border-border-subtle font-mono text-[11px] text-muted-foreground first:border-l-0',
                        zoom === 'day' ? 'justify-center' : 'px-1.5',
                      )}
                      style={{ left: u.offset * dayWidth, width: u.days * dayWidth }}
                    >
                      {u.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Grid lines, weekends and today */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0"
                style={{ left: 'var(--gantt-list)', width }}
              >
                {zoom === 'day' &&
                  scale.units.map((u) => {
                    const day = addDays(range.start, u.offset).getDay()
                    return day === 0 || day === 6 ? (
                      <span
                        key={u.key}
                        className="absolute inset-y-0 bg-inset/60"
                        style={{ left: u.offset * dayWidth, width: dayWidth }}
                      />
                    ) : null
                  })}
                {scale.units.map((u) => (
                  <span
                    key={u.key}
                    className="absolute inset-y-0 w-px bg-border-subtle first:hidden"
                    style={{ left: u.offset * dayWidth }}
                  />
                ))}
                {showToday && (
                  <span
                    data-slot="gantt-today"
                    className="absolute inset-y-0 z-[1] w-0.5 bg-primary/70"
                    style={{ left: todayX + dayWidth / 2 - 1 }}
                  />
                )}
              </div>

              {/* Dependencies */}
              <svg
                aria-hidden
                className="pointer-events-none absolute top-0 z-[2] overflow-visible"
                style={{ left: 'var(--gantt-list)' }}
                width={width}
                height={rows.length * ROW}
              >
                <defs>
                  <marker
                    id={markerId}
                    viewBox="0 0 8 8"
                    refX="7"
                    refY="4"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M0,0 L8,4 L0,8 z" className="fill-muted-foreground" />
                  </marker>
                </defs>
                {tasks.flatMap((task) =>
                  (task.dependsOn ?? []).flatMap((fromId) => {
                    const from = byId.get(fromId)
                    const fromRow = rowOf.get(fromId)
                    const toRow = rowOf.get(task.id)
                    if (!from || fromRow === undefined || toRow === undefined) return []
                    const a = datesOf(from)
                    const b = datesOf(task)
                    const x1 = x(a.end) + (from.milestone ? dayWidth / 2 + 7 : dayWidth)
                    const x2 = x(b.start) + (task.milestone ? dayWidth / 2 - 8 : 0)
                    const y1 = fromRow * ROW + ROW / 2
                    const y2 = toRow * ROW + ROW / 2
                    const late = startsBeforeEnd(from, a, b)
                    const d =
                      x2 - x1 >= 16
                        ? `M${x1},${y1} H${x1 + 8} V${y2} H${x2}`
                        : `M${x1},${y1} H${x1 + 8} V${y1 + (y2 > y1 ? ROW / 2 : -ROW / 2)} H${x2 - 10} V${y2} H${x2}`
                    return [
                      <path
                        key={`${fromId}->${task.id}`}
                        d={d}
                        fill="none"
                        strokeWidth={1.25}
                        markerEnd={`url(#${markerId})`}
                        data-late={late || undefined}
                        // Dashed as well as red: colour alone doesn't say it is late.
                        strokeDasharray={late ? '4 3' : undefined}
                        className={late ? 'stroke-destructive' : 'stroke-muted-foreground/70'}
                      />,
                    ]
                  }),
                )}
              </svg>

              <ul className="relative m-0 list-none p-0">
                {rows.map((row) => {
                  if (row.kind === 'group') {
                    const list = tasks.filter((task) => task.group === row.label)
                    const first = Math.min(...list.map((task) => x(task.start)))
                    const last = Math.max(
                      ...list.map((task) => x(task.milestone ? task.start : task.end) + dayWidth),
                    )
                    return (
                      <li
                        key={row.key}
                        data-slot="gantt-group"
                        className="flex"
                        style={{ height: ROW }}
                      >
                        <span className="sticky left-0 z-10 flex w-(--gantt-list) shrink-0 items-center border-r border-border bg-surface px-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                          <span className="truncate">{row.label}</span>
                        </span>
                        <span
                          aria-hidden
                          className="relative shrink-0 bg-surface/50"
                          style={{ width }}
                        >
                          <span
                            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border-strong"
                            style={{ left: first, width: last - first }}
                          />
                        </span>
                      </li>
                    )
                  }
                  const task = row.task
                  const dates = datesOf(task)
                  const tone = tones[task.tone ?? 'primary']
                  const left = x(dates.start)
                  const barWidth = (dayDiff(dates.start, dates.end) + 1) * dayWidth
                  const label = describe(task, dates)
                  const selected = task.id === selectedId
                  const narrow = barWidth < 96
                  const handlers = {
                    onClick: () => {
                      if (dragged.current) dragged.current = false
                      else onTaskClick?.(task)
                    },
                    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
                      onPointerDown(e, task)
                    },
                    onPointerMove,
                    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
                      onPointerUp(e, task)
                    },
                    onPointerCancel: () => {
                      setDrag(null)
                    },
                    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
                      onKeyDown(e, task)
                    },
                  }
                  return (
                    <li
                      key={row.key}
                      data-slot="gantt-row"
                      // The row's line is drawn by its two cells, so the name cell (above the
                      // arrows) hides the arrows' line too.
                      className="group/row flex"
                      style={{ height: ROW }}
                    >
                      <span className="sticky left-0 z-10 flex w-(--gantt-list) shrink-0 items-center gap-2 border-r border-b border-r-border border-b-border-subtle bg-card px-3 text-[13px] text-foreground group-last/row:border-b-0">
                        <span className="truncate">{task.name}</span>
                      </span>
                      <span
                        className="relative shrink-0 border-b border-border-subtle group-last/row:border-b-0"
                        style={{ width }}
                      >
                        {task.milestone ? (
                          <button
                            type="button"
                            data-slot="gantt-milestone"
                            aria-label={label}
                            aria-describedby={onTaskChange ? hintId : undefined}
                            aria-pressed={onTaskClick ? selected : undefined}
                            className={cn(
                              'group absolute top-1/2 z-[3] flex -translate-y-1/2 items-center gap-2 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                              onTaskChange && 'cursor-grab touch-none active:cursor-grabbing',
                            )}
                            style={{ left: left + dayWidth / 2 - 7 }}
                            {...handlers}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'size-3.5 rotate-45 rounded-[2px] ring-2 ring-card',
                                tone.diamond,
                                selected && 'ring-ring',
                              )}
                            />
                            <span
                              aria-hidden
                              className="text-[12.5px] font-medium whitespace-nowrap text-foreground"
                            >
                              {task.name}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            data-slot="gantt-bar"
                            aria-label={label}
                            aria-describedby={onTaskChange ? hintId : undefined}
                            aria-pressed={onTaskClick ? selected : undefined}
                            className={cn(
                              'group absolute top-1/2 z-[3] flex h-7 -translate-y-1/2 items-center overflow-visible rounded-md border text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
                              tone.bar,
                              selected && 'ring-2 ring-ring',
                              onTaskChange && 'cursor-grab touch-none active:cursor-grabbing',
                              drag?.id === task.id && 'shadow-md',
                            )}
                            style={{ left, width: barWidth }}
                            {...handlers}
                          >
                            {task.progress !== undefined && (
                              <span
                                aria-hidden
                                className={cn(
                                  'absolute inset-y-0 left-0 rounded-l-[5px]',
                                  tone.fill,
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                              />
                            )}
                            <span
                              aria-hidden
                              className={cn(
                                'relative truncate px-2 text-[12.5px] font-medium text-foreground',
                                narrow && 'absolute left-full pl-2 whitespace-nowrap',
                              )}
                            >
                              {task.name}
                            </span>
                            {onTaskChange && (
                              <>
                                <span
                                  aria-hidden
                                  data-edge="start"
                                  // Drawn 8 px wide; the pseudo-element makes it 24 px to grab,
                                  // outwards so a short bar can still be moved by its middle.
                                  className="absolute inset-y-0 left-0 w-2 cursor-ew-resize rounded-l-md group-hover:bg-foreground/10 before:absolute before:inset-y-0 before:right-0 before:w-6"
                                />
                                <span
                                  aria-hidden
                                  data-edge="end"
                                  className="absolute inset-y-0 right-0 w-2 cursor-ew-resize rounded-r-md group-hover:bg-foreground/10 before:absolute before:inset-y-0 before:left-0 before:w-6"
                                />
                              </>
                            )}
                          </button>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

export {
  dayDiff,
  Gantt,
  type GanttColumn,
  ganttColumns,
  type GanttRange,
  ganttRange,
  type GanttTask,
  type GanttTone,
  type GanttZoom,
  shiftTask,
}
