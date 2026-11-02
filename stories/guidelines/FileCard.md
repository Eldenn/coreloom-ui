# FileCard

A file attached to something: a message, a ticket, a form, a prompt. Its type, name, size and state, with Remove and Retry.

**The consumer provides** the `name`, and optionally `size` (bytes), `type` (MIME; otherwise the extension decides the icon), `preview` (an image URL), `href` (opens the file), `progress` (0 to 100 while uploading), `error`, `onRemove`, `onRetry` and an `action`. `FileCardList` lays cards out as a `list` or a `grid`; `fileKind` is exported.

- The extension stays visible when a long name is cut: "Q3 report — board ve….pdf".
- While uploading, the card shows a progress bar and the remove button cancels; a failed upload says why and offers Retry.
- Show a thumbnail for images when you have one (an object URL while uploading).
- FileUpload is the drop zone that adds files; FileCard is how they look once added.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/file-card` and import from `@/components/ui/file-card`.
