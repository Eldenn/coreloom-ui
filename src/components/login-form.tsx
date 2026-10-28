"use client"

// Coreloom UI — LoginForm (auth block). Email + password sign-in with optional OAuth buttons.
// Uncontrolled: onSubmit receives the values; you call your auth API and pass back `error`.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type OAuthProvider = { id: string; label: string; icon?: React.ReactNode }

function LoginForm({
  onSubmit,
  onProvider,
  providers = [],
  pending = false,
  error,
  forgotPasswordHref = "#",
  signUpHref,
  title = "Sign in",
  description = "Welcome back. Enter your email to continue.",
  className,
}: {
  onSubmit: (values: { email: string; password: string }) => unknown
  onProvider?: (providerId: string) => void
  /** OAuth buttons shown above the form ("Continue with GitHub"). */
  providers?: OAuthProvider[]
  pending?: boolean
  /** Shown above the fields, e.g. "Wrong email or password." */
  error?: React.ReactNode
  forgotPasswordHref?: string
  signUpHref?: string
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("gap-5 px-6 py-6", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-[22px]">{title}</CardTitle>
        <CardDescription className="text-[14px]">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            onSubmit({ email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") })
          }}
        >
          <FieldGroup className="gap-4">
            {providers.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  {providers.map((p) => (
                    <Button key={p.id} type="button" variant="secondary" className="w-full" onClick={() => onProvider?.(p.id)} disabled={pending}>
                      {p.icon}
                      {p.label}
                    </Button>
                  ))}
                </div>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card [&_[data-slot=separator]]:bg-border">or</FieldSeparator>
              </>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@company.dev" required aria-invalid={error ? true : undefined} />
            </Field>
            <Field data-invalid={error ? true : undefined}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <a href={forgotPasswordHref} className="text-[13px] text-primary-text underline-offset-4 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input id="login-password" name="password" type="password" autoComplete="current-password" required aria-invalid={error ? true : undefined} />
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Spinner className="text-current" />}
              {pending ? "Signing in" : "Sign in"}
            </Button>
            {signUpHref && (
              <p className="m-0 text-center text-[13px] text-muted-foreground">
                No account yet?{" "}
                <a href={signUpHref} className="font-medium text-primary-text underline-offset-4 hover:underline">
                  Create one
                </a>
              </p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export { LoginForm, type OAuthProvider }
