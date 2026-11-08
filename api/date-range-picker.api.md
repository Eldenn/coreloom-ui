# @coreloom/date-range-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/date-range-picker.tsx

```ts
type DateRange = {}
DateRange.*: react-day-picker
function DateRangePicker
DateRangePicker.value?: {}
DateRangePicker.value.from: Date | undefined
DateRangePicker.value.to?: Date | undefined
DateRangePicker.defaultValue?: {}
DateRangePicker.defaultValue.from: Date | undefined
DateRangePicker.defaultValue.to?: Date | undefined
DateRangePicker.onValueChange?: ((range: DateRange | undefined) => void) | undefined
DateRangePicker.placeholder?: string | undefined
DateRangePicker.formatString?: string | undefined
DateRangePicker.locale?: Locale | undefined
DateRangePicker.presets?: false | DateRangePreset[] | undefined
DateRangePicker.numberOfMonths?: number | undefined
DateRangePicker.disabled?: boolean | undefined
DateRangePicker.className?: string | undefined
DateRangePicker.id?: string | undefined
DateRangePicker.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof Button>['variant']; }, 'selected' | 'required' | 'onSelect' | 'mode'> | undefined
DateRangePicker.onBlur?: (() => void) | undefined
DateRangePicker.aria-invalid?: boolean | 'true' | 'false' | undefined
DateRangePicker.aria-label?: string | undefined
DateRangePicker.aria-describedby?: string | undefined
type DateRangePreset = {}
DateRangePreset.label: string
DateRangePreset.range: () => DateRange
```
