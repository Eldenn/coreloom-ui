# @coreloom/sortable-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/sortable-list.tsx

```ts
function SortableList
SortableList.options: SortableOption[]
SortableList.value?: string[] | undefined
SortableList.defaultValue?: string[] | undefined
SortableList.onValueChange?: ((value: string[]) => void) | undefined
SortableList.numbered?: boolean | undefined
SortableList.wrap?: boolean | undefined
SortableList.disabled?: boolean | undefined
SortableList.className?: string | undefined
SortableList.aria-label?: string | undefined
SortableList.aria-labelledby?: string | undefined
SortableList.aria-describedby?: string | undefined
type SortableOption = {}
SortableOption.value: string
SortableOption.label: string
SortableOption.description?: string | undefined
SortableOption.icon?: React.ReactNode
SortableOption.actions?: React.ReactNode
```
