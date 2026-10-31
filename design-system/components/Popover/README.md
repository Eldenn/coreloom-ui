# Popover

Floating panel anchored to a trigger, for small forms and extra detail.

**The consumer provides** `<Popover>` with a `<PopoverTrigger asChild>` and a `<PopoverContent>` (`align`, `side`, `sideOffset` 8 by default); inside, an optional `<PopoverHeader>` with `<PopoverTitle>` and `<PopoverDescription>`, then the content. `<PopoverAnchor>` positions it against something other than the trigger.

- `surface-1`, 1px `border`, `radius-md`, `shadow-lg`, 288px wide by default, at `z-popover` — above dialogs, under toasts and tooltips. Title 14px / 600 in `fg-1`, description 13px in `fg-muted`.
- Escape, a click outside or the trigger close it; focus moves in and back out (Radix). Unlike `Tooltip`, it may hold interactive content.
- For a quick setting, a small form or a detail card next to what it's about. If it needs a title bar, scroll, or a blocking decision, use `Dialog` or `Sheet`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/popover` and import from `@/components/ui/popover`._
