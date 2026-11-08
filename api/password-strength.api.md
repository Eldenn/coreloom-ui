# @coreloom/password-strength

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/password-strength.tsx

```ts
type PasswordRule = {}
PasswordRule.label: string
PasswordRule.test: (password: string) => boolean
function PasswordStrength
PasswordStrength.password: string
PasswordStrength.rules?: PasswordRule[] | undefined
PasswordStrength.minLength?: number | undefined
PasswordStrength.id?: string | undefined
PasswordStrength.className?: string | undefined
function passwordStrength(password: string) => 0 | 1 | 2 | 3 | 4
```
