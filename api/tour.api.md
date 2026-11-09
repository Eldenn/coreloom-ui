# @coreloom/tour

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/tour.tsx

```ts
function Tour
Tour.steps: TourStep[]
Tour.open?: boolean | undefined
Tour.defaultOpen?: boolean | undefined
Tour.onOpenChange?: ((open: boolean) => void) | undefined
Tour.step?: number | undefined
Tour.defaultStep?: number | undefined
Tour.onStepChange?: ((step: number) => void) | undefined
Tour.onFinish?: (() => void) | undefined
Tour.padding?: number | undefined
type TourStep = {}
TourStep.target?: string | (() => Element | null) | undefined
TourStep.title: React.ReactNode
TourStep.content?: React.ReactNode
TourStep.side?: 'left' | 'right' | 'top' | 'bottom' | undefined
TourStep.align?: 'end' | 'center' | 'start' | undefined
```
