# ImageCrop

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Frame part of an image before it's uploaded: a profile photo in a circle, a cover at 16:9. Drag the picture, or use the keyboard, to move it in a frame of a fixed ratio, and zoom it.

**The consumer provides** `src` (a URL or an object URL), and optionally `aspect` (width ÷ height, 1 by default), `round` (a round frame for an avatar; the crop stays square) and `value` / `defaultValue` / `onValueChange`: `{ x, y, zoom }`, the frame's centre as fractions of the image and the zoom from 1 (the image covers the frame) to 4.

**`cropImage(file, value, { aspect, maxSize })`** draws the framed part into a new `File`, with the same name and type (PNG for types a canvas can't write), at most `maxSize` pixels on its longer side (1024 by default). `cropRect` gives the same part in the image's pixels, for a server that crops itself.

**`ImageCropDialog` takes** `file` (the dialog is open while there is one), `aspect`, `round`, `maxSize` and `onDone(file)`: the cropped file on Apply, `null` on Cancel. It is what ImageInput opens when cropping is on.

- The frame is a focusable area: the arrow keys move the image, + and − zoom; the hint under it says so. The zoom slider and the zoom buttons do the same with a pointer or a screen reader.
- The image can't leave the frame: moves and zooms stop at its edges.
- It reads the file in the browser; nothing is uploaded. Upload the cropped file yourself.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/image-crop` and import from `@/components/ui/image-crop`.
