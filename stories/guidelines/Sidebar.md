# Sidebar

The app's main navigation: a collapsible column of grouped links, with a workspace switcher on top and the account menu at the bottom.

**The consumer provides** a `<SidebarProvider>` around the whole layout, then `<Sidebar collapsible>` (`offcanvas` default, `icon` for a 48px rail, `none` for a fixed column) and the page in a `<SidebarInset>`. Inside the sidebar: `<SidebarHeader>`, `<SidebarContent>` holding `<SidebarGroup>`s (each a `<SidebarGroupLabel>` + `<SidebarGroupContent>` + `<SidebarMenu>`), and `<SidebarFooter>`. Each link is a `<SidebarMenuItem>` with a `<SidebarMenuButton isActive tooltip>` (icon + `<span>` label) and an optional `<SidebarMenuBadge>`. Put a `<SidebarTrigger>` in the page header and a `<SidebarRail>` at the end of the sidebar.

- `bg-base` column (the page's deepest layer) with a `border-subtle` edge, 16rem wide; the content area sits on `bg-1`. Group labels are mono 10px uppercase in `fg-muted`. The active link uses `accent-subtle` with `accent-fg` text; hover uses `surface-hover`. Badges are mono 11px.
- Ctrl / ⌘ + B toggles it. In `icon` mode the labels hide and each button shows its `tooltip` on hover. Below 768px (`--breakpoint-md`) it becomes a left `Sheet`, opened by the trigger.
- The sidebar container sits at `z-sticky`; keep the page header below it (`z-dropdown`).
- Use it for apps with more than a handful of destinations. For docs or marketing pages, a plain nav column or the header is enough.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/sidebar` (installs the `use-mobile` hook too) and import from `@/components/ui/sidebar`. The App shell template shows a full layout.
