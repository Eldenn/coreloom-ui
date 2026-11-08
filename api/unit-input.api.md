# @coreloom/unit-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/unit-input.tsx

```ts
function UnitInput
UnitInput.units: UnitOption[]
UnitInput.value?: UnitValue | undefined
UnitInput.defaultValue?: UnitValue | undefined
UnitInput.onValueChange?: ((value: UnitValue) => void) | undefined
UnitInput.convert?: ((value: number, from: string, to: string) => number) | undefined
UnitInput.min?: number | undefined
UnitInput.max?: number | undefined
UnitInput.step?: number | undefined
UnitInput.formatOptions?: NumberFormatOptions | undefined
UnitInput.stepper?: 'end' | 'sides' | 'none' | undefined
UnitInput.placeholder?: string | undefined
UnitInput.disabled?: boolean | undefined
UnitInput.id?: string | undefined
UnitInput.name?: string | undefined
UnitInput.className?: string | undefined
UnitInput.onBlur?: (() => void) | undefined
UnitInput.unitLabel?: string | undefined
UnitInput.aria-label?: string | undefined
UnitInput.aria-labelledby?: string | undefined
UnitInput.aria-describedby?: string | undefined
UnitInput.aria-invalid?: boolean | 'true' | 'false' | undefined
type UnitOption = {}
UnitOption.value: string
UnitOption.label?: string | undefined
type UnitValue = {}
UnitValue.value: number | null
UnitValue.unit: string
```
