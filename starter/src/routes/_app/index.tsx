import * as React from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AlertTriangleIcon, RocketIcon, UserIcon } from "lucide-react"

import { PageHeader } from "@/components/app-shell"
import { ActivityFeed, ChartCard, StatGrid, TrendChart } from "@/components/dashboard"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCoreloomI18n } from "@/lib/i18n"
import { useT } from "@/lib/locale"
import { overviewQuery } from "@/lib/queries"
import { formatRelative } from "@/lib/format"

export const Route = createFileRoute("/_app/")({
  staticData: { crumb: (t) => t.nav.overview },
  loader: ({ context }) => context.queryClient.ensureQueryData(overviewQuery),
  component: OverviewPage,
})

const events = {
  deployed: { icon: <RocketIcon />, status: "success" },
  joined: { icon: <UserIcon />, status: "neutral" },
  buildFailed: { icon: <AlertTriangleIcon />, status: "danger" },
} as const

function OverviewPage() {
  const t = useT()
  const { locale, formatNumber } = useCoreloomI18n()
  const { data } = useSuspenseQuery(overviewQuery)
  const [type, setType] = React.useState<"area" | "bar" | "line">("area")
  const percent = (n: number) => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(n)
  const day = (iso: string) => new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric" })

  return (
    <>
      <PageHeader title={t.overview.title} description={t.overview.description} />
      <StatGrid
        stats={[
          { label: t.overview.deployments, value: formatNumber(data.stats.deployments), delta: "+12.4%", note: t.overview.last30 },
          { label: t.overview.successRate, value: percent(data.stats.successRate), delta: "+0.6 pt", note: t.overview.last30 },
          { label: t.overview.medianBuild, value: `${data.stats.medianBuild}s`, delta: "−8s", trend: "down", good: true, note: t.overview.vsPrevious },
          { label: t.overview.incidents, value: formatNumber(data.stats.incidents), delta: "+1", good: false, note: t.overview.sinceYesterday },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title={t.overview.chartTitle}
          description={t.overview.chartDescription}
          actions={
            <ToggleGroup type="single" variant="outline" size="sm" value={type} onValueChange={(v) => v && setType(v as typeof type)} aria-label={t.overview.chartType}>
              <ToggleGroupItem value="area">{t.overview.area}</ToggleGroupItem>
              <ToggleGroupItem value="bar">{t.overview.bars}</ToggleGroupItem>
              <ToggleGroupItem value="line">{t.overview.lines}</ToggleGroupItem>
            </ToggleGroup>
          }
        >
          <TrendChart
            data={data.daily.map((d) => ({ ...d, day: day(d.day) }))}
            xKey="day"
            type={type}
            series={[
              { key: "production", label: t.overview.production },
              { key: "preview", label: t.overview.preview },
            ]}
            aria-label={t.overview.chartTitle}
          />
        </ChartCard>
        <ActivityFeed
          title={t.overview.activity}
          items={data.activity.map((item) => ({
            id: item.id,
            title: t.overview.events[item.event](item.subject),
            description: item.event === "buildFailed" && item.detail ? t.overview.typeErrorIn(item.detail) : item.detail,
            ...events[item.event],
            time: formatRelative(item.at, locale),
          }))}
        />
      </div>
    </>
  )
}
