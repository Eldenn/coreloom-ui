# @coreloom/json-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/json-input.tsx

```ts
function JsonInput
JsonInput.value?: string | undefined
JsonInput.defaultValue?: string | undefined
JsonInput.onValueChange?: ((text: string, parsed: unknown) => void) | undefined
JsonInput.rows?: number | undefined
JsonInput.indent?: number | undefined
JsonInput.formatOnBlur?: boolean | undefined
JsonInput.placeholder?: string | undefined
JsonInput.disabled?: boolean | undefined
JsonInput.readOnly?: boolean | undefined
JsonInput.id?: string | undefined
JsonInput.name?: string | undefined
JsonInput.className?: string | undefined
JsonInput.onBlur?: (() => void) | undefined
JsonInput.aria-label?: string | undefined
JsonInput.aria-labelledby?: string | undefined
JsonInput.aria-describedby?: string | undefined
JsonInput.aria-invalid?: boolean | 'true' | 'false' | undefined
function parseJson(text: string) => { ok: true; value: unknown; } | { ok: false; at: { line: number; column: number; }; }
```
