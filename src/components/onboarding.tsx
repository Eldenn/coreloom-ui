'use client'

// Coreloom UI — OnboardingLayout (onboarding block). A multi-step setup: the Stepper on top, the
// current step's content in a card, Back / Continue (Finish on the last step) at the bottom.
// Each step is usually one form; validate it before `onNext` moves on.
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Stepper, type StepperStep } from '@/components/ui/stepper'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function OnboardingLayout({
  steps,
  current,
  onStepChange,
  title,
  description,
  brand,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  pending = false,
  nextType = 'button',
  formId,
  className,
}: {
  steps: StepperStep[]
  current: number
  /** Lets the user jump back to a finished step from the Stepper. */
  onStepChange?: (index: number) => void
  /** The current step's heading. */
  title: React.ReactNode
  description?: React.ReactNode
  /** Logo or product name above the stepper. */
  brand?: React.ReactNode
  children: React.ReactNode
  /** Hidden on the first step. */
  onBack?: () => void
  onNext?: () => unknown
  /** Shows "Skip for now" next to Back. */
  onSkip?: () => void
  /** Defaults to "Continue", or "Finish" on the last step. */
  nextLabel?: React.ReactNode
  pending?: boolean
  /** "submit" with `formId` makes Continue submit the step's <form id={formId}>. */
  nextType?: 'button' | 'submit'
  formId?: string
  className?: string
}) {
  const t = useCoreloomI18n().messages.onboarding
  const last = current >= steps.length - 1
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const first = React.useRef(true)
  // Move focus to the new step's heading, so keyboard and screen-reader users land on it.
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [current])

  return (
    <div
      data-slot="onboarding"
      className={cn('mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10', className)}
    >
      {!!brand && <div className="flex justify-center">{brand}</div>}
      <Stepper steps={steps} current={current} onStepChange={onStepChange} />
      <Card className="gap-6 px-6 py-6">
        <CardHeader>
          <CardTitle
            ref={headingRef}
            tabIndex={-1}
            className="text-[20px] outline-none"
            role="heading"
            aria-level={1}
          >
            {title}
          </CardTitle>
          {!!description && (
            <CardDescription className="text-[14px]">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="flex items-center justify-between gap-3 border-t border-border-subtle pt-5">
          <div className="flex items-center gap-2">
            {current > 0 && onBack && (
              <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
                {t.back}
              </Button>
            )}
            {onSkip && !last && (
              <Button type="button" variant="link" onClick={onSkip} disabled={pending}>
                {t.skip}
              </Button>
            )}
          </div>
          <Button
            type={nextType}
            form={formId}
            onClick={nextType === 'button' ? () => onNext?.() : undefined}
            disabled={pending}
            aria-busy={pending || undefined}
          >
            {pending && <Spinner className="text-current" />}
            {nextLabel ?? (last ? t.finish : t.next)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export { OnboardingLayout }
