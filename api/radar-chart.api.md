# @coreloom/radar-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/radar-chart.tsx

```ts
function RadarChart
RadarChart.data: readonly T[]
RadarChart.angleKey: keyof T & string
RadarChart.series: readonly RadarSeries[]
RadarChart.max?: number | undefined
RadarChart.height?: number | undefined
RadarChart.formatValue?: ((value: number) => string) | undefined
RadarChart.className?: string | undefined
RadarChart.aria-label?: string | undefined
type RadarChartProps<T extends object> = {}
RadarChartProps.data: readonly T[]
RadarChartProps.angleKey: keyof T & string
RadarChartProps.series: readonly RadarSeries[]
RadarChartProps.max?: number | undefined
RadarChartProps.height?: number | undefined
RadarChartProps.formatValue?: ((value: number) => string) | undefined
RadarChartProps.className?: string | undefined
RadarChartProps.aria-label?: string | undefined
type RadarSeries = {}
RadarSeries.key: string
RadarSeries.label: string
```
