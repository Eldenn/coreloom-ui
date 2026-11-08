# @coreloom/use-controllable-state

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/use-controllable-state.ts

```ts
type ControllableState<T> = {}
ControllableState.value: T | undefined
ControllableState.defaultValue: T
ControllableState.onChange?: ((value: T) => void) | undefined
function useControllableState<T>({ value, defaultValue, onChange, }: ControllableState<T>) => readonly [T, (next: T) => void]
```
