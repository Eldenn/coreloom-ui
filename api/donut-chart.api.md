# @coreloom/donut-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/donut-chart.tsx

```ts
function DonutChart
DonutChart.data: readonly DonutSlice[]
DonutChart.maxSlices?: number | undefined
DonutChart.centerLabel?: React.ReactNode
DonutChart.centerValue?: React.ReactNode
DonutChart.formatValue?: ((value: number) => string) | undefined
DonutChart.size?: number | undefined
DonutChart.legend?: 'none' | 'right' | 'bottom' | undefined
DonutChart.aria-label?: string | undefined
DonutChart.*: react
type DonutChartProps = {}
DonutChartProps.data: readonly DonutSlice[]
DonutChartProps.maxSlices?: number | undefined
DonutChartProps.centerLabel?: React.ReactNode
DonutChartProps.centerValue?: React.ReactNode
DonutChartProps.formatValue?: ((value: number) => string) | undefined
DonutChartProps.size?: number | undefined
DonutChartProps.legend?: 'none' | 'right' | 'bottom' | undefined
DonutChartProps.aria-label?: string | undefined
DonutChartProps.*: react
function donutParts(data: readonly DonutSlice[], maxSlices: number, otherLabel: React.ReactNode) => { parts: DonutPart[]; total: number; }
type DonutSlice = {}
DonutSlice.key: string
DonutSlice.label: React.ReactNode
DonutSlice.value: number
```
