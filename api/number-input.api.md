# @coreloom/number-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/number-input.tsx

```ts
type NumberFormatOptions = Omit<Intl.NumberFormatOptions, 'currency' | 'style'> & { style?: 'decimal' | 'percent' | 'unit'; }
function NumberInput
NumberInput.value?: number | null | undefined
NumberInput.defaultValue?: number | null | undefined
NumberInput.onValueChange?: ((value: number | null) => void) | undefined
NumberInput.min?: number | undefined
NumberInput.max?: number | undefined
NumberInput.step?: number | undefined
NumberInput.largeStep?: number | undefined
NumberInput.formatOptions?: NumberFormatOptions | undefined
NumberInput.locale?: string | undefined
NumberInput.stepper?: 'end' | 'sides' | 'none' | undefined
NumberInput.placeholder?: string | undefined
NumberInput.disabled?: boolean | undefined
NumberInput.readOnly?: boolean | undefined
NumberInput.className?: string | undefined
NumberInput.id?: string | undefined
NumberInput.name?: string | undefined
NumberInput.onBlur?: (() => void) | undefined
NumberInput.aria-invalid?: boolean | 'true' | 'false' | undefined
NumberInput.aria-label?: string | undefined
NumberInput.aria-labelledby?: string | undefined
NumberInput.aria-describedby?: string | undefined
function parseNumber(text: string, locale?: string, { percent }?: { percent?: boolean | undefined; }) => number | null
function stepNumber(value: number | null, delta: number, { step, min, max }?: { step?: number; min?: number; max?: number; }) => number
```
