# @coreloom/treemap-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/treemap-chart.tsx

```ts
function TreemapChart
TreemapChart.data: readonly TreemapItem[]
TreemapChart.groups?: readonly TreemapGroup[] | undefined
TreemapChart.height?: number | undefined
TreemapChart.formatValue?: ((value: number) => string) | undefined
TreemapChart.className?: string | undefined
TreemapChart.aria-label?: string | undefined
type TreemapChartProps = {}
TreemapChartProps.data: readonly TreemapItem[]
TreemapChartProps.groups?: readonly TreemapGroup[] | undefined
TreemapChartProps.height?: number | undefined
TreemapChartProps.formatValue?: ((value: number) => string) | undefined
TreemapChartProps.className?: string | undefined
TreemapChartProps.aria-label?: string | undefined
type TreemapGroup = {}
TreemapGroup.key: string
TreemapGroup.label: string
type TreemapItem = {}
TreemapItem.name: string
TreemapItem.value: number
TreemapItem.group?: string | undefined
```
