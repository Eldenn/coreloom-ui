# ImageCrop

Frame part of an image before upload: drag or arrow keys to move it, zoom, a fixed ratio, round for avatars.

**Install** `pnpm dlx shadcn@latest add @coreloom/image-crop`. Experimental.

**The consumer provides** `src`, `aspect`, `round` and `value` / `onValueChange` (`{ x, y, zoom }`). `cropImage(file, value, { aspect })` returns the cropped File; `ImageCropDialog` asks for it, and ImageInput does it with `crop`.

_On `window.CoreloomUIDesignSystem_ff5f32` as `ImageCrop`._
