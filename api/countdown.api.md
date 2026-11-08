# @coreloom/countdown

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/countdown.tsx

```ts
function Countdown
Countdown.to: number | Date
Countdown.now?: number | Date | undefined
Countdown.variant?: 'text' | 'clock' | 'boxes' | undefined
Countdown.days?: 'never' | 'auto' | 'always' | undefined
Countdown.onComplete?: (() => void) | undefined
Countdown.completed?: React.ReactNode
Countdown.*: react
type DurationParts = {}
DurationParts.days: number
DurationParts.hours: number
DurationParts.minutes: number
DurationParts.seconds: number
function splitDuration(ms: number) => DurationParts
```
