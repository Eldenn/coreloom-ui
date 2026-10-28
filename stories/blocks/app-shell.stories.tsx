import type { Meta, StoryObj } from "@storybook/react-vite"
import { BarChart3Icon, BellIcon, BookOpenIcon, CreditCardIcon, FolderIcon, HomeIcon, LifeBuoyIcon, PlusIcon, RocketIcon, SettingsIcon, UserIcon, UsersIcon } from "lucide-react"

import { AppShell, PageHeader } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"

const groups = [
  { label: "Platform", items: [
    { title: "Overview", url: "#", icon: HomeIcon, isActive: true },
    { title: "Projects", url: "#", icon: FolderIcon, badge: 12 },
    { title: "Deployments", url: "#", icon: RocketIcon, badge: 3 },
    { title: "Analytics", url: "#", icon: BarChart3Icon },
  ] },
  { label: "Workspace", items: [
    { title: "Team", url: "#", icon: UsersIcon },
    { title: "Billing", url: "#", icon: CreditCardIcon },
    { title: "Settings", url: "#", icon: SettingsIcon },
  ] },
]

const meta = {
  title: "Blocks/App shell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    workspaces: [{ name: "Coreloom", plan: "Pro workspace" }, { name: "Marketing" }],
    groups,
    secondary: [{ title: "Support", url: "#", icon: LifeBuoyIcon }, { title: "Documentation", url: "#", icon: BookOpenIcon }],
    user: { name: "Matthieu C.", email: "matthieu@coreloom.dev", role: "Owner" },
    menu: [{ label: "Account", icon: UserIcon, onSelect: () => {} }],
    onSignOut: () => toast("Signed out"),
    breadcrumbs: [{ label: "Coreloom", href: "#" }, { label: "Overview" }],
    commands: [{ heading: "Navigate", items: groups.flatMap((g) => g.items).map((i) => ({ label: i.title, icon: i.icon, onSelect: () => {} })) }],
    headerActions: <Button variant="ghost" size="icon" aria-label="Notifications"><BellIcon /></Button>,
    children: null,
  },
} satisfies Meta<typeof AppShell>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: (args) => (
    <AppShell {...args}>
      <PageHeader title="Overview" description="Deployments and usage across the Coreloom workspace." actions={<Button onClick={() => toast.success("Project created")}><PlusIcon />New project</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Deployments" value="1,284" delta="+12.4%" note="last 30 days" />
        <StatCard label="Success rate" value="98.7%" delta="+0.6 pt" note="last 30 days" />
        <StatCard label="Median build" value="42s" delta="−8s" trend="down" good note="vs previous period" />
        <StatCard label="Open incidents" value="2" delta="+1" good={false} note="since yesterday" />
      </div>
    </AppShell>
  ),
}
