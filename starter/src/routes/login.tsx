import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth-layout'
import { Brand } from '@/components/brand'
import { LoginForm } from '@/components/login-form'
import { auth } from '@/lib/auth'
import { useT } from '@/lib/locale'

export const Route = createFileRoute('/login')({
  // Where to go after signing in; set by the protected layout (src/routes/_app.tsx).
  validateSearch: z.object({ redirect: z.string().startsWith('/').optional().catch(undefined) }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.user) throw redirect({ href: search.redirect ?? '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const t = useT()
  const navigate = useNavigate()
  const { redirect: next } = Route.useSearch()
  const [error, setError] = React.useState<string>()

  return (
    <AuthLayout brand={<Brand />} footer={t.login.hint}>
      <LoginForm
        signUpHref="/signup"
        forgotPasswordHref="/forgot-password"
        error={error}
        onSubmit={async ({ email, password }) => {
          setError(undefined)
          try {
            await auth.signIn(email, password)
            await navigate({ href: next ?? '/', replace: true })
          } catch {
            setError(t.login.wrongCredentials)
          }
        }}
      />
    </AuthLayout>
  )
}
