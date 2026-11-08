# @coreloom/transfer-list

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/transfer-list.tsx

```ts
function TransferList
TransferList.options: TransferOption[]
TransferList.value?: string[] | undefined
TransferList.defaultValue?: string[] | undefined
TransferList.onValueChange?: ((value: string[]) => void) | undefined
TransferList.availableLabel?: string | undefined
TransferList.selectedLabel?: string | undefined
TransferList.disabled?: boolean | undefined
TransferList.className?: string | undefined
TransferList.aria-label?: string | undefined
TransferList.aria-labelledby?: string | undefined
TransferList.aria-describedby?: string | undefined
type TransferOption = {}
TransferOption.value: string
TransferOption.label: string
TransferOption.description?: string | undefined
TransferOption.disabled?: boolean | undefined
```
