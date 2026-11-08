# @coreloom/context-meter

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/context-meter.tsx

```ts
function ContextBreakdown
ContextBreakdown.used: number | AiUsage
ContextBreakdown.max?: number | undefined
ContextBreakdown.cost?: number | undefined
ContextBreakdown.model?: AiModel | undefined
ContextBreakdown.className?: string | undefined
function ContextMeter
ContextMeter.used: number | AiUsage
ContextMeter.max?: number | undefined
ContextMeter.cost?: number | undefined
ContextMeter.model?: AiModel | undefined
ContextMeter.variant?: 'bar' | 'ring' | undefined
ContextMeter.showValue?: boolean | undefined
ContextMeter.className?: string | undefined
type ContextMeterProps = {}
ContextMeterProps.used: number | AiUsage
ContextMeterProps.max?: number | undefined
ContextMeterProps.cost?: number | undefined
ContextMeterProps.model?: AiModel | undefined
```
