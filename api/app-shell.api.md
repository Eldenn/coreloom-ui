# @coreloom/app-shell

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/app-shell.tsx

```ts
function AppShell
AppShell.children: React.ReactNode
AppShell.side?: 'left' | 'right' | undefined
AppShell.variant?: 'sidebar' | 'floating' | 'inset' | undefined
AppShell.collapsible?: 'none' | 'icon' | 'offcanvas' | undefined
AppShell.workspaces: import("@/components/app-sidebar").Workspace[]
AppShell.activeWorkspace?: import("@/components/app-sidebar").Workspace | undefined
AppShell.onWorkspaceSelect?: ((workspace: import("@/components/app-sidebar").Workspace) => void) | undefined
AppShell.onWorkspaceCreate?: (() => void) | undefined
AppShell.groups: import("@/components/app-sidebar").NavGroup[]
AppShell.secondary?: import("@/components/app-sidebar").NavItem[] | undefined
AppShell.user: {}
AppShell.user.name: string
AppShell.user.email?: string | undefined
AppShell.user.role?: string | undefined
AppShell.user.avatar?: string | undefined
AppShell.menu?: { label: string; icon?: import("../lib/icon").IconLike; onSelect: () => void; }[] | undefined
AppShell.onSignOut?: (() => void) | undefined
AppShell.breadcrumbs?: Crumb[] | undefined
AppShell.commands?: CommandMenuGroup[] | undefined
AppShell.onAskAi?: ((query: string) => void) | undefined
AppShell.headerActions?: React.ReactNode
AppShell.defaultSidebarOpen?: boolean | undefined
AppShell.fullWidth?: boolean | undefined
AppShell.*: react
function PageHeader
PageHeader.title: React.ReactNode
PageHeader.description?: React.ReactNode
PageHeader.actions?: React.ReactNode
```

## src/components/app-sidebar.tsx

```ts
function AppSidebar
AppSidebar.side?: 'left' | 'right' | undefined
AppSidebar.variant?: 'sidebar' | 'floating' | 'inset' | undefined
AppSidebar.collapsible?: 'none' | 'icon' | 'offcanvas' | undefined
AppSidebar.workspaces: Workspace[]
AppSidebar.activeWorkspace?: Workspace | undefined
AppSidebar.onWorkspaceSelect?: ((workspace: Workspace) => void) | undefined
AppSidebar.onWorkspaceCreate?: (() => void) | undefined
AppSidebar.groups: NavGroup[]
AppSidebar.secondary?: NavItem[] | undefined
AppSidebar.user: {}
AppSidebar.user.name: string
AppSidebar.user.email?: string | undefined
AppSidebar.user.role?: string | undefined
AppSidebar.user.avatar?: string | undefined
AppSidebar.menu?: { label: string; icon?: IconLike; onSelect: () => void; }[] | undefined
AppSidebar.onSignOut?: (() => void) | undefined
AppSidebar.*: react
type NavGroup = {}
NavGroup.label: string
NavGroup.items: NavItem[]
type NavItem = {}
NavItem.title: string
NavItem.url: string
NavItem.icon: IconLike
NavItem.isActive?: boolean | undefined
NavItem.badge?: React.ReactNode
type Workspace = {}
Workspace.name: string
Workspace.plan?: string | undefined
Workspace.logo?: React.ReactNode
```

## src/components/nav-user.tsx

```ts
function NavUser
NavUser.user: {}
NavUser.user.name: string
NavUser.user.email?: string | undefined
NavUser.user.role?: string | undefined
NavUser.user.avatar?: string | undefined
NavUser.menu?: { label: string; icon?: IconLike; onSelect: () => void; }[] | undefined
NavUser.onSignOut?: (() => void) | undefined
type NavUserProps = {}
NavUserProps.user: {}
NavUserProps.user.name: string
NavUserProps.user.email?: string | undefined
NavUserProps.user.role?: string | undefined
NavUserProps.user.avatar?: string | undefined
NavUserProps.menu?: { label: string; icon?: IconLike; onSelect: () => void; }[] | undefined
NavUserProps.onSignOut?: (() => void) | undefined
```

## src/components/app-header.tsx

```ts
function AppHeader
AppHeader.breadcrumbs?: Crumb[] | undefined
AppHeader.actions?: React.ReactNode
type Crumb = {}
Crumb.label: string
Crumb.href?: string | undefined
```

## src/components/stat-card.tsx

```ts
function StatCard
StatCard.label: string
StatCard.value: React.ReactNode
StatCard.delta?: string | undefined
StatCard.trend?: 'up' | 'down' | undefined
StatCard.good?: boolean | undefined
StatCard.note?: string | undefined
StatCard.sparkline?: readonly number[] | undefined
StatCard.className?: string | undefined
```
