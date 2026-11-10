# @coreloom/dashboard

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/dashboard.tsx

```ts
function ActivityFeed
ActivityFeed.items: ActivityItem[]
ActivityFeed.title?: React.ReactNode
ActivityFeed.className?: string | undefined
type ActivityItem = {}
ActivityItem.id: string
ActivityItem.title: React.ReactNode
ActivityItem.description?: React.ReactNode
ActivityItem.time?: React.ReactNode
ActivityItem.icon?: React.ReactNode
ActivityItem.status?: 'neutral' | 'success' | 'warning' | 'danger' | undefined
function ChartCard
ChartCard.title: React.ReactNode
ChartCard.description?: React.ReactNode
ChartCard.actions?: React.ReactNode
ChartCard.children: React.ReactNode
ChartCard.className?: string | undefined
function StatGrid
StatGrid.stats: { label: string; value: React.ReactNode; delta?: string; trend?: 'up' | 'down'; good?: boolean; note?: string; sparkline?: readonly number[]; className?: string; }[]
StatGrid.className?: string | undefined
function TrendChart
TrendChart.data: T[]
TrendChart.xKey: keyof T & string
TrendChart.series: TrendSeries[]
TrendChart.type?: 'area' | 'line' | 'bar' | undefined
TrendChart.stacked?: boolean | 'percent' | undefined
TrendChart.height?: number | undefined
TrendChart.formatValue?: ((value: number) => string) | undefined
TrendChart.formatSecondaryValue?: ((value: number) => string) | undefined
TrendChart.className?: string | undefined
TrendChart.aria-label?: string | undefined
type TrendSeries = {}
TrendSeries.key: string
TrendSeries.label: string
TrendSeries.type?: 'area' | 'line' | 'bar' | undefined
TrendSeries.axis?: 'left' | 'right' | undefined
```

## src/components/stat-card.tsx

```ts
function StatCard
StatCard.label: string
StatCard.value: React.ReactNode
StatCard.delta?: string | undefined
StatCard.trend?: 'up' | 'down' | undefined
StatCard.good?: boolean | undefined
StatCard.note?: string | undefined
StatCard.sparkline?: readonly number[] | undefined
StatCard.className?: string | undefined
```
