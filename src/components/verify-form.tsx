"use client"

// Coreloom UI — VerifyForm (auth block). Enter the 6-digit code sent by email or SMS.
// Submits by itself once the last digit is in; the button stays for those who wait.
import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"

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
  onSubmit: (code: string) => void | Promise<void>
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
  const [code, setCode] = React.useState("")
  const [wait, setWait] = React.useState(resendIn)

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
          className="flex flex-col items-center gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (code.length === 6) onSubmit(code)
          }}
        >
          <Field data-invalid={error ? true : undefined} className="w-auto items-center">
            <FieldLabel htmlFor="verify-code" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              id="verify-code"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={(value: string) => onSubmit(value)}
              disabled={pending}
            >
              <InputOTPGroup>
                {[0, 1, 2].map((i) => <InputOTPSlot key={i} index={i} aria-invalid={error ? true : undefined} />)}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {[3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} aria-invalid={error ? true : undefined} />)}
              </InputOTPGroup>
            </InputOTP>
            {error && <FieldError className="text-center">{error}</FieldError>}
          </Field>
          <Button type="submit" className="w-full" disabled={pending || code.length < 6}>
            {pending && <Spinner className="text-current" />}
            {pending ? "Verifying" : "Verify"}
          </Button>
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
