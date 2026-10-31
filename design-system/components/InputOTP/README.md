# InputOTP

A one-time code input, one box per character, built on `input-otp`.

**The consumer provides** `<InputOTP maxLength value onChange>` (or `defaultValue`), an `id` for its `FieldLabel`, and the boxes: `<InputOTPGroup>`s of `<InputOTPSlot index>`, split by `<InputOTPSeparator />`. Restrict characters with `pattern` (e.g. `REGEXP_ONLY_DIGITS` from `input-otp`).

- 42×46 slots on `surface-inset` with a `border` hairline, 18px mono digits; the active slot takes an `accent` border, `--ring-focus` and a blinking caret. `aria-invalid` on the slots turns them `danger`.
- One real input underneath: paste, autofill from SMS / email (`autoComplete="one-time-code"`) and screen readers all work.
- For verification and 2FA codes. Split 6 digits 3 + 3. Submit automatically on `onComplete`, and keep a visible button for those who wait.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/input-otp` and import from `@/components/ui/input-otp`._
