# @coreloom/sidebar

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/sidebar.tsx

```ts
function Sidebar
Sidebar.side?: 'left' | 'right' | undefined
Sidebar.variant?: 'sidebar' | 'floating' | 'inset' | undefined
Sidebar.collapsible?: 'none' | 'icon' | 'offcanvas' | undefined
Sidebar.*: react
function SidebarContent
SidebarContent.*: react
function SidebarFooter
SidebarFooter.*: react
function SidebarGroup
SidebarGroup.*: react
function SidebarGroupAction
SidebarGroupAction.asChild?: boolean | undefined
SidebarGroupAction.*: react
function SidebarGroupContent
SidebarGroupContent.*: react
function SidebarGroupLabel
SidebarGroupLabel.asChild?: boolean | undefined
SidebarGroupLabel.*: react
function SidebarHeader
SidebarHeader.*: react
function SidebarInput
SidebarInput.*: react
function SidebarInset
SidebarInset.*: react
function SidebarMenu
SidebarMenu.*: react
function SidebarMenuAction
SidebarMenuAction.asChild?: boolean | undefined
SidebarMenuAction.showOnHover?: boolean | undefined
SidebarMenuAction.*: react
function SidebarMenuBadge
SidebarMenuBadge.*: react
function SidebarMenuButton
SidebarMenuButton.asChild?: boolean | undefined
SidebarMenuButton.isActive?: boolean | undefined
SidebarMenuButton.tooltip?: string | (import(".pnpm/@radix-ui+react-tooltip@1.4.1_@types+react-dom@19.3.0_@types+react@19.3.0__@types+react_6b024258fc950250eb2fe8f7b373fd06/node_modules/@radix-ui/react-tooltip").TooltipContentProps & React.RefAttributes<HTMLDivElement>) | undefined
SidebarMenuButton.size?: 'sm' | 'lg' | 'default' | null | undefined
SidebarMenuButton.variant?: 'default' | 'outline' | null | undefined
SidebarMenuButton.*: react
function SidebarMenuItem
SidebarMenuItem.*: react
function SidebarMenuSkeleton
SidebarMenuSkeleton.showIcon?: boolean | undefined
SidebarMenuSkeleton.*: react
function SidebarMenuSub
SidebarMenuSub.*: react
function SidebarMenuSubButton
SidebarMenuSubButton.asChild?: boolean | undefined
SidebarMenuSubButton.size?: 'sm' | 'md' | undefined
SidebarMenuSubButton.isActive?: boolean | undefined
SidebarMenuSubButton.*: react
function SidebarMenuSubItem
SidebarMenuSubItem.*: react
function SidebarProvider
SidebarProvider.defaultOpen?: boolean | undefined
SidebarProvider.open?: boolean | undefined
SidebarProvider.onOpenChange?: ((open: boolean) => void) | undefined
SidebarProvider.keyboardShortcut?: boolean | undefined
SidebarProvider.*: react
function SidebarRail
SidebarRail.*: react
function SidebarSeparator
SidebarSeparator.*: @radix-ui/react-primitive | @radix-ui/react-separator | react
function SidebarTrigger
SidebarTrigger.size?: 'sm' | 'lg' | 'default' | 'icon' | 'icon-sm' | 'icon-lg' | null | undefined
SidebarTrigger.variant?: 'link' | 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | null | undefined
SidebarTrigger.asChild?: boolean | undefined
SidebarTrigger.*: react
function useSidebar() => SidebarContextProps
```

## src/hooks/use-mobile.ts

```ts
function useIsMobile() => boolean
```
