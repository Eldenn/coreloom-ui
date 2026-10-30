import * as React from "react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"

import { AuthLayout } from "@/components/auth-layout"
import { Brand } from "@/components/brand"
import { toast } from "@/components/ui/sonner"
import { VerifyForm } from "@/components/verify-form"
import { auth } from "@/lib/auth"
import { useT } from "@/lib/locale"

// The second step of signing up: the code sent to the new account's email.
export const Route = createFileRoute("/verify")({
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: "/" })
    if (!auth.pendingSignUp) throw redirect({ to: "/signup" })
  },
  component: VerifyPage,
})

/** "ada@acme.dev" → "a•••@acme.dev": enough to recognise, not to read over a shoulder. */
function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  return `${user.slice(0, 1)}•••@${domain}`
}

function VerifyPage() {
  const t = useT()
  const navigate = useNavigate()
  const [error, setError] = React.useState<string>()
  const email = auth.pendingSignUp?.email ?? ""

  return (
    <AuthLayout brand={<Brand />} footer={t.signup.hint}>
      <VerifyForm
        destination={maskEmail(email)}
        error={error}
        onResend={async () => {
          await auth.resendCode()
          toast.success(t.signup.codeResent)
        }}
        onSubmit={async (code) => {
          setError(undefined)
          try {
            await auth.verify(code)
            await navigate({ to: "/", replace: true })
          } catch {
            setError(t.signup.wrongCode)
          }
        }}
      />
    </AuthLayout>
  )
}
