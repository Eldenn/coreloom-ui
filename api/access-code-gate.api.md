# @coreloom/access-code-gate

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/access-code-gate.tsx

```ts
function AccessCodeGate
AccessCodeGate.title: string
AccessCodeGate.length?: number | undefined
AccessCodeGate.alphabet?: string | undefined
AccessCodeGate.onSubmit: (code: string) => Promise<void>
AccessCodeGate.pending?: boolean | undefined
AccessCodeGate.error?: React.ReactNode
AccessCodeGate.attemptsLeft?: number | undefined
AccessCodeGate.lockedUntil?: Date | undefined
AccessCodeGate.className?: string | undefined
type AccessCodeGateProps = {}
AccessCodeGateProps.title: string
AccessCodeGateProps.length?: number | undefined
AccessCodeGateProps.alphabet?: string | undefined
AccessCodeGateProps.onSubmit: (code: string) => Promise<void>
AccessCodeGateProps.pending?: boolean | undefined
AccessCodeGateProps.error?: React.ReactNode
AccessCodeGateProps.attemptsLeft?: number | undefined
AccessCodeGateProps.lockedUntil?: Date | undefined
AccessCodeGateProps.className?: string | undefined
const CODE_ALPHABET: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function codePattern(alphabet: string) => string
function normalizeCode(text: string, alphabet: string, length: number) => string
function slotGroups(length: number) => number[][]
```
