# Dialog

Modal window over a scrim that holds focus until it is closed.

**The consumer provides** `<Dialog open onOpenChange>` (or uncontrolled with a `<DialogTrigger asChild>`), a `<DialogContent>` holding a `<DialogHeader>` with `<DialogTitle>` and `<DialogDescription>`, the body, and a `<DialogFooter>` of buttons — wrap Cancel in `<DialogClose asChild>`. Set a width with `className="sm:max-w-[520px]"` or `style`.

- `surface-1`, 1px `border`, `radius-lg`, `shadow-xl`, centered over the `scrim` with a 2px blur at `z-modal`; title in `font-display` 20px / 600, description 14px in `fg-2`; the × sits top right.
- Radix traps focus, closes on Escape or a scrim click, returns focus to the trigger and locks page scroll. It fades and zooms in over ~180 ms.
- For a decision or a short blocking task. Title as a question or action ("Publish @coreloom/ui 2.5.0?"); name the primary button with the verb; destructive confirmations use the `destructive` Button.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/dialog` and import from `@/components/ui/dialog`._
