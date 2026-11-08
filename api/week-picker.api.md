# @coreloom/week-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/week-picker.tsx

```ts
function toWeekValue(date: Date) => string
function WeekPicker
WeekPicker.value?: string | undefined
WeekPicker.defaultValue?: string | undefined
WeekPicker.onValueChange?: ((value: string) => void) | undefined
WeekPicker.placeholder?: string | undefined
WeekPicker.disabled?: boolean | undefined
WeekPicker.id?: string | undefined
WeekPicker.className?: string | undefined
WeekPicker.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof import("./button").Button>['variant']; }, 'selected' | 'onSelect' | 'mode' | 'onDayClick'> | undefined
WeekPicker.onBlur?: (() => void) | undefined
WeekPicker.aria-label?: string | undefined
WeekPicker.aria-describedby?: string | undefined
WeekPicker.aria-invalid?: boolean | 'true' | 'false' | undefined
function weekRange(value: string | undefined) => { from: Date; to: Date; } | undefined
```
