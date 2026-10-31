import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { AuthLayout } from '@/components/auth-layout'
import { Brand } from '@/components/brand'
import { ForgotPasswordForm } from '@/components/password-reset-form'
import { auth } from '@/lib/auth'
import { useT } from '@/lib/locale'

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: ({ context }) => {
    if (context.auth.user) throw redirect({ to: '/' })
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const t = useT()
  return (
    <AuthLayout
      brand={<Brand />}
      footer={
        <>
          {t.reset.hint}{' '}
          <Link to="/reset-password" search={{ token: 'demo' }}>
            {t.reset.openLink}
          </Link>
        </>
      }
    >
      <ForgotPasswordForm
        signInHref="/login"
        onSubmit={(email) => auth.requestPasswordReset(email)}
      />
    </AuthLayout>
  )
}
