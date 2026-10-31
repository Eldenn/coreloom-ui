// The signed-in area: every route under src/routes/_app/ renders inside this app shell, and
// signed-out visitors are sent to /login first (then back where they were going).
import { Outlet, createFileRoute, redirect, useLocation, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  ActivityIcon,
  BookOpenIcon,
  BotIcon,
  FlaskConicalIcon,
  FolderIcon,
  HomeIcon,
  LanguagesIcon,
  LifeBuoyIcon,
  MessagesSquareIcon,
  PlusIcon,
  RocketIcon,
  SettingsIcon,
} from "lucide-react"

import { AppNotifications } from "@/components/app-notifications"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { auth, useAuth } from "@/lib/auth"
import { useLocale, useT, type Locale } from "@/lib/locale"

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) throw redirect({ to: "/login", search: { redirect: location.href } })
  },
  component: AppLayout,
})

function LanguageMenu() {
  const { locale, setLocale } = useLocale()
  const t = useT()
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t.shell.language}>
              <LanguagesIcon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.shell.language}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t.shell.language}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={(value) => setLocale(value as Locale)}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AppLayout() {
  const t = useT()
  const user = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // The page's breadcrumbs come from the matched routes' `staticData.crumb` / loader data.
  const crumbs = useRouterState({
    select: (state) =>
      state.matches.flatMap((match) => {
        const crumb = (match.loaderData as { crumb?: string } | undefined)?.crumb ?? match.staticData.crumb
        return crumb ? [{ label: typeof crumb === "function" ? crumb(t) : crumb, href: match.pathname.replace(/(.)\/$/, "$1") }] : []
      }),
  })

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`))

  return (
    <AppShell
      workspaces={[{ name: "Coreloom", plan: t.shell.plan }]}
      user={user ?? { name: "" }}
      onSignOut={() => {
        auth.signOut()
        void navigate({ to: "/login" })
      }}
      groups={[
        {
          label: t.shell.platform,
          items: [
            { title: t.nav.overview, url: "/", icon: HomeIcon, isActive: isActive("/") },
            { title: t.nav.projects, url: "/projects", icon: FolderIcon, isActive: isActive("/projects") },
            { title: t.nav.deployments, url: "/deployments", icon: RocketIcon, isActive: isActive("/deployments") },
            { title: t.nav.settings, url: "/settings", icon: SettingsIcon, isActive: isActive("/settings") },
          ],
        },
        {
          label: t.shell.ai,
          items: [
            { title: t.nav.assistant, url: "/assistant", icon: MessagesSquareIcon, isActive: isActive("/assistant") },
            { title: t.nav.agents, url: "/agents", icon: BotIcon, isActive: isActive("/agents") },
            { title: t.nav.runs, url: "/runs", icon: ActivityIcon, isActive: isActive("/runs") },
            { title: t.nav.playground, url: "/playground", icon: FlaskConicalIcon, isActive: isActive("/playground") },
            { title: t.nav.knowledge, url: "/knowledge", icon: BookOpenIcon, isActive: isActive("/knowledge") },
          ],
        },
      ]}
      secondary={[{ title: t.nav.docs, url: "https://eldenn.github.io/coreloom-ui/", icon: LifeBuoyIcon }]}
      breadcrumbs={[{ label: "Coreloom", href: "/" }, ...crumbs]}
      onAskAi={(q) => void navigate({ to: "/assistant", search: { q } })}
      commands={[
        {
          heading: t.shell.goTo,
          items: [
            { label: t.nav.overview, icon: HomeIcon, onSelect: () => void navigate({ to: "/" }) },
            { label: t.nav.projects, icon: FolderIcon, onSelect: () => void navigate({ to: "/projects" }) },
            { label: t.nav.deployments, icon: RocketIcon, onSelect: () => void navigate({ to: "/deployments" }) },
            { label: t.nav.settings, icon: SettingsIcon, onSelect: () => void navigate({ to: "/settings" }) },
            { label: t.nav.assistant, icon: MessagesSquareIcon, onSelect: () => void navigate({ to: "/assistant" }) },
            { label: t.nav.agents, icon: BotIcon, onSelect: () => void navigate({ to: "/agents" }) },
            { label: t.nav.runs, icon: ActivityIcon, onSelect: () => void navigate({ to: "/runs" }) },
            { label: t.nav.playground, icon: FlaskConicalIcon, onSelect: () => void navigate({ to: "/playground" }) },
            { label: t.nav.knowledge, icon: BookOpenIcon, onSelect: () => void navigate({ to: "/knowledge" }) },
          ],
        },
        {
          heading: t.shell.actions,
          items: [{ label: t.projects.new, icon: PlusIcon, onSelect: () => void navigate({ to: "/projects", search: { new: true } }) }],
        },
      ]}
      headerActions={
        <>
          <AppNotifications />
          <LanguageMenu />
        </>
      }
    >
      <Outlet />
    </AppShell>
  )
}
