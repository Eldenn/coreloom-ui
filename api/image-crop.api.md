# @coreloom/image-crop

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/image-crop.tsx

```ts
function clampCrop(value: ImageCropValue, image: Size, aspect: number) => ImageCropValue
function cropImage(file: File, value: ImageCropValue, { aspect, maxSize }: { aspect: number; maxSize?: number; }) => Promise<File>
function cropRect(value: ImageCropValue, image: Size, aspect: number) => { x: number; y: number; width: number; height: number; }
function ImageCrop
ImageCrop.src: string
ImageCrop.aspect?: number | undefined
ImageCrop.round?: boolean | undefined
ImageCrop.value?: ImageCropValue | undefined
ImageCrop.defaultValue?: ImageCropValue | undefined
ImageCrop.onValueChange?: ((value: ImageCropValue) => void) | undefined
ImageCrop.className?: string | undefined
function ImageCropDialog
ImageCropDialog.file: File | null
ImageCropDialog.aspect?: number | undefined
ImageCropDialog.round?: boolean | undefined
ImageCropDialog.maxSize?: number | undefined
ImageCropDialog.onDone: (file: File | null) => void
type ImageCropValue = {}
ImageCropValue.x: number
ImageCropValue.y: number
ImageCropValue.zoom: number
function visibleFraction(image: Size, aspect: number, zoom: number) => { w: number; h: number; }
```
