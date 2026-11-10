# @coreloom/onboarding

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/onboarding.tsx

```ts
function OnboardingLayout
OnboardingLayout.steps: StepperStep[]
OnboardingLayout.current: number
OnboardingLayout.onStepChange?: ((index: number) => void) | undefined
OnboardingLayout.title: React.ReactNode
OnboardingLayout.description?: React.ReactNode
OnboardingLayout.brand?: React.ReactNode
OnboardingLayout.children: React.ReactNode
OnboardingLayout.onBack?: (() => void) | undefined
OnboardingLayout.onNext?: (() => unknown) | undefined
OnboardingLayout.onSkip?: (() => void) | undefined
OnboardingLayout.nextLabel?: React.ReactNode
OnboardingLayout.pending?: boolean | undefined
OnboardingLayout.nextType?: 'button' | 'submit' | undefined
OnboardingLayout.formId?: string | undefined
OnboardingLayout.className?: string | undefined
```
