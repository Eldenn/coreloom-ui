# Password reset

The two screens of a password reset, in the `auth` block: ask for the email, then choose a new password from the emailed link. Built on `Form` (TanStack Form), like the sign-in forms.

**Install** `pnpm dlx shadcn@latest add @coreloom/auth`. It writes `password-reset-form.tsx` with the other auth forms.

**The consumer provides**:

- `ForgotPasswordForm`: `onSubmit(email)`, called with a valid address. Return a promise for the busy state; return `false` to stay on the form (and pass `error`). `signInHref` adds "Back to sign in", `defaultEmail` prefills the field.
- `ResetPasswordForm`: `onSubmit(password)`, called once both fields match and the password is long enough (`minPasswordLength`, 8 by default). `error` for an expired or used link, `email` for password managers.

- The confirmation never says whether the account exists ("If an account uses …, a link is on its way"), so the form can't be used to find out who has an account. Send the email only when it does; answer the same either way.
- When the card switches to the confirmation, focus moves to its heading so screen readers announce it. "Use another email" goes back with the address still typed.
- The confirm field re-checks as the first one changes. Both fields use `autoComplete="new-password"`; with `email`, a hidden `username` field lets password managers file the new password under the right account.
- Write the expired-link error with the way out: "This link has expired. Ask for a new one." and a link to the first screen.

_Parts are on `window.CoreloomUIDesignSystem_ff5f32` (`ForgotPasswordForm`, `ResetPasswordForm`)._
