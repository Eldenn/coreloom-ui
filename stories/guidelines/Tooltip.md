# Tooltip

Short hint for one trigger, shown on hover after a delay and on keyboard focus.

**The consumer provides** a `<TooltipProvider>` once near the app root, then per hint `<Tooltip>` → `<TooltipTrigger asChild>` around a focusable element → `<TooltipContent>` with a few words, optionally followed by a `<Kbd>` shortcut. `side` and `sideOffset` on the content position it.

- Inverted chip — `fg-1` fill, `bg-1` text (14:1 dark, 18:1 light) — 12px / 500, `radius-sm`, `shadow-lg`, 8px from the trigger, at `z-tooltip`, above dialogs and toasts.
- The provider waits 400 ms on hover; focus shows it at once; Escape hides it. It flips when there's no room.
- Name icon-only buttons and surface shortcuts. Never put essential information only in a tooltip — touch screens never show it.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/tooltip` and import from `@/components/ui/tooltip`.
