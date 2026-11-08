# @coreloom/range-inputs

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/range-inputs.tsx

```ts
type NumberRange = {}
NumberRange.min: number | null
NumberRange.max: number | null
function NumberRangeInput
NumberRangeInput.value?: NumberRange | undefined
NumberRangeInput.defaultValue?: NumberRange | undefined
NumberRangeInput.onValueChange?: ((range: NumberRange) => void) | undefined
NumberRangeInput.min?: number | undefined
NumberRangeInput.max?: number | undefined
NumberRangeInput.step?: number | undefined
NumberRangeInput.formatOptions?: NumberFormatOptions | undefined
NumberRangeInput.minLabel?: string | undefined
NumberRangeInput.maxLabel?: string | undefined
NumberRangeInput.disabled?: boolean | undefined
NumberRangeInput.id?: string | undefined
NumberRangeInput.className?: string | undefined
NumberRangeInput.onBlur?: (() => void) | undefined
NumberRangeInput.aria-describedby?: string | undefined
NumberRangeInput.aria-invalid?: boolean | 'true' | 'false' | undefined
type TimeRange = {}
TimeRange.start?: string | undefined
TimeRange.end?: string | undefined
function TimeRangePicker
TimeRangePicker.value?: TimeRange | undefined
TimeRangePicker.defaultValue?: TimeRange | undefined
TimeRangePicker.onValueChange?: ((range: TimeRange) => void) | undefined
TimeRangePicker.step?: number | undefined
TimeRangePicker.min?: string | undefined
TimeRangePicker.max?: string | undefined
TimeRangePicker.overnight?: boolean | undefined
TimeRangePicker.startLabel?: string | undefined
TimeRangePicker.endLabel?: string | undefined
TimeRangePicker.disabled?: boolean | undefined
TimeRangePicker.id?: string | undefined
TimeRangePicker.className?: string | undefined
TimeRangePicker.onBlur?: (() => void) | undefined
TimeRangePicker.aria-describedby?: string | undefined
TimeRangePicker.aria-invalid?: boolean | 'true' | 'false' | undefined
```
