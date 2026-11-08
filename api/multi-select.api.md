# @coreloom/multi-select

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/multi-select.tsx

```ts
function MultiSelect
MultiSelect.options: MultiSelectOption[]
MultiSelect.value?: string[] | undefined
MultiSelect.defaultValue?: string[] | undefined
MultiSelect.onValueChange?: ((value: string[]) => void) | undefined
MultiSelect.placeholder?: string | undefined
MultiSelect.searchPlaceholder?: string | undefined
MultiSelect.emptyText?: React.ReactNode
MultiSelect.maxShown?: number | undefined
MultiSelect.maxSelected?: number | undefined
MultiSelect.disabled?: boolean | undefined
MultiSelect.className?: string | undefined
MultiSelect.id?: string | undefined
MultiSelect.onBlur?: (() => void) | undefined
MultiSelect.aria-invalid?: boolean | 'true' | 'false' | undefined
MultiSelect.aria-label?: string | undefined
MultiSelect.aria-describedby?: string | undefined
type MultiSelectOption = {}
MultiSelectOption.value: string
MultiSelectOption.label: string
MultiSelectOption.icon?: React.ReactNode
MultiSelectOption.keywords?: string[] | undefined
MultiSelectOption.disabled?: boolean | undefined
```
