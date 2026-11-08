# @coreloom/month-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/month-picker.tsx

```ts
function MonthPicker
MonthPicker.value?: string | undefined
MonthPicker.defaultValue?: string | undefined
MonthPicker.onValueChange?: ((value: string) => void) | undefined
MonthPicker.min?: string | undefined
MonthPicker.max?: string | undefined
MonthPicker.placeholder?: string | undefined
MonthPicker.disabled?: boolean | undefined
MonthPicker.id?: string | undefined
MonthPicker.className?: string | undefined
MonthPicker.onBlur?: (() => void) | undefined
MonthPicker.aria-label?: string | undefined
MonthPicker.aria-describedby?: string | undefined
MonthPicker.aria-invalid?: boolean | 'true' | 'false' | undefined
function parseMonth(value: string | undefined) => { year: number; month: number; } | undefined
function toMonthValue(year: number, month: number) => string
```
