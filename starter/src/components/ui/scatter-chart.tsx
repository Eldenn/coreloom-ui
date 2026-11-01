'use client'

// Coreloom UI — ScatterChart. How two measures relate across many items: latency against cost per
// model, deal size against cycle length. One dot per item, up to three groups by color, and an
// optional third measure as the dot's size (a bubble chart). On Recharts through ChartContainer;
// the points are also in a visually hidden table.
//
//   <ScatterChart groups={[{ key: 'eu', label: 'EU', points: [{ x: 120, y: 0.4, name: 'api' }] }]}
//     xLabel="Latency (ms)" yLabel="Error rate (%)" />
import {
  CartesianGrid,
  Scatter,
  ScatterChart as RechartsScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ScatterPoint {
  x: number
  y: number
  /** The third measure, drawn as the dot's area when any point has one. */
  size?: number
  /** Names the point in the tooltip and the hidden table ("api-gateway"). */
  name?: string
}

interface ScatterGroup {
  key: string
  label: string
  points: readonly ScatterPoint[]
}

interface ScatterChartProps {
  /** Up to three groups, colored `chart-1` … `chart-3`. */
  groups: readonly ScatterGroup[]
  /** Axis titles, with the unit ("Latency (ms)"). */
  xLabel: string
  yLabel: string
  sizeLabel?: string
  formatX?: (value: number) => string
  formatY?: (value: number) => string
  formatSize?: (value: number) => string
  /** Height in pixels (default 300). */
  height?: number
  className?: string
  /** What the chart shows, for screen readers ("Models: latency against cost"). */
  'aria-label'?: string
}

function ScatterChart({
  groups,
  xLabel,
  yLabel,
  sizeLabel,
  formatX,
  formatY,
  formatSize,
  height = 300,
  className,
  'aria-label': ariaLabel,
}: ScatterChartProps) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.charts
  const fx = formatX ?? formatNumber
  const fy = formatY ?? formatNumber
  const fs = formatSize ?? formatNumber
  const shown = groups.slice(0, 3)
  const config = Object.fromEntries(
    shown.map((g, i) => [g.key, { label: g.label, color: `var(--chart-${i + 1})` }]),
  ) satisfies ChartConfig
  const sized = shown.some((g) => g.points.some((p) => p.size !== undefined))

  return (
    <div data-slot="scatter-chart" className={cn('w-full', className)}>
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      >
        <RechartsScatterChart margin={{ left: 8, right: 12, top: 8, bottom: 16 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v: number) => fx(v)}
            label={{
              value: xLabel,
              position: 'insideBottom',
              offset: -12,
              className: 'fill-muted-foreground text-[12px]',
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) => fy(v)}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 4,
              className: 'fill-muted-foreground text-[12px]',
              style: { textAnchor: 'middle' },
            }}
          />
          {sized && <ZAxis type="number" dataKey="size" range={[40, 600]} name={sizeLabel} />}
          <ChartTooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              const point = payload.at(0)?.payload as ScatterPoint | undefined
              if (!active || !point) return null
              return (
                <div className="grid gap-1 rounded-md border border-border bg-popover px-2.5 py-2 text-[12px] text-fg-secondary shadow-lg">
                  {point.name && <div className="font-medium text-foreground">{point.name}</div>}
                  <Row label={xLabel} value={fx(point.x)} />
                  <Row label={yLabel} value={fy(point.y)} />
                  {point.size !== undefined && (
                    <Row label={sizeLabel ?? ''} value={fs(point.size)} />
                  )}
                </div>
              )
            }}
          />
          {shown.map((g) => (
            <Scatter
              key={g.key}
              name={g.label}
              dataKey={g.key}
              data={[...g.points]}
              fill={`var(--color-${g.key})`}
              fillOpacity={sized ? 0.6 : 0.85}
            />
          ))}
          {shown.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsScatterChart>
      </ChartContainer>
      {/* The values for screen readers. A table ignores sr-only’s 1px width, so a div clips it. */}
      <div className="sr-only">
        <table>
          {ariaLabel && <caption>{ariaLabel}</caption>}
          <thead>
            <tr>
              <th scope="col">{t.item}</th>
              <th scope="col">{xLabel}</th>
              <th scope="col">{yLabel}</th>
              {sized && <th scope="col">{sizeLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {shown.flatMap((g) =>
              g.points.map((p, i) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key -- points may share a name; the position in the group is stable
                <tr key={`${g.key}-${i}`}>
                  <th scope="row">
                    {[shown.length > 1 ? g.label : null, p.name ?? String(i + 1)]
                      .filter(Boolean)
                      .join(', ')}
                  </th>
                  <td>{fx(p.x)}</td>
                  <td>{fy(p.y)}</td>
                  {sized && <td>{p.size === undefined ? '' : fs(p.size)}</td>}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

export { ScatterChart, type ScatterChartProps, type ScatterGroup, type ScatterPoint }
