# @coreloom/render-icon

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/icon.tsx

```ts
type IconLike = LucideIcon | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
function renderIcon(icon: IconLike | undefined) => React.ReactNode
```
