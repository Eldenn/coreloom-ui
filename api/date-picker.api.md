# @coreloom/date-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/date-picker.tsx

```ts
function DatePicker
DatePicker.value?: Date | undefined
DatePicker.defaultValue?: Date | undefined
DatePicker.onValueChange?: ((date: Date | undefined) => void) | undefined
DatePicker.placeholder?: string | undefined
DatePicker.formatString?: string | undefined
DatePicker.locale?: Locale | undefined
DatePicker.disabled?: boolean | undefined
DatePicker.className?: string | undefined
DatePicker.id?: string | undefined
DatePicker.calendarProps?: Omit<import("react-day-picker").DayPickerProps & { buttonVariant?: React.ComponentProps<typeof import("./button").Button>['variant']; }, 'selected' | 'onSelect' | 'mode'> | undefined
DatePicker.typing?: boolean | undefined
DatePicker.onBlur?: (() => void) | undefined
DatePicker.aria-invalid?: boolean | 'true' | 'false' | undefined
DatePicker.aria-label?: string | undefined
DatePicker.aria-describedby?: string | undefined
function parseTypedDate(text: string, locale?: Locale) => Date | undefined
```
