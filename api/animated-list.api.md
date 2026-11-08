# @coreloom/animated-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/animated-list.tsx

```ts
function AnimatedList
AnimatedList.as?: 'div' | 'ol' | 'ul' | undefined
AnimatedList.exitDuration?: number | undefined
AnimatedList.animateOnMount?: boolean | undefined
AnimatedList.itemClassName?: string | undefined
AnimatedList.*: react
function mergeItems(previous: Item[], next: React.ReactElement[]) => Item[]
```
