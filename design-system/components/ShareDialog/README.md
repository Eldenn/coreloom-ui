# Share Dialog

The window to choose who can open a document: Private (only you), Public (anyone with the link) or Protected (the link and a code). It shows the link with Copy, the code in SecretValue, and can make a new link or code after a confirmation.

**`ShareDialog` takes** `open`, `onOpenChange`, `title`, `visibility` (`private`, `public` or `protected`), `onVisibilityChange(v) => Promise<void>`, and optionally `link`, `code`, `onRegenerateLink`, `onRegenerateCode`, `pending`, `error` and `className`.

- A choice spins on its card until the promise settles, and comes back to the old one if it rejects.
- "Regenerate the link" and "Generate a new code" are asked first (Popconfirm).
- "Copy link and code" copies a short message ready to send.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/share-dialog`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
