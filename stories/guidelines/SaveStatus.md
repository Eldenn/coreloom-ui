# Save Status

Where an autosaving document stands, in a line beside its title or toolbar: "Saved · 2 minutes ago", "Saving…", "Unsaved changes", or "Couldn't save" with a Retry button. It says what happened; the app does the saving.

**The consumer provides** `state` (`saved`, `saving`, `unsaved` or `error`), and optionally `savedAt` (a Date, shown with RelativeTime next to Saved and kept current), `onRetry` (shows Retry while `state` is `error`) and `className`.

- Screen readers hear one polite status message, and only when the state settles: Saved, Unsaved changes or Couldn't save. Passing through Saving… isn't announced, so an autosave every few seconds doesn't chatter. The time next to Saved is read with the line, not announced.
- Each state has an icon and words; the error is also red, never only red.
- Retry goes away when the save starts: focus stays on the status line instead of falling to the page.
- Keep the last `savedAt` while a new save runs and after it fails; show `unsaved` as soon as there's a change the app hasn't sent.
- Not for one-off actions with their own result (a form's Submit): use a toast or the form's own message.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/save-status` and import from `@/components/ui/save-status`.
