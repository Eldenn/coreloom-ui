'use client'

// Coreloom UI — TreemapChart. Many parts of a whole at once, as tiles sized by value: storage by
// project, spend by service, tokens by agent. Tiles can be colored by group (up to five); names and
// values are written in the tiles that are big enough. On Recharts through ChartContainer; every
// item is also in a visually hidden list with its value and share.
//
//   <TreemapChart data={[{ name: 'api', value: 420, group: 'compute' }, …]}
//     groups={[{ key: 'compute', label: 'Compute' }]} />
import { Treemap } from 'recharts'

import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface TreemapItem {
  name: string
  value: number
  /** The `key` of one of `groups`: sets the tile's color. */
  group?: string
}

interface TreemapGroup {
  key: string
  label: string
}

interface TreemapChartProps {
  data: readonly TreemapItem[]
  /** Up to five groups, colored `chart-1` … `chart-5` and listed in a legend. Without groups every tile is `chart-1`. */
  groups?: readonly TreemapGroup[]
  /** Height in pixels (default 320). */
  height?: number
  /** Formats values in tiles, the tooltip and the hidden list (default: the locale's number format). */
  formatValue?: (value: number) => string
  className?: string
  /** What the tiles show, for screen readers ("Storage by project"). */
  'aria-label'?: string
}

interface TileProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  value?: number
  group?: string
  depth?: number
}

function TreemapChart({
  data,
  groups = [],
  height = 320,
  formatValue,
  className,
  'aria-label': ariaLabel,
}: TreemapChartProps) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.charts
  const fmt = formatValue ?? formatNumber
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })
  const shownGroups = groups.slice(0, 5)
  const colorOf = new Map(shownGroups.map((g, i) => [g.key, `var(--chart-${i + 1})`]))
  const config = Object.fromEntries(
    shownGroups.map((g, i) => [g.key, { label: g.label, color: `var(--chart-${i + 1})` }]),
  ) satisfies ChartConfig
  const items = data
    .filter((d) => Number.isFinite(d.value) && d.value > 0)
    .sort((a, b) => b.value - a.value)
  const total = items.reduce((sum, d) => sum + d.value, 0)

  function tile({ x = 0, y = 0, width = 0, height: h = 0, name, value, group, depth }: TileProps) {
    // Depth 0 is the root that wraps everything: nothing to draw.
    if (depth === 0 || !name) return <g />
    const color = (group && colorOf.get(group)) ?? 'var(--chart-1)'
    const roomy = width > 64 && h > 36
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={h}
          rx={3}
          fill={`color-mix(in oklab, ${color} 34%, var(--surface-2))`}
          stroke="var(--bg-1)"
          strokeWidth={2}
        />
        <rect x={x + 1} y={y + 1} width={Math.max(0, width - 2)} height={3} rx={1} fill={color} />
        {roomy && (
          <>
            <text x={x + 8} y={y + 20} className="fill-foreground text-[12px] font-medium">
              {name.length * 7 > width - 12
                ? `${name.slice(0, Math.max(1, Math.floor((width - 16) / 7)))}…`
                : name}
            </text>
            <text x={x + 8} y={y + 35} className="fill-fg-secondary font-mono text-[11px]">
              {fmt(value ?? 0)}
            </text>
          </>
        )}
      </g>
    )
  }

  if (items.length === 0)
    return <p className={cn('text-[13px] text-muted-foreground', className)}>{t.empty}</p>

  return (
    <div data-slot="treemap-chart" className={cn('grid w-full gap-3', className)}>
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      >
        <Treemap
          data={items.map((d) => ({ ...d }))}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          isAnimationActive={false}
          content={(node) => tile(node)}
        >
          <ChartTooltip
            content={({ active, payload }) => {
              const item = payload.at(0)?.payload as TreemapItem | undefined
              if (!active || !item) return null
              const group = shownGroups.find((g) => g.key === item.group)
              return (
                <div className="grid gap-1 rounded-md border border-border bg-popover px-2.5 py-2 text-[12px] text-fg-secondary shadow-lg">
                  <div className="font-medium text-foreground">{item.name}</div>
                  {group && <div className="text-muted-foreground">{group.label}</div>}
                  <div className="flex justify-between gap-4 font-mono tabular-nums">
                    <span className="text-foreground">{fmt(item.value)}</span>
                    <span className="text-muted-foreground">
                      {percent.format(item.value / total)}
                    </span>
                  </div>
                </div>
              )
            }}
          />
        </Treemap>
      </ChartContainer>
      {shownGroups.length > 0 && (
        <ul aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-fg-secondary">
          {shownGroups.map((g) => (
            <li key={g.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: colorOf.get(g.key) }} />
              {g.label}
            </li>
          ))}
        </ul>
      )}
      <ul className="sr-only" aria-label={ariaLabel}>
        {items.map((d) => {
          const group = shownGroups.find((g) => g.key === d.group)
          return (
            <li key={d.name}>
              {t.share(
                group ? `${d.name} (${group.label})` : d.name,
                fmt(d.value),
                percent.format(d.value / total),
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { TreemapChart, type TreemapChartProps, type TreemapGroup, type TreemapItem }
