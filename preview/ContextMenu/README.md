# ContextMenu

A menu of actions on an element, opened by right-click or long-press.

**The consumer provides** `<ContextMenu>` with a `<ContextMenuTrigger>` around the area (a row, a card, a canvas) and a `<ContextMenuContent>`. The content takes the same parts as `DropdownMenu`: `<ContextMenuItem variant>`, `<ContextMenuLabel>`, `<ContextMenuSeparator>`, `<ContextMenuShortcut>`, `<ContextMenuCheckboxItem>`, `<ContextMenuRadioGroup>` + `<ContextMenuRadioItem>`, and `<ContextMenuSub>` with `<ContextMenuSubTrigger>` / `<ContextMenuSubContent>`.

- It looks exactly like `DropdownMenu`: `surface-1`, `border`, `radius-md`, `shadow-lg`, at `z-popover`. Items are 14px in `fg-2`; labels mono uppercase; checks in `accent`; destructive items in `danger`.
- Arrow keys, type-ahead and Escape work as in `DropdownMenu` (Radix). Shift+F10 or the context-menu key opens it from the keyboard.
- Right-click is hidden from many users. Every action in it must also be reachable another way, usually a `DropdownMenu` on the same row.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/context-menu` and import from `@/components/ui/context-menu`._
