# @coreloom/view-transition

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/view-transition.tsx

```ts
function startViewTransition(update: () => void, { effect }?: ViewTransitionOptions) => Promise<void>
function useViewTransition() => (update: () => void, options?: ViewTransitionOptions) => Promise<void>
type ViewTransitionEffect = 'slide' | 'scale' | 'fade' | 'slide-back'
type ViewTransitionOptions = {}
ViewTransitionOptions.effect?: ViewTransitionEffect | undefined
```
