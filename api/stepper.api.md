# @coreloom/stepper

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/stepper.tsx

```ts
function Stepper
Stepper.steps: StepperStep[]
Stepper.current: number
Stepper.onStepChange?: ((index: number) => void) | undefined
Stepper.orientation?: 'vertical' | 'horizontal' | undefined
Stepper.className?: string | undefined
Stepper.aria-label?: string | undefined
type StepperStep = {}
StepperStep.title: React.ReactNode
StepperStep.description?: React.ReactNode
```
