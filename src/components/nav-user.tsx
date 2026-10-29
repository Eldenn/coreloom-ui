"use client"

// Coreloom UI — NavUser (app-shell block). The account menu at the foot of the sidebar.
import * as React from "react"
import { ChevronsUpDownIcon, LogOutIcon, type LucideIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCoreloomI18n } from "@/lib/i18n"

/** A Lucide icon component (`HomeIcon`) or an element (`<HomeIcon />`): elements also cross the
 *  server → client boundary in Next.js, components don't. */
type IconLike = LucideIcon | React.ReactElement

function renderIcon(icon: IconLike | undefined) {
  if (!icon) return null
  // A component (function, forwardRef or memo, like Lucide's icons) is rendered here. Anything
  // else is already a node: an element, or what a server component's element became on the way to
  // the client (React dedupes repeated elements into lazy references).
  const kind = (icon as { $$typeof?: symbol }).$$typeof
  if (typeof icon === "function" || kind === Symbol.for("react.forward_ref") || kind === Symbol.for("react.memo")) {
    const Icon = icon as LucideIcon
    return <Icon />
  }
  return icon as React.ReactNode
}

type NavUserProps = {
  user: { name: string; email?: string; role?: string; avatar?: string }
  /** Entries above "Log out": Account, Billing, Notifications… */
  menu?: { label: string; icon?: IconLike; onSelect: () => void }[]
  onSignOut?: () => void
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function NavUser({ user, menu = [], onSignOut }: NavUserProps) {
  const t = useCoreloomI18n().messages
  const { isMobile } = useSidebar()
  const avatar = (
    <Avatar>
      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  )
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              {avatar}
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[14px] font-medium text-foreground">{user.name}</span>
                {(user.role || user.email) && (
                  <span className="truncate text-[12px] text-muted-foreground">{user.role ?? user.email}</span>
                )}
              </div>
              <ChevronsUpDownIcon className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          >
            <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-sans text-[13px] tracking-normal normal-case">
              {avatar}
              <span className="grid leading-tight">
                <span className="truncate font-medium text-foreground">{user.name}</span>
                {user.email && <span className="truncate text-[12px] font-normal text-muted-foreground">{user.email}</span>}
              </span>
            </DropdownMenuLabel>
            {menu.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {menu.map((item) => (
                    <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
                      {renderIcon(item.icon)}
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
            {onSignOut && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onSignOut}>
                  <LogOutIcon />
                  {t.appShell.logOut}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export { NavUser, type NavUserProps }
