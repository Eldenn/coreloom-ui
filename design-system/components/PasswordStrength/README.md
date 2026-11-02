# PasswordStrength

A meter under a new-password field: four bars, a word (weak, fair, good, strong) and the rules the password must meet, each ticked as it is met.

**The consumer provides** `password`, an `id` to add to the field's `aria-describedby`, and optionally `rules` (`{ label, test }`, a minimum length by default) and `minLength` (8).

- The level is an estimate made in the browser (length, kinds of characters, common passwords): a nudge for people, not a security check. Keep your server's rules, and show its errors.
- The described text holds the level and the rules not met yet; the level is announced only when it changes, not on each key.
- Colours go from `destructive` to `success`, always next to the word, never colour alone.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/password-strength` and import from `@/components/ui/password-strength`._
