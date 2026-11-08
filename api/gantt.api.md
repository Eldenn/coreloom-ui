# @coreloom/gantt

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/gantt.tsx

```ts
function dayDiff(a: Date, b: Date) => number
function Gantt
Gantt.tasks: GanttTask[]
Gantt.zoom?: GanttZoom | undefined
Gantt.defaultZoom?: GanttZoom | undefined
Gantt.onZoomChange?: ((zoom: GanttZoom) => void) | undefined
Gantt.today?: Date | undefined
Gantt.selectedId?: string | undefined
Gantt.onTaskClick?: ((task: GanttTask) => void) | undefined
Gantt.onTaskChange?: ((id: string, range: GanttRange) => unknown) | undefined
Gantt.title?: React.ReactNode
Gantt.toolbar?: React.ReactNode
Gantt.className?: string | undefined
type GanttColumn = {}
GanttColumn.key: string
GanttColumn.offset: number
GanttColumn.days: number
GanttColumn.label: string
function ganttColumns(range: GanttRange, zoom: GanttZoom, locale: string) => { units: GanttColumn[]; bands: GanttColumn[]; total: number; }
type GanttRange = {}
GanttRange.start: Date
GanttRange.end: Date
function ganttRange(tasks: readonly GanttTask[], zoom: GanttZoom, today?: Date) => GanttRange
type GanttTask = {}
GanttTask.id: string
GanttTask.name: string
GanttTask.start: Date
GanttTask.end: Date
GanttTask.progress?: number | undefined
GanttTask.group?: string | undefined
GanttTask.dependsOn?: string[] | undefined
GanttTask.milestone?: boolean | undefined
GanttTask.tone?: GanttTone | undefined
type GanttTone = 'primary' | 'neutral' | 'success' | 'info' | 'warning' | 'danger'
type GanttZoom = 'month' | 'week' | 'day'
function shiftTask(task: Pick<GanttTask, 'start' | 'end' | 'milestone'>, mode: 'move' | 'start' | 'end', delta: number) => GanttRange
```
