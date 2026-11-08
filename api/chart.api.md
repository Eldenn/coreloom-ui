# @coreloom/chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/chart.tsx

```ts
type ChartConfig = { [x: string]: { label?: React.ReactNode; icon?: React.ComponentType; } & ({ color?: string; theme?: never; } | { color?: never; theme: Record<keyof typeof THEMES, string>; }); }
function ChartContainer
ChartContainer.children: React.ReactNode
ChartContainer.config: ChartConfig
ChartContainer.initialDimension?: {}
ChartContainer.initialDimension.width: number
ChartContainer.initialDimension.height: number
ChartContainer.*: react
function ChartLegend
ChartLegend.*: react | recharts
function ChartLegendContent
ChartLegendContent.hideIcon?: boolean | undefined
ChartLegendContent.nameKey?: string | undefined
ChartLegendContent.*: react | recharts
function ChartStyle
ChartStyle.id: string
ChartStyle.config: ChartConfig
function ChartTooltip
ChartTooltip.*: recharts
function ChartTooltipContent
ChartTooltipContent.hideLabel?: boolean | undefined
ChartTooltipContent.hideIndicator?: boolean | undefined
ChartTooltipContent.indicator?: 'line' | 'dot' | 'dashed' | undefined
ChartTooltipContent.nameKey?: string | undefined
ChartTooltipContent.labelKey?: string | undefined
ChartTooltipContent.*: react | recharts
```
