# @coreloom/format

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/format.tsx

```ts
function AnimatedNumber
AnimatedNumber.format?: NumberFormat | undefined
AnimatedNumber.currency?: string | undefined
AnimatedNumber.unit?: string | undefined
AnimatedNumber.minimumFractionDigits?: number | undefined
AnimatedNumber.maximumFractionDigits?: number | undefined
AnimatedNumber.signDisplay?: keyof Intl.NumberFormatOptionsSignDisplayRegistry | undefined
AnimatedNumber.base?: 1000 | 1024 | undefined
AnimatedNumber.value: number
AnimatedNumber.from?: number | undefined
AnimatedNumber.duration?: number | undefined
AnimatedNumber.className?: string | undefined
function FormatNumber
FormatNumber.format?: NumberFormat | undefined
FormatNumber.currency?: string | undefined
FormatNumber.unit?: string | undefined
FormatNumber.minimumFractionDigits?: number | undefined
FormatNumber.maximumFractionDigits?: number | undefined
FormatNumber.signDisplay?: keyof Intl.NumberFormatOptionsSignDisplayRegistry | undefined
FormatNumber.base?: 1000 | 1024 | undefined
FormatNumber.value: number
FormatNumber.className?: string | undefined
type FormatOptions = {}
FormatOptions.format?: NumberFormat | undefined
FormatOptions.currency?: string | undefined
FormatOptions.unit?: string | undefined
FormatOptions.minimumFractionDigits?: number | undefined
FormatOptions.maximumFractionDigits?: number | undefined
FormatOptions.signDisplay?: keyof Intl.NumberFormatOptionsSignDisplayRegistry | undefined
FormatOptions.base?: 1000 | 1024 | undefined
function formatValue(value: number, locale: string, options?: FormatOptions) => string
type NumberFormat = 'unit' | 'currency' | 'decimal' | 'integer' | 'percent' | 'compact' | 'bytes'
```
