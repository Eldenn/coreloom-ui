'use client'

// Coreloom UI — Gauge. One value against its range, as an open ring with the number in the middle:
// a quota, an error budget, an SLO, a score. Optional thresholds turn it amber, then red, and say so
// in words. Exposed as a `meter` with its value, range and status.
//
//   <Gauge value={72} label="Storage used" warning={80} critical={95} unit="%" />
//   <Gauge value={99.2} min={95} max={100} warning={99.5} critical={99} higherIsBetter label="Uptime" />
import * as React from 'react'

import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type GaugeStatus = 'ok' | 'warning' | 'critical'

interface GaugeProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  value: number
  /** Bounds of the range (default 0 and 100). */
  min?: number
  max?: number
  /** Where the warning and critical zones start. Leave both out for a plain gauge in `chart-1`. */
  warning?: number
  critical?: number
  /** Set it when a high value is good news (uptime, a score): the zones then start below the thresholds. */
  higherIsBetter?: boolean
  /** What the value is ("Storage used"). Shown under the number and used as the meter's name. */
  label?: React.ReactNode
  /** Written after the number in the middle ("%", "GB"). */
  unit?: string
  /** Formats the number (default: the locale's number format). */
  formatValue?: (value: number) => string
  /** Diameter in pixels (default 160). */
  size?: number
}

/** The zone a value falls in. Without thresholds every value is `ok`. */
function gaugeStatus(
  value: number,
  {
    warning,
    critical,
    higherIsBetter = false,
  }: Pick<GaugeProps, 'warning' | 'critical' | 'higherIsBetter'>,
): GaugeStatus {
  const reached = (threshold?: number) =>
    threshold !== undefined && (higherIsBetter ? value <= threshold : value >= threshold)
  if (reached(critical)) return 'critical'
  if (reached(warning)) return 'warning'
  return 'ok'
}

const TONE: Record<GaugeStatus, { stroke: string; text: string }> = {
  ok: { stroke: 'var(--chart-1)', text: 'text-muted-foreground' },
  warning: { stroke: 'var(--warning)', text: 'text-warning' },
  critical: { stroke: 'var(--danger)', text: 'text-destructive' },
}

// The ring opens at the bottom: it runs 240° from lower left to lower right.
const SWEEP = 240
const START = 90 + (360 - SWEEP) / 2

function arcPath(from: number, to: number, r: number) {
  const point = (t: number) => {
    const angle = ((START + t * SWEEP) * Math.PI) / 180
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
  }
  const large = (to - from) * SWEEP > 180 ? 1 : 0
  return `M${point(from)} A${r},${r} 0 ${large} 1 ${point(to)}`
}

function Gauge({
  value,
  min = 0,
  max = 100,
  warning,
  critical,
  higherIsBetter = false,
  label,
  unit,
  formatValue,
  size = 160,
  className,
  ...props
}: GaugeProps) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.charts.gauge
  const fmt = formatValue ?? formatNumber
  const labelId = React.useId()
  const safe = Number.isFinite(value) ? value : min
  const span = max - min || 1
  const ratio = Math.min(1, Math.max(0, (safe - min) / span))
  const hasThresholds = warning !== undefined || critical !== undefined
  const status = gaugeStatus(safe, { warning, critical, higherIsBetter })
  const tone = TONE[status]
  const r = 42
  // A narrow no-break space keeps the unit on the number's line.
  const shown = unit ? `${fmt(safe)}\u202f${unit}` : fmt(safe)
  const ticks = [warning, critical]
    .filter((v): v is number => v !== undefined && v > min && v < max)
    .map((v) => (v - min) / span)

  return (
    <div
      data-slot="gauge"
      role="meter"
      aria-valuenow={safe}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={
        hasThresholds ? t.valueTextStatus(shown, fmt(max), t[status]) : t.valueText(shown, fmt(max))
      }
      aria-labelledby={label != null ? labelId : undefined}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size * 0.86 }}
      {...props}
    >
      <svg aria-hidden viewBox="0 0 100 86" className="absolute inset-0 size-full overflow-visible">
        <path
          d={arcPath(0, 1, r)}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          className="stroke-inset"
        />
        {ratio > 0 && (
          <path
            d={arcPath(0, Math.max(ratio, 0.002), r)}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={9}
            strokeLinecap="round"
          />
        )}
        {ticks.map((tick) => {
          const angle = ((START + tick * SWEEP) * Math.PI) / 180
          return (
            <line
              key={tick}
              x1={50 + (r - 7.5) * Math.cos(angle)}
              y1={50 + (r - 7.5) * Math.sin(angle)}
              x2={50 + (r + 7.5) * Math.cos(angle)}
              y2={50 + (r + 7.5) * Math.sin(angle)}
              strokeWidth={1.5}
              className="stroke-border-strong"
            />
          )
        })}
      </svg>
      <div className="relative flex flex-col items-center pt-1 text-center">
        <span className="font-display text-[26px] leading-tight tracking-[-0.02em] text-foreground tabular-nums">
          {shown}
        </span>
        {label != null && (
          <span id={labelId} className="max-w-[9rem] truncate text-[12px] text-muted-foreground">
            {label}
          </span>
        )}
        {hasThresholds && (
          <span
            className={cn(
              'font-mono text-[11px] font-semibold tracking-[0.08em] uppercase',
              tone.text,
            )}
          >
            {t[status]}
          </span>
        )}
      </div>
    </div>
  )
}

export { Gauge, type GaugeProps, type GaugeStatus, gaugeStatus }
