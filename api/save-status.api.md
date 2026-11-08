# @coreloom/save-status

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/save-status.tsx

```ts
type SaveState = 'error' | 'saved' | 'saving' | 'unsaved'
function SaveStatus
SaveStatus.state: SaveState
SaveStatus.savedAt?: Date | undefined
SaveStatus.onRetry?: (() => void) | undefined
SaveStatus.className?: string | undefined
type SaveStatusProps = {}
SaveStatusProps.state: SaveState
SaveStatusProps.savedAt?: Date | undefined
SaveStatusProps.onRetry?: (() => void) | undefined
SaveStatusProps.className?: string | undefined
```
