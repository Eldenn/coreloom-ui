# Save Status

Where an autosaving document stands: "Saved · 2 minutes ago", "Saving…", "Unsaved changes", or "Couldn't save" with a Retry button.

**`SaveStatus` takes** `state` (`saved`, `saving`, `unsaved` or `error`), and optionally `savedAt` (shown with RelativeTime next to Saved), `onRetry` (shows Retry when saving failed) and `className`.

- One polite status message says Saved, Unsaved changes or Couldn't save; passing through Saving… isn't announced.
- After Retry the button goes away and focus stays on the status, not the page.
- Icons go with every state; colour is never the only signal.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/save-status`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
