# @coreloom/share-dialog

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/share-dialog.tsx

```ts
function ShareDialog
ShareDialog.open?: boolean | undefined
ShareDialog.defaultOpen?: boolean | undefined
ShareDialog.onOpenChange?: ((open: boolean) => void) | undefined
ShareDialog.title: string
ShareDialog.visibility: ShareVisibility
ShareDialog.onVisibilityChange: (visibility: ShareVisibility) => Promise<void>
ShareDialog.link?: string | undefined
ShareDialog.code?: string | undefined
ShareDialog.onRegenerateLink?: (() => Promise<void>) | undefined
ShareDialog.onRegenerateCode?: (() => Promise<void>) | undefined
ShareDialog.pending?: boolean | undefined
ShareDialog.error?: React.ReactNode
ShareDialog.className?: string | undefined
type ShareDialogProps = {}
ShareDialogProps.open?: boolean | undefined
ShareDialogProps.defaultOpen?: boolean | undefined
ShareDialogProps.onOpenChange?: ((open: boolean) => void) | undefined
ShareDialogProps.title: string
ShareDialogProps.visibility: ShareVisibility
ShareDialogProps.onVisibilityChange: (visibility: ShareVisibility) => Promise<void>
ShareDialogProps.link?: string | undefined
ShareDialogProps.code?: string | undefined
ShareDialogProps.onRegenerateLink?: (() => Promise<void>) | undefined
ShareDialogProps.onRegenerateCode?: (() => Promise<void>) | undefined
ShareDialogProps.pending?: boolean | undefined
ShareDialogProps.error?: React.ReactNode
ShareDialogProps.className?: string | undefined
type ShareVisibility = 'public' | 'private' | 'protected'
```
