# @coreloom/chip-group

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/chip-group.tsx

```ts
function ChipGroup
ChipGroup.options: ChipOption[]
ChipGroup.name?: string | undefined
ChipGroup.size?: 'sm' | 'default' | undefined
ChipGroup.disabled?: boolean | undefined
ChipGroup.className?: string | undefined
ChipGroup.aria-label?: string | undefined
ChipGroup.aria-labelledby?: string | undefined
ChipGroup.aria-describedby?: string | undefined
ChipGroup.type?: 'multiple' | 'single' | undefined
ChipGroup.value?: string | string[] | undefined
ChipGroup.defaultValue?: string | string[] | undefined
ChipGroup.onValueChange?: ((value: string[]) => void) | ((value: string) => void) | undefined
type ChipOption = {}
ChipOption.value: string
ChipOption.label: React.ReactNode
ChipOption.icon?: React.ReactNode
ChipOption.count?: number | undefined
ChipOption.disabled?: boolean | undefined
```
