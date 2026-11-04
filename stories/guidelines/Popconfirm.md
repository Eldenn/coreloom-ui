# Popconfirm

A small confirmation next to the button that asked for it: "Delete this comment?" with Cancel and Delete. For actions that matter but touch one item or are easy to redo.

**The consumer provides** the trigger as `children` (one Button), a `title` question and `onConfirm`. Optional: `description`, `confirmLabel` and `cancelLabel`, `destructive` (a red confirm button), `icon`, `side`, `align`, `onCancel`, and `open` / `onOpenChange` (or `defaultOpen`).

- Ask a question and name the action on the button: "Delete this comment?" then Delete, not OK.
- The focus starts on Cancel; Escape and a click outside cancel too.
- When `onConfirm` returns a promise, the button spins and the popover closes once it resolves; it stays open if it fails, so show the error.
- Use an AlertDialog for what can't be undone or touches many items; skip the confirmation and offer Undo when you can.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/popconfirm` and import from `@/components/ui/popconfirm`.
