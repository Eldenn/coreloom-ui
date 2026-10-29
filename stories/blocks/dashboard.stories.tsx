import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangleIcon, BarChart3Icon, FolderIcon, HomeIcon, RocketIcon, SettingsIcon, UserPlusIcon } from "lucide-react"

import { AppShell, PageHeader } from "@/components/app-shell"
import { ActivityFeed, ChartCard, StatGrid, TrendChart } from "@/components/dashboard"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Deterministic data: a gentle weekly rhythm, no randomness.
const days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 15 + i)
  return {
    day: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    production: 32 + ((i * 7) % 11) + (i % 7 < 5 ? 14 : 0),
    preview: 58 + ((i * 5) % 13) + (i % 7 < 5 ? 22 : 4),
  }
})

const deploys = [
  { project: "coreloom-web", branch: "main", status: "ready", time: "2 min ago" },
  { project: "coreloom-api", branch: "feat/billing", status: "building", time: "6 min ago" },
  { project: "docs", branch: "main", status: "ready", time: "18 min ago" },
  { project: "coreloom-api", branch: "main", status: "failed", time: "1 h ago" },
] as const

const statusVariant = { ready: "success", building: "warning", failed: "destructive" } as const

const meta = {
  title: "Blocks/Dashboard",
  component: StatGrid,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { stats: [] },
} satisfies Meta<typeof StatGrid>
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({ from: new Date(2026, 8, 15), to: new Date(2026, 9, 14) })
    const [type, setType] = React.useState<"area" | "bar" | "line">("area")
    return (
      <AppShell
        workspaces={[{ name: "Coreloom", plan: "Pro workspace" }]}
        groups={[
          {
            label: "Platform",
            items: [
              { title: "Overview", url: "#", icon: <HomeIcon />, isActive: true },
              { title: "Projects", url: "#", icon: <FolderIcon /> },
              { title: "Deployments", url: "#", icon: <RocketIcon /> },
              { title: "Analytics", url: "#", icon: <BarChart3Icon /> },
              { title: "Settings", url: "#", icon: <SettingsIcon /> },
            ],
          },
        ]}
        user={{ name: "Matthieu C.", email: "matthieu@coreloom.dev" }}
        breadcrumbs={[{ label: "Coreloom", href: "#" }, { label: "Overview" }]}
      >
        <PageHeader title="Overview" description="Deployments and usage across the workspace." actions={<DateRangePicker value={range} onValueChange={setRange} className="w-[260px]" aria-label="Period" />} />
        <StatGrid
          stats={[
            { label: "Deployments", value: "1,284", delta: "+12.4%", note: "last 30 days" },
            { label: "Success rate", value: "98.7%", delta: "+0.6 pt", note: "last 30 days" },
            { label: "Median build", value: "42s", delta: "−8s", trend: "down", good: true, note: "vs previous period" },
            { label: "Open incidents", value: "2", delta: "+1", good: false, note: "since yesterday" },
          ]}
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartCard
            className="xl:col-span-2"
            title="Deployments per day"
            description="Production and preview, last 30 days"
            actions={
              <ToggleGroup type="single" variant="outline" size="sm" value={type} onValueChange={(v) => v && setType(v as typeof type)} aria-label="Chart type">
                <ToggleGroupItem value="area">Area</ToggleGroupItem>
                <ToggleGroupItem value="bar">Bars</ToggleGroupItem>
                <ToggleGroupItem value="line">Lines</ToggleGroupItem>
              </ToggleGroup>
            }
          >
            <TrendChart
              data={days}
              xKey="day"
              type={type}
              series={[
                { key: "production", label: "Production" },
                { key: "preview", label: "Preview" },
              ]}
              aria-label="Deployments per day, production and preview, last 30 days"
            />
          </ChartCard>
          <ActivityFeed
            items={[
              { id: "1", icon: <RocketIcon />, status: "success", title: "coreloom-web deployed to production", description: "main · 3f2a9c1", time: "2m" },
              { id: "2", icon: <UserPlusIcon />, status: "neutral", title: "Ada joined the workspace", time: "1h" },
              { id: "3", icon: <AlertTriangleIcon />, status: "danger", title: "coreloom-api build failed", description: "Type error in src/billing.ts", time: "1h" },
              { id: "4", icon: <RocketIcon />, status: "success", title: "docs deployed to production", time: "3h" },
            ]}
          />
        </div>
        <ChartCard title="Recent deployments">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deploys.map((d) => (
                <TableRow key={d.project + d.branch}>
                  <TableCell className="font-medium text-foreground">{d.project}</TableCell>
                  <TableCell className="font-mono text-[12px]">{d.branch}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[d.status]}>
                      <BadgeDot />
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px]">{d.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ChartCard>
      </AppShell>
    )
  },
}
