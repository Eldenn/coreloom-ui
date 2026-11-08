# @coreloom/sparkline

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/sparkline.tsx

```ts
function Sparkline
Sparkline.data: readonly number[]
Sparkline.type?: 'area' | 'line' | 'bar' | undefined
Sparkline.color?: string | undefined
Sparkline.height?: number | undefined
Sparkline.width?: string | number | undefined
Sparkline.min?: number | undefined
Sparkline.max?: number | undefined
Sparkline.showLast?: boolean | undefined
Sparkline.formatValue?: ((value: number) => string) | undefined
Sparkline.aria-label?: string | undefined
Sparkline.*: react
function sparklinePoints(data: readonly number[], min?: number, max?: number) => { x: number; y: number; }[]
type SparklineProps = {}
SparklineProps.data: readonly number[]
SparklineProps.type?: 'area' | 'line' | 'bar' | undefined
SparklineProps.color?: string | undefined
SparklineProps.height?: number | undefined
SparklineProps.width?: string | number | undefined
SparklineProps.min?: number | undefined
SparklineProps.max?: number | undefined
SparklineProps.showLast?: boolean | undefined
SparklineProps.formatValue?: ((value: number) => string) | undefined
SparklineProps.aria-label?: string | undefined
SparklineProps.*: react
function sparklineSummary(data: readonly number[]) => { first: number; last: number; low: number; high: number; } | null
```
