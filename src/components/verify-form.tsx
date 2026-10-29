"use client"

// Coreloom UI — VerifyForm (auth block). Enter the 6-digit code sent by email or SMS.
// Built on @coreloom/form (TanStack Form, OTPField): submits by itself once the last digit is in;
// the button stays for those who wait.
import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppForm } from "@/components/ui/form"

function VerifyForm({
  onSubmit,
  onResend,
  destination,
  pending = false,
  error,
  resendIn = 30,
  title = "Check your inbox",
  className,
}: {
  /** Called with the 6 digits. Return a promise to keep the form busy until it settles. */
  onSubmit: (code: string) => unknown
  onResend?: () => void
  /** Where the code went, masked: "m•••@coreloom.dev". */
  destination?: string
  pending?: boolean
  error?: React.ReactNode
  /** Seconds before "Resend code" is offered again. */
  resendIn?: number
  title?: React.ReactNode
  className?: string
}) {
  const [wait, setWait] = React.useState(resendIn)
  const form = useAppForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      await onSubmit(value.code)
    },
  })

  React.useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  return (
    <Card className={cn("gap-5 px-6 py-6", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-[22px]">{title}</CardTitle>
        <CardDescription className="text-[14px]">
          {destination ? <>We sent a 6-digit code to <span className="text-foreground">{destination}</span>.</> : "Enter the 6-digit code we sent you."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="flex flex-col items-center gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form.AppField name="code" validators={{ onChange: ({ value }) => (value.length === 6 ? undefined : "Enter the 6 digits of the code.") }}>
            {(field) => (
              <field.OTPField
                label="Verification code"
                hideLabel
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
                submitOnComplete
                disabled={pending}
                className="w-auto items-center"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton className="w-full" pending={pending} pendingLabel="Verifying">
              Verify
            </form.SubmitButton>
          </form.AppForm>
          {onResend && (
            <p className="m-0 text-center text-[13px] text-muted-foreground">
              Didn’t get it?{" "}
              {wait > 0 ? (
                <span className="font-mono text-[12px]">Resend in {wait}s</span>
              ) : (
                <button
                  type="button"
                  className="cursor-pointer font-medium text-primary-text underline-offset-4 hover:underline"
                  onClick={() => {
                    onResend()
                    setWait(resendIn)
                  }}
                >
                  Resend code
                </button>
              )}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export { VerifyForm }
