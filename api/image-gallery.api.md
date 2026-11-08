# @coreloom/image-gallery

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/image-gallery.tsx

```ts
type GalleryImage = {}
GalleryImage.src: string
GalleryImage.alt: string
GalleryImage.thumbnail?: string | undefined
GalleryImage.caption?: React.ReactNode
function ImageGallery
ImageGallery.images: GalleryImage[]
ImageGallery.columns?: 2 | 5 | 4 | 3 | undefined
ImageGallery.aspect?: 'square' | 'video' | 'portrait' | undefined
ImageGallery.className?: string | undefined
ImageGallery.aria-label?: string | undefined
function ImageLightbox
ImageLightbox.images: GalleryImage[]
ImageLightbox.index: number
ImageLightbox.onIndexChange: (index: number) => void
ImageLightbox.open: boolean
ImageLightbox.onOpenChange: (open: boolean) => void
ImageLightbox.onCloseAutoFocus?: ((event: Event) => void) | undefined
```
