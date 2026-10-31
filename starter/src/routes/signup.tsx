import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import * as React from 'react'

import { AuthLayout } from '@/components/auth-layout'
import { Brand } from '@/components/brand'
import { SignupForm } from '@/components/signup-form'
import { auth, AuthError } from '@/lib/auth'
import { useT } from '@/lib/locale'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: '/' })
  },
  component: SignupPage,
})

function SignupPage() {
  const t = useT()
  const navigate = useNavigate()
  const [error, setError] = React.useState<string>()

  return (
    <AuthLayout brand={<Brand />} footer={t.signup.hint}>
      <SignupForm
        signInHref="/login"
        error={error}
        onSubmit={async ({ name, email, password }) => {
          setError(undefined)
          try {
            await auth.signUp(name, email, password)
            await navigate({ to: '/verify' })
          } catch (err) {
            if (err instanceof AuthError && err.code === 'email-taken')
              setError(t.signup.emailTaken)
            else throw err
          }
        }}
      />
    </AuthLayout>
  )
}
