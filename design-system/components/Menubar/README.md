# Menubar

A desktop-app style menu bar (File, Edit, View), for editors and tools.

**The consumer provides** `<Menubar>` with one `<MenubarMenu>` per menu, each holding a `<MenubarTrigger>` and a `<MenubarContent>`. The content takes the `DropdownMenu` parts with the `Menubar` prefix: items, checkbox and radio items, labels, separators, shortcuts, submenus.

- The bar is a 40px `surface-1` strip with a `border`. Triggers are 14px / 500 in `fg-2`, and an open trigger sits on `surface-hover`. Menus look like `DropdownMenu`.
- Once one menu is open, the pointer and arrow keys move between menus (Radix). Show each command's shortcut and wire it yourself.
- Only for app-like surfaces with many commands (an editor, a canvas). For site navigation use `NavigationMenu`; for actions on one thing use `DropdownMenu`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/menubar` and import from `@/components/ui/menubar`._
