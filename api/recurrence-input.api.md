# @coreloom/recurrence-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/recurrence-input.tsx

```ts
function parseRRule(text: string) => Recurrence | undefined
type Recurrence = {}
Recurrence.frequency: RecurrenceFrequency
Recurrence.interval: number
Recurrence.weekdays?: number[] | undefined
Recurrence.monthDay?: number | undefined
Recurrence.end: RecurrenceEnd
type RecurrenceEnd = { type: 'never'; } | { type: 'on'; date: string; } | { type: 'after'; count: number; }
type RecurrenceFrequency = 'month' | 'week' | 'day' | 'year'
function RecurrenceInput
RecurrenceInput.value?: Recurrence | undefined
RecurrenceInput.defaultValue?: Recurrence | undefined
RecurrenceInput.onValueChange?: ((rule: Recurrence) => void) | undefined
RecurrenceInput.frequencies?: RecurrenceFrequency[] | undefined
RecurrenceInput.disabled?: boolean | undefined
RecurrenceInput.id?: string | undefined
RecurrenceInput.className?: string | undefined
RecurrenceInput.onBlur?: (() => void) | undefined
RecurrenceInput.aria-describedby?: string | undefined
RecurrenceInput.aria-invalid?: boolean | 'true' | 'false' | undefined
function toRRule(rule: Recurrence) => string
```
