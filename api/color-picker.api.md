# @coreloom/color-picker

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/color-picker.tsx

```ts
function ColorPicker
ColorPicker.value?: string | undefined
ColorPicker.defaultValue?: string | undefined
ColorPicker.onValueChange?: ((value: string) => void) | undefined
ColorPicker.swatches?: ColorSwatch[] | undefined
ColorPicker.allowCustom?: boolean | undefined
ColorPicker.disabled?: boolean | undefined
ColorPicker.id?: string | undefined
ColorPicker.className?: string | undefined
ColorPicker.aria-label?: string | undefined
ColorPicker.aria-describedby?: string | undefined
ColorPicker.aria-invalid?: boolean | 'true' | 'false' | undefined
type ColorSwatch = {}
ColorSwatch.value: string
ColorSwatch.label: string
const defaultSwatches: ColorSwatch[]
function normalizeHex(text: string) => string | undefined
```
