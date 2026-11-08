# @coreloom/funnel-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/funnel-chart.tsx

```ts
function FunnelChart
FunnelChart.steps: readonly FunnelStep[]
FunnelChart.color?: string | undefined
FunnelChart.formatValue?: ((value: number) => string) | undefined
FunnelChart.aria-label?: string | undefined
FunnelChart.*: react
type FunnelChartProps = {}
FunnelChartProps.steps: readonly FunnelStep[]
FunnelChartProps.color?: string | undefined
FunnelChartProps.formatValue?: ((value: number) => string) | undefined
FunnelChartProps.aria-label?: string | undefined
FunnelChartProps.*: react
function funnelRates(steps: readonly { value: number; }[]) => { ofStart: number; ofPrevious: number; }[]
type FunnelStep = {}
FunnelStep.key: string
FunnelStep.label: React.ReactNode
FunnelStep.value: number
```
