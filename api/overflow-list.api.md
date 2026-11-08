# @coreloom/overflow-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/overflow-list.tsx

```ts
function fitCount(widths: readonly number[], available: number, gap: number, indicator: number) => number
function OverflowList
OverflowList.items: readonly T[]
OverflowList.renderItem: (item: T, index: number) => React.ReactNode
OverflowList.renderOverflow?: ((hidden: readonly T[]) => React.ReactNode) | undefined
OverflowList.max?: number | undefined
OverflowList.gap?: number | undefined
OverflowList.className?: string | undefined
OverflowList.listClassName?: string | undefined
OverflowList.aria-label?: string | undefined
```
