'use client'

// Coreloom UI — RadarChart. Two or three things compared on the same handful of measures: models on
// evals, plans on features, a team's skills. One axis per measure around a circle, one outline per
// series. On Recharts through ChartContainer; the values are also in a visually hidden table.
//
//   <RadarChart data={[{ metric: 'Coding', sonnet: 92, haiku: 78 }, …]} angleKey="metric"
//     series={[{ key: 'sonnet', label: 'Sonnet' }, { key: 'haiku', label: 'Haiku' }]} />
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
} from 'recharts'

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

interface RadarSeries {
  key: string
  label: string
}

interface RadarChartProps<T extends object> {
  /** One row per measure (axis), with a value per series. */
  data: readonly T[]
  /** The field naming the measure ("Coding", "Speed"). */
  angleKey: keyof T & string
  /** Up to three series, colored `chart-1` … `chart-3`. More outlines can't be told apart. */
  series: readonly RadarSeries[]
  /** Upper end of the scale (default: the largest value). */
  max?: number
  /** Height in pixels (default 300). */
  height?: number
  /** Formats values in the tooltip and the hidden table (default: the locale's number format). */
  formatValue?: (value: number) => string
  className?: string
  /** What the chart compares, for screen readers ("Models on six evals"). */
  'aria-label'?: string
}

function RadarChart<T extends object>({
  data,
  angleKey,
  series,
  max,
  height = 300,
  formatValue,
  className,
  'aria-label': ariaLabel,
}: RadarChartProps<T>) {
  const { formatNumber } = useCoreloomI18n()
  const fmt = formatValue ?? formatNumber
  const shown = series.slice(0, 3)
  const config = Object.fromEntries(
    shown.map((s, i) => [s.key, { label: s.label, color: `var(--chart-${i + 1})` }]),
  ) satisfies ChartConfig
  const labels = new Map(shown.map((s) => [s.key, s.label]))
  const value = (row: T, key: string) => Number((row as Record<string, unknown>)[key])

  return (
    <div data-slot="radar-chart" className={cn('w-full', className)}>
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      >
        <RechartsRadarChart data={[...data]} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- needed in apps where the key isn't narrowed to string
            dataKey={angleKey as string}
            tick={{ className: 'fill-muted-foreground', fontSize: 12 }}
          />
          <PolarRadiusAxis domain={[0, max ?? 'auto']} tick={false} axisLine={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(v, name, item) => (
                  <div className="flex w-full items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-[2px]"
                      style={{ background: `var(--color-${String(item.dataKey)})` }}
                    />
                    <span className="flex-1 text-muted-foreground">
                      {labels.get(String(item.dataKey)) ?? name}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {fmt(Number(v))}
                    </span>
                  </div>
                )}
              />
            }
          />
          {shown.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              fill={`var(--color-${s.key})`}
              fillOpacity={0.16}
              strokeWidth={2}
              dot={{ r: 2.5, fillOpacity: 1 }}
            />
          ))}
          {shown.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        </RechartsRadarChart>
      </ChartContainer>
      {/* The values for screen readers. A table ignores sr-only’s 1px width, so a div clips it. */}
      <div className="sr-only">
        <table>
          {ariaLabel && <caption>{ariaLabel}</caption>}
          <thead>
            <tr>
              <td />
              {shown.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const name = String((row as Record<string, unknown>)[angleKey])
              return (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  {shown.map((s) => (
                    <td key={s.key}>{fmt(value(row, s.key))}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { RadarChart, type RadarChartProps, type RadarSeries }
