# @coreloom/bar-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/bar-list.tsx

```ts
function BarList
BarList.data: readonly BarListItem[]
BarList.sortOrder?: 'none' | 'asc' | 'desc' | undefined
BarList.limit?: number | undefined
BarList.max?: number | undefined
BarList.color?: string | undefined
BarList.formatValue?: ((value: number) => string) | undefined
BarList.aria-label?: string | undefined
BarList.*: react
type BarListItem = {}
BarListItem.key?: string | undefined
BarListItem.label: React.ReactNode
BarListItem.value: number
BarListItem.href?: string | undefined
BarListItem.icon?: React.ReactNode
type BarListProps = {}
BarListProps.data: readonly BarListItem[]
BarListProps.sortOrder?: 'none' | 'asc' | 'desc' | undefined
BarListProps.limit?: number | undefined
BarListProps.max?: number | undefined
BarListProps.color?: string | undefined
BarListProps.formatValue?: ((value: number) => string) | undefined
BarListProps.aria-label?: string | undefined
BarListProps.*: react
function sortBarList(data: readonly BarListItem[], order: 'desc' | 'asc' | 'none') => BarListItem[]
```
