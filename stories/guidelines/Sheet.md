# Sheet

Panel that slides in from an edge of the screen — the system's drawer.

**The consumer provides** `<Sheet open onOpenChange>` (or a `<SheetTrigger asChild>`), a `<SheetContent side>` (`right` default, `left`, `top`, `bottom`) holding a `<SheetHeader>` with `<SheetTitle>` and `<SheetDescription>`, the body (with its own 22px side padding), and a `<SheetFooter>` of buttons — wrap Cancel in `<SheetClose asChild>`.

- `surface-1` panel with a `border` edge and `shadow-xl`, up to 400px wide on the sides, over the `scrim` with a 2px blur at `z-modal`; it slides in over `--dur-slow` and out over `--dur-base`. Title in `font-display` 20px / 600; the footer sits on a `border-subtle` rule, actions right-aligned.
- Same behavior as `Dialog` (Radix): focus trapped, Escape and scrim click close, focus returns to the trigger.
- Use it for side tasks that need more room than a dialog but keep the page in context: settings, filters, a record's details. Not for navigation on desktop — that's the sidebar.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/sheet` and import from `@/components/ui/sheet`.
