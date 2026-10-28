"use client"

// Coreloom UI — SignupForm (auth block). Name, email and password, with the terms underneath.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { OAuthProvider } from "@/components/login-form"

function SignupForm({
  onSubmit,
  onProvider,
  providers = [],
  pending = false,
  error,
  minPasswordLength = 8,
  signInHref,
  terms,
  title = "Create your account",
  description = "Start a workspace in under a minute.",
  className,
}: {
  onSubmit: (values: { name: string; email: string; password: string }) => void | Promise<void>
  onProvider?: (providerId: string) => void
  providers?: OAuthProvider[]
  pending?: boolean
  error?: React.ReactNode
  minPasswordLength?: number
  signInHref?: string
  /** Small print under the button, e.g. links to your terms and privacy policy. */
  terms?: React.ReactNode
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
            onSubmit({
              name: String(data.get("name") ?? ""),
              email: String(data.get("email") ?? ""),
              password: String(data.get("password") ?? ""),
            })
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
            <Field>
              <FieldLabel htmlFor="signup-name">Name</FieldLabel>
              <Input id="signup-name" name="name" autoComplete="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">Work email</FieldLabel>
              <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@company.dev" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={minPasswordLength} required />
              <FieldDescription>At least {minPasswordLength} characters.</FieldDescription>
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Spinner className="text-current" />}
              {pending ? "Creating account" : "Create account"}
            </Button>
            {terms && <p className="m-0 text-center text-[12px] leading-[1.5] text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground">{terms}</p>}
            {signInHref && (
              <p className="m-0 text-center text-[13px] text-muted-foreground">
                Already have an account?{" "}
                <a href={signInHref} className="font-medium text-primary-text underline-offset-4 hover:underline">
                  Sign in
                </a>
              </p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export { SignupForm }
