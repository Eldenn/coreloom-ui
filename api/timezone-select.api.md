# @coreloom/timezone-select

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/timezone-select.tsx

```ts
function formatOffset(minutes: number) => string
function timeZoneOffset(timeZone: string, date?: Date) => number
function TimezoneSelect
TimezoneSelect.value?: string | undefined
TimezoneSelect.defaultValue?: string | undefined
TimezoneSelect.onValueChange?: ((zone: string) => void) | undefined
TimezoneSelect.timeZones?: string[] | undefined
TimezoneSelect.date?: Date | undefined
TimezoneSelect.placeholder?: string | undefined
TimezoneSelect.clearable?: boolean | undefined
TimezoneSelect.disabled?: boolean | undefined
TimezoneSelect.id?: string | undefined
TimezoneSelect.className?: string | undefined
TimezoneSelect.aria-label?: string | undefined
TimezoneSelect.aria-invalid?: boolean | 'true' | 'false' | undefined
```
