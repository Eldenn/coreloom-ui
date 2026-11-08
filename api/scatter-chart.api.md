# @coreloom/scatter-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/scatter-chart.tsx

```ts
function ScatterChart
ScatterChart.groups: readonly ScatterGroup[]
ScatterChart.xLabel: string
ScatterChart.yLabel: string
ScatterChart.sizeLabel?: string | undefined
ScatterChart.formatX?: ((value: number) => string) | undefined
ScatterChart.formatY?: ((value: number) => string) | undefined
ScatterChart.formatSize?: ((value: number) => string) | undefined
ScatterChart.height?: number | undefined
ScatterChart.className?: string | undefined
ScatterChart.aria-label?: string | undefined
type ScatterChartProps = {}
ScatterChartProps.groups: readonly ScatterGroup[]
ScatterChartProps.xLabel: string
ScatterChartProps.yLabel: string
ScatterChartProps.sizeLabel?: string | undefined
ScatterChartProps.formatX?: ((value: number) => string) | undefined
ScatterChartProps.formatY?: ((value: number) => string) | undefined
ScatterChartProps.formatSize?: ((value: number) => string) | undefined
ScatterChartProps.height?: number | undefined
ScatterChartProps.className?: string | undefined
ScatterChartProps.aria-label?: string | undefined
type ScatterGroup = {}
ScatterGroup.key: string
ScatterGroup.label: string
ScatterGroup.points: readonly ScatterPoint[]
type ScatterPoint = {}
ScatterPoint.x: number
ScatterPoint.y: number
ScatterPoint.size?: number | undefined
ScatterPoint.name?: string | undefined
```
