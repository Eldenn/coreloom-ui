# Toaster

Toast notifications (Sonner): brief confirmations and errors that don't interrupt.

**The consumer provides** one `<Toaster />` near the app root (optional `position`, default bottom-right, `expand`), then calls `toast()` from anywhere: `toast.success(title, { description })`, `toast.error(…)`, `toast.promise(promise, { loading, success, error })`, and `action: { label, onClick }` for an undo or a link.

- Cards on `surface-1` with a `border`, `radius-md`, `shadow-lg`, 380px wide, at `z-toast` — above dialogs. Title 14px / 600 in `fg-1`, description 13px in `fg-2`; status icons in `success`, `info`, `warning`, `danger`; the action is a small `primary` button.
- It follows `<html data-theme>` on its own. Toasts stack, pause on hover and are announced politely to screen readers.
- Say what happened in a few words ("Published @coreloom/ui 2.5.0"), add the next step in the description. Errors that block the user's work belong inline (`Alert`, `FieldError`), not only in a toast.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/sonner` and import from `@/components/ui/sonner`._
