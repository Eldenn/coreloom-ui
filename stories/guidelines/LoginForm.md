# Auth screens

Sign-in, sign-up and code verification forms with a centered layout, as one installable block. The same block holds the password reset screens (see **Password reset**). Built on `Form` (TanStack Form).

**Install** `pnpm dlx shadcn@latest add @coreloom/auth`. It writes `auth-layout.tsx`, `login-form.tsx`, `signup-form.tsx`, `verify-form.tsx` and `password-reset-form.tsx`, and installs `@coreloom/form`.

**The consumer provides**:

- `onSubmit(values)` on each form: `{ email, password }`, `{ name, email, password }` or the 6-digit code. It's called only with valid values (email format, required fields, password length, six digits); return a promise and the button shows a spinner until it settles.
- `error` with the server's message, shown as a destructive `Alert` above the fields. `pending` adds a busy state you control (an OAuth redirect). `defaultEmail` prefills sign-in.
- On login and sign-up: `providers` (`{ id, label, icon }`) and `onProvider` for OAuth buttons; `forgotPasswordHref`, `signUpHref`, `signInHref` and `terms`.
- On the code form: `destination` (masked), `onResend` and `resendIn` (seconds).
- Wrap a form in `<AuthLayout brand footer>` for the full page: the `bg-base` backdrop with the faint cyan top-light, the brand on top and small print below.

- Cards are 400px max, on `surface-2`. Inputs carry the right `autoComplete` (`email`, `current-password`, `new-password`, `one-time-code`) so password managers and SMS autofill work.
- Field errors appear once a field has been left or the form submitted, then follow the typing. The code form submits on its own when the sixth digit is in; the button stays for those who wait. "Resend code" unlocks after the countdown.
- Write errors as what happened, not who's at fault: "Wrong email or password.", "That code has expired — we sent a new one."
