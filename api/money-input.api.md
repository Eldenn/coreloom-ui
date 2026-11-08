# @coreloom/money-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/money-input.tsx

```ts
function MoneyInput
MoneyInput.value?: number | null | undefined
MoneyInput.defaultValue?: number | null | undefined
MoneyInput.onValueChange?: ((value: number | null) => void) | undefined
MoneyInput.currency?: string | undefined
MoneyInput.locale?: string | undefined
MoneyInput.min?: number | undefined
MoneyInput.max?: number | undefined
MoneyInput.allowNegative?: boolean | undefined
MoneyInput.placeholder?: string | undefined
MoneyInput.disabled?: boolean | undefined
MoneyInput.className?: string | undefined
MoneyInput.id?: string | undefined
MoneyInput.name?: string | undefined
MoneyInput.onBlur?: (() => void) | undefined
MoneyInput.aria-invalid?: boolean | 'true' | 'false' | undefined
MoneyInput.aria-label?: string | undefined
MoneyInput.aria-describedby?: string | undefined
function parseMoney(text: string, locale: string, currency?: string) => number | null
```
