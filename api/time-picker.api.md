# @coreloom/time-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/time-picker.tsx

```ts
function DateTimePicker
DateTimePicker.value?: Date | undefined
DateTimePicker.defaultValue?: Date | undefined
DateTimePicker.onValueChange?: ((date: Date | undefined) => void) | undefined
DateTimePicker.defaultTime?: string | undefined
DateTimePicker.step?: number | undefined
DateTimePicker.minTime?: string | undefined
DateTimePicker.maxTime?: string | undefined
DateTimePicker.dateLocale?: Locale | undefined
DateTimePicker.locale?: string | undefined
DateTimePicker.disabled?: boolean | undefined
DateTimePicker.className?: string | undefined
DateTimePicker.id?: string | undefined
DateTimePicker.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof import("./button").Button>['variant']; }, 'selected' | 'onSelect' | 'mode'> | undefined
DateTimePicker.onBlur?: (() => void) | undefined
DateTimePicker.aria-invalid?: boolean | 'true' | 'false' | undefined
DateTimePicker.aria-label?: string | undefined
DateTimePicker.aria-describedby?: string | undefined
function formatTime(time: string | undefined, locale: string) => string
function parseTime(text: string) => string | undefined
function timeOptions(step?: number, min?: string, max?: string) => string[]
function TimePicker
TimePicker.value?: string | undefined
TimePicker.defaultValue?: string | undefined
TimePicker.onValueChange?: ((time: string | undefined) => void) | undefined
TimePicker.step?: number | undefined
TimePicker.min?: string | undefined
TimePicker.max?: string | undefined
TimePicker.locale?: string | undefined
TimePicker.placeholder?: string | undefined
TimePicker.disabled?: boolean | undefined
TimePicker.className?: string | undefined
TimePicker.id?: string | undefined
TimePicker.name?: string | undefined
TimePicker.onBlur?: (() => void) | undefined
TimePicker.aria-invalid?: boolean | 'true' | 'false' | undefined
TimePicker.aria-label?: string | undefined
TimePicker.aria-describedby?: string | undefined
```
