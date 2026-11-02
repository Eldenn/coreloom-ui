# ImageInput

One image with its preview: a profile photo, a workspace logo, a cover.

**The consumer provides** `value` + `onValueChange` (a `File` once chosen, a URL string for the image already saved, or `null`), an `id` for its `FieldLabel` (or an `aria-label`), and optionally `shape` (`circle`, `square`, `wide` for 16:9), `accept`, `maxSize` (bytes), `fallback` (initials, an icon), `hint` and `disabled`.

- Click the preview or drop an image on it to choose; Upload (then Replace) and Remove sit beside it. A file of the wrong type or over `maxSize` is refused with a message, and the current image stays.
- The hint under the buttons lists the accepted types and size ("PNG, JPEG, WEBP, GIF, up to 2 MB.").
- It only collects the File: upload it yourself, then pass the saved URL back as the value. Use FileUpload for several files or for documents.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/image-input` and import from `@/components/ui/image-input`._
