# @coreloom/segmented-control

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/segmented-control.tsx

```ts
function SegmentedControl
SegmentedControl.options: SegmentedOption[]
SegmentedControl.value?: string | undefined
SegmentedControl.defaultValue?: string | undefined
SegmentedControl.onValueChange?: ((value: string) => void) | undefined
SegmentedControl.name?: string | undefined
SegmentedControl.size?: 'sm' | 'default' | undefined
SegmentedControl.iconOnly?: boolean | undefined
SegmentedControl.fullWidth?: boolean | undefined
SegmentedControl.disabled?: boolean | undefined
SegmentedControl.className?: string | undefined
SegmentedControl.aria-label?: string | undefined
SegmentedControl.aria-labelledby?: string | undefined
SegmentedControl.aria-describedby?: string | undefined
type SegmentedOption = {}
SegmentedOption.value: string
SegmentedOption.label: React.ReactNode
SegmentedOption.icon?: React.ReactNode
SegmentedOption.aria-label?: string | undefined
SegmentedOption.disabled?: boolean | undefined
```
