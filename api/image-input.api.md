# @coreloom/image-input

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/image-input.tsx

```ts
function ImageInput
ImageInput.value?: ImageValue | undefined
ImageInput.defaultValue?: ImageValue | undefined
ImageInput.onValueChange?: ((value: File | null) => void) | undefined
ImageInput.shape?: 'square' | 'circle' | 'wide' | undefined
ImageInput.accept?: string | undefined
ImageInput.maxSize?: number | undefined
ImageInput.fallback?: React.ReactNode
ImageInput.hint?: React.ReactNode
ImageInput.disabled?: boolean | undefined
ImageInput.id?: string | undefined
ImageInput.className?: string | undefined
ImageInput.onBlur?: (() => void) | undefined
ImageInput.aria-label?: string | undefined
ImageInput.aria-describedby?: string | undefined
ImageInput.aria-invalid?: boolean | 'true' | 'false' | undefined
type ImageValue = string | File | null
```
