# @coreloom/quota-bar

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/quota-bar.tsx

```ts
function QuotaBar
QuotaBar.label: React.ReactNode
QuotaBar.segments?: QuotaSegment[] | undefined
QuotaBar.value?: number | undefined
QuotaBar.max: number
QuotaBar.warnAt?: number | undefined
QuotaBar.dangerAt?: number | undefined
QuotaBar.legend?: boolean | undefined
QuotaBar.description?: React.ReactNode
QuotaBar.unit?: string | undefined
QuotaBar.currency?: string | undefined
QuotaBar.maximumFractionDigits?: number | undefined
QuotaBar.base?: 1000 | 1024 | undefined
QuotaBar.format?: import("@/components/ui/format").NumberFormat | undefined
QuotaBar.*: react
type QuotaSegment = {}
QuotaSegment.label: string
QuotaSegment.value: number
QuotaSegment.className?: string | undefined
```
