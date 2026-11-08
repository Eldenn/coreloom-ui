# @coreloom/secret-value

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/secret-value.tsx

```ts
function maskSecret(value: string, visibleStart?: number, visibleEnd?: number, dots?: number) => string
function SecretValue
SecretValue.value: string
SecretValue.revealed?: boolean | undefined
SecretValue.defaultRevealed?: boolean | undefined
SecretValue.onRevealedChange?: ((revealed: boolean) => void) | undefined
SecretValue.onReveal?: (() => void) | undefined
SecretValue.visibleStart?: number | undefined
SecretValue.visibleEnd?: number | undefined
SecretValue.copy?: boolean | undefined
SecretValue.label?: string | undefined
SecretValue.*: react
```
