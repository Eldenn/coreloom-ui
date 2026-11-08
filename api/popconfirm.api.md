# @coreloom/popconfirm

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/popconfirm.tsx

```ts
function Popconfirm
Popconfirm.title: React.ReactNode
Popconfirm.description?: React.ReactNode
Popconfirm.confirmLabel?: React.ReactNode
Popconfirm.cancelLabel?: React.ReactNode
Popconfirm.destructive?: boolean | undefined
Popconfirm.onConfirm: () => unknown
Popconfirm.onCancel?: (() => void) | undefined
Popconfirm.open?: boolean | undefined
Popconfirm.defaultOpen?: boolean | undefined
Popconfirm.onOpenChange?: ((open: boolean) => void) | undefined
Popconfirm.side?: 'left' | 'right' | 'top' | 'bottom' | undefined
Popconfirm.align?: 'end' | 'center' | 'start' | undefined
Popconfirm.icon?: React.ReactNode
Popconfirm.className?: string | undefined
Popconfirm.children: React.ReactNode
```
