# @coreloom/duration-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/duration-input.tsx

```ts
function DurationInput
DurationInput.value?: number | null | undefined
DurationInput.defaultValue?: number | null | undefined
DurationInput.onValueChange?: ((minutes: number | null) => void) | undefined
DurationInput.min?: number | undefined
DurationInput.max?: number | undefined
DurationInput.step?: number | undefined
DurationInput.placeholder?: string | undefined
DurationInput.disabled?: boolean | undefined
DurationInput.id?: string | undefined
DurationInput.name?: string | undefined
DurationInput.className?: string | undefined
DurationInput.onBlur?: (() => void) | undefined
DurationInput.aria-label?: string | undefined
DurationInput.aria-labelledby?: string | undefined
DurationInput.aria-describedby?: string | undefined
DurationInput.aria-invalid?: boolean | 'true' | 'false' | undefined
function formatMinutes(minutes: number, units: { hour: string; minute: string; }) => string
function parseDuration(text: string) => number | undefined
```
