# @coreloom/virtual-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/virtual-list.tsx

```ts
function VirtualList
VirtualList.items: readonly T[]
VirtualList.renderItem: (item: T, index: number) => React.ReactNode
VirtualList.getKey: (item: T, index: number) => React.Key
VirtualList.height: string | number
VirtualList.estimateSize?: number | undefined
VirtualList.overscan?: number | undefined
VirtualList.gap?: number | undefined
VirtualList.onEndReached?: (() => void) | undefined
VirtualList.hasMore?: boolean | undefined
VirtualList.loadingMore?: boolean | undefined
VirtualList.endThreshold?: number | undefined
VirtualList.empty?: React.ReactNode
VirtualList.className?: string | undefined
VirtualList.aria-label?: string | undefined
VirtualList.aria-labelledby?: string | undefined
```
