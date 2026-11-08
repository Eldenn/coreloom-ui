# @coreloom/model-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/model-picker.tsx

```ts
function ModelList
ModelList.models: readonly AiModel[]
ModelList.value?: string | undefined
ModelList.onValueChange: (id: string) => void
ModelList.autoFocus?: boolean | undefined
ModelList.className?: string | undefined
function ModelPicker
ModelPicker.models: readonly AiModel[]
ModelPicker.value?: string | undefined
ModelPicker.defaultValue?: string | undefined
ModelPicker.onValueChange?: ((id: string) => void) | undefined
ModelPicker.variant?: 'outline' | 'ghost' | undefined
ModelPicker.size?: 'sm' | 'default' | undefined
ModelPicker.placeholder?: string | undefined
ModelPicker.disabled?: boolean | undefined
ModelPicker.className?: string | undefined
ModelPicker.contentClassName?: string | undefined
ModelPicker.id?: string | undefined
ModelPicker.onBlur?: (() => void) | undefined
ModelPicker.aria-invalid?: boolean | 'true' | 'false' | undefined
ModelPicker.aria-describedby?: string | undefined
ModelPicker.aria-labelledby?: string | undefined
```
