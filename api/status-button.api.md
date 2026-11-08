# @coreloom/status-button

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/status-button.tsx

```ts
type ActionStatus = 'idle' | 'error' | 'success' | 'loading'
function StatusButton
StatusButton.status?: ActionStatus | undefined
StatusButton.loadingLabel?: React.ReactNode
StatusButton.successLabel?: React.ReactNode
StatusButton.errorLabel?: React.ReactNode
StatusButton.size?: 'sm' | 'lg' | 'default' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined
StatusButton.variant?: 'link' | 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | null | undefined
StatusButton.asChild?: boolean | undefined
StatusButton.*: react
```
