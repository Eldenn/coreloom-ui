# @coreloom/gauge

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/gauge.tsx

```ts
function Gauge
Gauge.value: number
Gauge.min?: number | undefined
Gauge.max?: number | undefined
Gauge.warning?: number | undefined
Gauge.critical?: number | undefined
Gauge.higherIsBetter?: boolean | undefined
Gauge.label?: React.ReactNode
Gauge.unit?: string | undefined
Gauge.formatValue?: ((value: number) => string) | undefined
Gauge.size?: number | undefined
Gauge.*: react
type GaugeProps = {}
GaugeProps.value: number
GaugeProps.min?: number | undefined
GaugeProps.max?: number | undefined
GaugeProps.warning?: number | undefined
GaugeProps.critical?: number | undefined
GaugeProps.higherIsBetter?: boolean | undefined
GaugeProps.label?: React.ReactNode
GaugeProps.unit?: string | undefined
GaugeProps.formatValue?: ((value: number) => string) | undefined
GaugeProps.size?: number | undefined
GaugeProps.*: react
type GaugeStatus = 'warning' | 'critical' | 'ok'
function gaugeStatus(value: number, { warning, critical, higherIsBetter, }: Pick<GaugeProps, 'warning' | 'critical' | 'higherIsBetter'>) => GaugeStatus
```
