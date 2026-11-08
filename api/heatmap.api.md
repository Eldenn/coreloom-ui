# @coreloom/heatmap

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/heatmap.tsx

```ts
function CalendarHeatmap
CalendarHeatmap.data: readonly CalendarHeatmapDay[]
CalendarHeatmap.to?: string | undefined
CalendarHeatmap.weeks?: number | undefined
CalendarHeatmap.max?: number | undefined
CalendarHeatmap.color?: string | undefined
CalendarHeatmap.cellSize?: number | undefined
CalendarHeatmap.formatValue?: ((value: number) => string) | undefined
CalendarHeatmap.className?: string | undefined
CalendarHeatmap.aria-label?: string | undefined
type CalendarHeatmapDay = {}
CalendarHeatmapDay.date: string
CalendarHeatmapDay.value: number
type CalendarHeatmapProps = {}
CalendarHeatmapProps.data: readonly CalendarHeatmapDay[]
CalendarHeatmapProps.to?: string | undefined
CalendarHeatmapProps.weeks?: number | undefined
CalendarHeatmapProps.max?: number | undefined
CalendarHeatmapProps.color?: string | undefined
CalendarHeatmapProps.cellSize?: number | undefined
CalendarHeatmapProps.formatValue?: ((value: number) => string) | undefined
CalendarHeatmapProps.className?: string | undefined
CalendarHeatmapProps.aria-label?: string | undefined
function calendarWeeks(to: number, weeks: number) => number[][]
function Heatmap
Heatmap.data: readonly HeatmapCell[]
Heatmap.rows?: readonly string[] | undefined
Heatmap.columns?: readonly string[] | undefined
Heatmap.columnLabelEvery?: number | undefined
Heatmap.max?: number | undefined
Heatmap.color?: string | undefined
Heatmap.cellSize?: number | undefined
Heatmap.formatValue?: ((value: number) => string) | undefined
Heatmap.className?: string | undefined
Heatmap.aria-label?: string | undefined
type HeatmapCell = {}
HeatmapCell.row: string
HeatmapCell.column: string
HeatmapCell.value: number | null
function heatmapLevel(value: number | null | undefined, max: number) => number
type HeatmapProps = {}
HeatmapProps.data: readonly HeatmapCell[]
HeatmapProps.rows?: readonly string[] | undefined
HeatmapProps.columns?: readonly string[] | undefined
HeatmapProps.columnLabelEvery?: number | undefined
HeatmapProps.max?: number | undefined
HeatmapProps.color?: string | undefined
HeatmapProps.cellSize?: number | undefined
HeatmapProps.formatValue?: ((value: number) => string) | undefined
HeatmapProps.className?: string | undefined
HeatmapProps.aria-label?: string | undefined
function parseDay(date: string) => number
```
