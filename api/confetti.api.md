# @coreloom/confetti

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/confetti.tsx

```ts
type ConfettiOptions = {}
ConfettiOptions.count?: number | undefined
ConfettiOptions.spread?: number | undefined
ConfettiOptions.duration?: number | undefined
function fireConfetti(origin?: Element | { x: number; y: number; }, { count, spread, duration }?: ConfettiOptions) => Promise<void>
```
