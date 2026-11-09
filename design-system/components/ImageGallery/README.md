# ImageGallery

A grid of thumbnails that opens a full-screen viewer: product photos, screenshots attached to a ticket, generated images, a property's pictures.

**The consumer provides** `images` (`{ src, alt, thumbnail?, caption? }`), and optionally `columns` (2 to 5, 3 by default) and `aspect` (`square`, `video`, `portrait`). `ImageLightbox` is the viewer alone, for your own thumbnails: `images`, `index` + `onIndexChange`, `open` + `onOpenChange` (or `defaultOpen`).

- Each thumbnail is a button named "Open" + its `alt`, so `alt` is required and should say what the image shows.
- In the viewer, the arrow buttons or the Left and Right keys go through the images ("2 of 6" is announced), the zoom button or a click on the image shows it at full size, and Escape closes and returns the focus to the thumbnail.
- Pass a smaller `thumbnail` for the grid when the images are large; thumbnails load lazily.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/image-gallery` and import from `@/components/ui/image-gallery`._
