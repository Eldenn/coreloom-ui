# @coreloom/auth

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/auth-layout.tsx

```ts
function AuthLayout
AuthLayout.brand?: React.ReactNode
AuthLayout.children: React.ReactNode
AuthLayout.footer?: React.ReactNode
AuthLayout.className?: string | undefined
```

## src/components/login-form.tsx

```ts
function LoginForm
LoginForm.onSubmit: (values: { email: string; password: string; }) => unknown
LoginForm.onProvider?: ((providerId: string) => void) | undefined
LoginForm.providers?: OAuthProvider[] | undefined
LoginForm.pending?: boolean | undefined
LoginForm.error?: React.ReactNode
LoginForm.defaultEmail?: string | undefined
LoginForm.forgotPasswordHref?: string | undefined
LoginForm.signUpHref?: string | undefined
LoginForm.title?: React.ReactNode
LoginForm.description?: React.ReactNode
LoginForm.className?: string | undefined
type OAuthProvider = {}
OAuthProvider.id: string
OAuthProvider.label: string
OAuthProvider.icon?: React.ReactNode
function validateEmail(value: string, t?: Pick<Messages['auth'], 'emailRequired' | 'emailInvalid'>) => string | undefined
```

## src/components/signup-form.tsx

```ts
function SignupForm
SignupForm.onSubmit: (values: { name: string; email: string; password: string; }) => unknown
SignupForm.onProvider?: ((providerId: string) => void) | undefined
SignupForm.providers?: OAuthProvider[] | undefined
SignupForm.pending?: boolean | undefined
SignupForm.error?: React.ReactNode
SignupForm.minPasswordLength?: number | undefined
SignupForm.signInHref?: string | undefined
SignupForm.terms?: React.ReactNode
SignupForm.title?: React.ReactNode
SignupForm.description?: React.ReactNode
SignupForm.className?: string | undefined
```

## src/components/verify-form.tsx

```ts
function VerifyForm
VerifyForm.onSubmit: (code: string) => unknown
VerifyForm.onResend?: (() => void) | undefined
VerifyForm.destination?: string | undefined
VerifyForm.pending?: boolean | undefined
VerifyForm.error?: React.ReactNode
VerifyForm.resendIn?: number | undefined
VerifyForm.title?: React.ReactNode
VerifyForm.className?: string | undefined
```

## src/components/password-reset-form.tsx

```ts
function ForgotPasswordForm
ForgotPasswordForm.onSubmit: (email: string) => unknown
ForgotPasswordForm.pending?: boolean | undefined
ForgotPasswordForm.error?: React.ReactNode
ForgotPasswordForm.defaultEmail?: string | undefined
ForgotPasswordForm.signInHref?: string | undefined
ForgotPasswordForm.title?: React.ReactNode
ForgotPasswordForm.description?: React.ReactNode
ForgotPasswordForm.className?: string | undefined
function ResetPasswordForm
ResetPasswordForm.onSubmit: (password: string) => unknown
ResetPasswordForm.pending?: boolean | undefined
ResetPasswordForm.error?: React.ReactNode
ResetPasswordForm.minPasswordLength?: number | undefined
ResetPasswordForm.email?: string | undefined
ResetPasswordForm.title?: React.ReactNode
ResetPasswordForm.description?: React.ReactNode
ResetPasswordForm.className?: string | undefined
```
