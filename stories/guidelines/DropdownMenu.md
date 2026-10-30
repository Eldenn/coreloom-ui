# DropdownMenu

A menu of actions or options opened from a button.

**The consumer provides** `<DropdownMenu>` with a `<DropdownMenuTrigger asChild>` (usually a `secondary` or `ghost` Button) and a `<DropdownMenuContent align>` holding `<DropdownMenuItem>`s (an optional Lucide icon first, a `<DropdownMenuShortcut>` last, `variant="destructive"` for dangerous ones), `<DropdownMenuLabel>`, `<DropdownMenuSeparator>`, `<DropdownMenuCheckboxItem>` / `<DropdownMenuRadioGroup>` + `<DropdownMenuRadioItem>`, and `<DropdownMenuSub>` for nested menus.

- `surface-1` panel, 1px `border`, `radius-md`, `shadow-lg`, at `z-popover` so it also opens from inside a dialog. Items 14px in `fg-2`, highlighted on `surface-hover` in `fg-1`; labels mono uppercase; shortcuts mono 11px; checks and radio dots in `accent`; destructive items in `danger` on `danger-subtle`.
- Arrow keys, type-ahead, Escape and submenus via the keyboard come from Radix.
- For actions on one thing ("Copy project ID", "Delete project"). To pick a value in a form, use `Select`; to search across the app, `Command`. Keep the destructive item last, after a separator.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/dropdown-menu` and import from `@/components/ui/dropdown-menu`.
