import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth-layout'
import { Brand } from '@/components/brand'
import { ResetPasswordForm } from '@/components/password-reset-form'
import { toast } from '@/components/ui/sonner'
import { auth } from '@/lib/auth'
import { useT } from '@/lib/locale'

// The page the reset email links to: /reset-password?token=…
export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({ token: z.string().catch('') }),
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: '/' })
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const t = useT()
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [expired, setExpired] = React.useState(!token)

  return (
    <AuthLayout brand={<Brand />} footer={t.reset.expiredHint}>
      <ResetPasswordForm
        error={
          expired && (
            <>
              {t.reset.expired}{' '}
              <Link to="/forgot-password" className="font-medium underline underline-offset-4">
                {t.reset.requestNew}
              </Link>
            </>
          )
        }
        onSubmit={async (password) => {
          try {
            await auth.resetPassword(token, password)
            toast.success(t.reset.changed)
            await navigate({ to: '/login', replace: true })
          } catch {
            setExpired(true)
          }
        }}
      />
    </AuthLayout>
  )
}
