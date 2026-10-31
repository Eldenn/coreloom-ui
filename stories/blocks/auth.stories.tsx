import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { AuthLayout } from '@/components/auth-layout'
import { LoginForm } from '@/components/login-form'
import { ForgotPasswordForm, ResetPasswordForm } from '@/components/password-reset-form'
import { SignupForm } from '@/components/signup-form'
import { Icon } from '@/components/ui/icon'
import { VerifyForm } from '@/components/verify-form'

const brand = (
  <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-foreground">
    Core<span className="text-primary-text">loom</span>
  </span>
)

const meta = {
  title: 'Blocks/Auth',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    onSubmit: () => {},
    signUpHref: '#',
    providers: [{ id: 'github', label: 'Continue with GitHub', icon: <Icon name="github" /> }],
  },
  argTypes: { pending: { control: 'boolean' }, error: { control: 'text' } },
} satisfies Meta<typeof LoginForm>
export default meta
type Story = StoryObj<typeof meta>

export const SignIn: Story = {
  render: (args) => (
    <AuthLayout
      brand={brand}
      footer={
        <>
          By continuing you agree to the <a href="#">Terms</a>.
        </>
      }
    >
      <LoginForm {...args} />
    </AuthLayout>
  ),
}

export const SignInError: Story = {
  args: { error: 'Wrong email or password.' },
  render: (args) => (
    <AuthLayout brand={brand}>
      <LoginForm {...args} />
    </AuthLayout>
  ),
}

/** Try it: the form validates on change once a field is left; any password but "coreloom" fails after a short wait. */
export const SignInFlow: Story = {
  render: (args) => {
    const [error, setError] = React.useState<string>()
    return (
      <AuthLayout brand={brand}>
        <LoginForm
          {...args}
          error={error}
          onSubmit={async ({ password }) => {
            setError(undefined)
            await new Promise((r) => setTimeout(r, 900))
            if (password !== 'coreloom') setError('Wrong email or password.')
          }}
        />
      </AuthLayout>
    )
  },
}

export const SignUp: Story = {
  render: () => (
    <AuthLayout brand={brand}>
      <SignupForm
        onSubmit={() => {}}
        signInHref="#"
        terms={
          <>
            By creating an account you agree to the <a href="#">Terms</a>.
          </>
        }
      />
    </AuthLayout>
  ),
}

export const VerifyCode: Story = {
  render: () => (
    <AuthLayout brand={brand}>
      <VerifyForm onSubmit={() => {}} onResend={() => {}} destination="m•••@coreloom.dev" />
    </AuthLayout>
  ),
}

/** Try it: after "Send reset link" the card confirms without saying whether the account exists. */
export const ForgotPassword: Story = {
  render: () => (
    <AuthLayout brand={brand}>
      <ForgotPasswordForm signInHref="#" onSubmit={() => new Promise((r) => setTimeout(r, 700))} />
    </AuthLayout>
  ),
}

export const ResetPassword: Story = {
  render: () => (
    <AuthLayout brand={brand}>
      <ResetPasswordForm
        email="ada@coreloom.dev"
        onSubmit={() => new Promise((r) => setTimeout(r, 700))}
      />
    </AuthLayout>
  ),
}
