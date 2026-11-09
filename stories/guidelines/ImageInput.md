# ImageInput

One image with its preview: a profile photo, a workspace logo, a cover.

**The consumer provides** `value` + `onValueChange` (a `File` once chosen, a URL string for the image already saved, or `null`), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `shape` (`circle`, `square`, `wide` for 16:9), `accept`, `maxSize` (bytes), `fallback` (initials, an icon), `hint`, `disabled` and `crop`.

- Click the preview or drop an image on it to choose; Upload (then Replace) and Remove sit beside it. A file of the wrong type or over `maxSize` is refused with a message, and the current image stays.
- The hint under the buttons lists the accepted types and size ("PNG, JPEG, WEBP, GIF, up to 2 MB.").
- `crop` frames a chosen image before taking it: a dialog (ImageCrop) to move and zoom it, in the shape's ratio (round for `circle`), then Apply. The value is the cropped File (PNG, JPEG or WEBP, at most 1024 px on its longer side). Pass `{ aspect, maxSize }` for another ratio or size. Cancel keeps the current image.
- It only collects the File: upload it yourself, then pass the saved URL back as the value. Use FileUpload for several files or for documents.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/image-input` and import from `@/components/ui/image-input`.
