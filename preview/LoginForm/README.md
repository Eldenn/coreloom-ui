# Auth screens

Sign-in, sign-up and code verification forms with a centered layout, as one installable block.

**Install** `pnpm dlx shadcn@latest add @coreloom/auth`. It writes `auth-layout.tsx`, `login-form.tsx`, `signup-form.tsx` and `verify-form.tsx`.

**The consumer provides**:

- `onSubmit(values)` on each form: `{ email, password }`, `{ name, email, password }` or the 6-digit code. The forms are uncontrolled and call it with the values.
- `pending` while your request runs, and `error` with the message to show. Login and sign-up show it as a destructive `Alert`; the code form shows it under the boxes.
- On login and sign-up: `providers` (`{ id, label, icon }`) and `onProvider` for OAuth buttons; `forgotPasswordHref`, `signUpHref`, `signInHref` and `terms`.
- On the code form: `destination` (masked), `onResend` and `resendIn` (seconds).
- Wrap a form in `<AuthLayout brand footer>` for the full page: the `bg-base` backdrop with the faint cyan top-light, the brand on top and small print below.

- Cards are 400px max, on `surface-2`. Inputs carry the right `autoComplete` (`email`, `current-password`, `new-password`, `one-time-code`) so password managers and SMS autofill work.
- The code form submits on its own when the sixth digit is in; the button stays for those who wait. "Resend code" unlocks after the countdown.
- Write errors as what happened, not who's at fault: "Wrong email or password.", "That code has expired — we sent a new one."

_Parts are on `window.CoreloomUIDesignSystem_ff5f32` (`AuthLayout`, `LoginForm`, `SignupForm`, `VerifyForm`)._
