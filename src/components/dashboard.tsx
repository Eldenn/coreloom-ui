'use client'

// Coreloom UI — Dashboard parts (dashboard block). A grid of StatCards, a card that frames a chart
// with its title and controls, a ready-made trend chart, and an activity feed. Feed them data; the
// page layout (AppShell, PageHeader) comes from the app-shell block.
import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { StatCard } from '@/components/stat-card'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Stat cards in a responsive grid: 1 column on phones, up to 4 on wide screens. */
function StatGrid({
  stats,
  className,
}: {
  stats: React.ComponentProps<typeof StatCard>[]
  className?: string
}) {
  return (
    <div
      data-slot="stat-grid"
      className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}
    >
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}

/** A card for a chart or a table: title, description, controls at the right (a range, tabs). */
function ChartCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {actions && <CardAction className="flex items-center gap-2">{actions}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface TrendSeries {
  key: string
  label: string
}

/**
 * Up to five series over a category axis, in the chart-1…5 order. `type` picks area, bar or line.
 * Numbers on the axis and in the tooltip follow the i18n locale.
 */
function TrendChart<T extends object>({
  data,
  xKey,
  series,
  type = 'area',
  height = 260,
  formatValue,
  className,
  'aria-label': ariaLabel,
}: {
  data: T[]
  xKey: keyof T & string
  series: TrendSeries[]
  type?: 'area' | 'bar' | 'line'
  height?: number
  /** Formats values on the axis and in the tooltip (default: the locale's number format). */
  formatValue?: (value: number) => string
  className?: string
  /** What the chart shows, for screen readers ("Deployments per day, last 30 days"). */
  'aria-label'?: string
}) {
  const { formatNumber } = useCoreloomI18n()
  const fmt = formatValue ?? formatNumber
  const config = Object.fromEntries(
    series.slice(0, 5).map((s, i) => [s.key, { label: s.label, color: `var(--chart-${i + 1})` }]),
  ) satisfies ChartConfig
  const common = { data, accessibilityLayer: true, margin: { left: 4, right: 8, top: 8 } }
  const axes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- needed in apps where the key isn't narrowed to string (the starter's build fails without it)
        dataKey={xKey as string}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={24}
      />
      <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => fmt(v)} />
      <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} />} />
      {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
    </>
  )
  return (
    <ChartContainer
      config={config}
      className={cn('w-full', className)}
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
    >
      {type === 'bar' ? (
        <BarChart {...common}>
          {axes}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} />
          ))}
        </BarChart>
      ) : type === 'line' ? (
        <LineChart {...common}>
          {axes}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      ) : (
        <AreaChart {...common}>
          {axes}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              type="monotone"
              fill={`var(--color-${s.key})`}
              fillOpacity={0.18}
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      )}
    </ChartContainer>
  )
}

interface ActivityItem {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Shown at the right: "2 min ago", a time. */
  time?: React.ReactNode
  /** A Lucide element (`<RocketIcon />`) or an Avatar. */
  icon?: React.ReactNode
  status?: 'success' | 'warning' | 'danger' | 'neutral'
}

const dot = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-border-strong',
}

/** A dated list of events: deployments, sign-ups, alerts. Newest first. */
function ActivityFeed({
  items,
  title,
  className,
}: {
  items: ActivityItem[]
  title?: React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.dashboard
  return (
    <Card className={cn('gap-3', className)}>
      <CardHeader>
        <CardTitle>{title ?? t.activity}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="m-0 text-[13px] text-muted-foreground">{t.noActivity}</p>
        ) : (
          <ol className="flex flex-col">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 border-b border-border-subtle py-3 first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground [&_svg]:size-4">
                  {item.icon}
                  {item.status && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card',
                        dot[item.status],
                      )}
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[14px] leading-snug text-foreground">{item.title}</span>
                  {item.description && (
                    <span className="text-[13px] leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
                {item.time && (
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {item.time}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

export { ActivityFeed, type ActivityItem, ChartCard, StatGrid, TrendChart, type TrendSeries }
