# AppShell

The product layout as one installable block: sidebar, header, ⌘K palette, theme toggle and the page.

**Install** `pnpm dlx shadcn@latest add @coreloom/app-shell`. It writes `app-shell.tsx`, `app-sidebar.tsx`, `nav-user.tsx`, `app-header.tsx` and `stat-card.tsx` to `components/`, along with the components they use (Sidebar, DropdownMenu, Avatar, Breadcrumb, Card, CommandMenu, ThemeMenu…). The header's theme button is `ThemeMenu`: Light, Dark or System (follows the OS).

**The consumer provides**:

- `workspaces` (`{ name, plan?, logo? }`) with `activeWorkspace`, `onWorkspaceSelect` and `onWorkspaceCreate`;
- `groups` of navigation (`{ label, items: [{ title, url, icon, isActive?, badge? }] }`, icons from `lucide-react`, as a component `HomeIcon` or an element `<HomeIcon />` — use elements from a Next.js server component) and `secondary` links;
- `user` (`{ name, email?, role?, avatar? }`) with `menu` entries and `onSignOut`;
- `breadcrumbs` (`{ label, href? }`), `commands` for the palette (`{ heading, items: [{ label, icon?, shortcut?, onSelect }] }`), `onAskAi(query)` to add "Ask AI: “…”" to the palette, and `headerActions`;
- the page as children: start with `<PageHeader title description actions>`, then `StatCard`s, tables, forms.

- The sidebar collapses to an icon rail with Ctrl / ⌘ + B and becomes a sheet below 768px. The header is sticky. Content is centered at `--container-app` with 32px gutters (16px on phones).
- Links render as `<a href>`. In Next.js, Inertia or TanStack Router, swap in their `Link` with `asChild` in `app-sidebar.tsx` (`NavLinks`). The file is yours.
- Mount `TooltipProvider` and one `Toaster` at the root (see Getting started). `StatCard` takes `label`, `value`, `delta`, `trend` (`up` / `down`), `good` and `note`: a falling build time is good news, so set `good`.
