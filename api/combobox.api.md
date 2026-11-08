# @coreloom/combobox

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/combobox.tsx

```ts
function Combobox
Combobox.options: ComboboxOption[]
Combobox.value?: string | undefined
Combobox.defaultValue?: string | undefined
Combobox.onValueChange?: ((value: string) => void) | undefined
Combobox.placeholder?: string | undefined
Combobox.searchPlaceholder?: string | undefined
Combobox.emptyText?: React.ReactNode
Combobox.disabled?: boolean | undefined
Combobox.className?: string | undefined
Combobox.contentClassName?: string | undefined
Combobox.id?: string | undefined
Combobox.clearable?: boolean | undefined
Combobox.onCreate?: ((label: string) => string | undefined) | undefined
Combobox.aria-invalid?: boolean | 'true' | 'false' | undefined
Combobox.aria-label?: string | undefined
type ComboboxOption = {}
ComboboxOption.value: string
ComboboxOption.label: string
ComboboxOption.icon?: React.ReactNode
ComboboxOption.keywords?: string[] | undefined
ComboboxOption.disabled?: boolean | undefined
```
