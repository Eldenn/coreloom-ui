import { describe, expect, it } from 'vitest'

import { sortBarList } from '@/components/ui/bar-list'
import { donutParts } from '@/components/ui/donut-chart'
import { funnelRates } from '@/components/ui/funnel-chart'
import { gaugeStatus } from '@/components/ui/gauge'
import { calendarWeeks, heatmapLevel, parseDay } from '@/components/ui/heatmap'
import { sparklinePoints, sparklineSummary } from '@/components/ui/sparkline'

describe('sparkline', () => {
  it('summarises first, last, low and high, skipping non-finite values', () => {
    expect(sparklineSummary([3, Number.NaN, 9, 1, Infinity, 4])).toEqual({
      first: 3,
      last: 4,
      low: 1,
      high: 9,
    })
    expect(sparklineSummary([])).toBeNull()
    expect(sparklineSummary([Number.NaN])).toBeNull()
  })

  it('spreads points over a 100 × 100 box, highest at the top', () => {
    expect(sparklinePoints([0, 10, 5])).toEqual([
      { x: 0, y: 100 },
      { x: 50, y: 0 },
      { x: 100, y: 50 },
    ])
  })

  it('draws a flat or single-value series as a line through the middle', () => {
    expect(sparklinePoints([7, 7, 7]).map((p) => p.y)).toEqual([50, 50, 50])
    expect(sparklinePoints([42])).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    ])
    expect(sparklinePoints([])).toEqual([])
  })

  it('clamps values outside a fixed min and max', () => {
    expect(sparklinePoints([-50, 50, 150], 0, 100).map((p) => p.y)).toEqual([100, 50, 0])
  })
})

describe('donutParts', () => {
  const data = [
    { key: 'a', label: 'A', value: 10 },
    { key: 'b', label: 'B', value: 40 },
    { key: 'c', label: 'C', value: 20 },
    { key: 'd', label: 'D', value: 20 },
    { key: 'e', label: 'E', value: 10 },
  ]

  it('sorts largest first, colors in palette order and folds the rest into Other', () => {
    const { parts, total } = donutParts(data, 3, 'Other')
    expect(total).toBe(100)
    expect(parts.map((p) => p.key)).toEqual(['b', 'c', 'd', '__other'])
    expect(parts.map((p) => p.color)).toEqual([
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--fg-muted)',
    ])
    expect(parts[3]).toMatchObject({ label: 'Other', value: 20, share: 0.2 })
  })

  it('shows a single leftover part by name instead of folding it', () => {
    const { parts } = donutParts(data.slice(0, 4), 3, 'Other')
    expect(parts.map((p) => p.key)).toEqual(['b', 'c', 'd', 'a'])
    expect(parts[3].color).toBe('var(--chart-4)')
  })

  it('never gives more than five colors, and at least one', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ key: `k${i}`, label: i, value: 9 - i }))
    expect(donutParts(many, 12, 'Other').parts).toHaveLength(6)
    expect(donutParts(many, 0, 'Other').parts.map((p) => p.key)).toEqual(['k0', '__other'])
  })

  it('drops zero, negative and non-finite values', () => {
    const { parts, total } = donutParts(
      [
        { key: 'a', label: 'A', value: 0 },
        { key: 'b', label: 'B', value: -5 },
        { key: 'c', label: 'C', value: Number.NaN },
        { key: 'd', label: 'D', value: 3 },
      ],
      3,
      'Other',
    )
    expect(total).toBe(3)
    expect(parts).toEqual([{ key: 'd', label: 'D', value: 3, share: 1, color: 'var(--chart-1)' }])
    expect(donutParts([], 3, 'Other')).toEqual({ parts: [], total: 0 })
  })
})

describe('sortBarList', () => {
  const rows = [
    { label: 'b', value: 2 },
    { label: 'c', value: 3 },
    { label: 'a', value: 1 },
  ]
  it('sorts descending, ascending or keeps the order, without mutating the input', () => {
    expect(sortBarList(rows, 'desc').map((r) => r.label)).toEqual(['c', 'b', 'a'])
    expect(sortBarList(rows, 'asc').map((r) => r.label)).toEqual(['a', 'b', 'c'])
    expect(sortBarList(rows, 'none').map((r) => r.label)).toEqual(['b', 'c', 'a'])
    expect(rows.map((r) => r.label)).toEqual(['b', 'c', 'a'])
  })
})

describe('gaugeStatus', () => {
  it('is ok without thresholds', () => {
    expect(gaugeStatus(100, {})).toBe('ok')
  })
  it('turns warning then critical as the value rises', () => {
    const t = { warning: 80, critical: 95 }
    expect(gaugeStatus(79.9, t)).toBe('ok')
    expect(gaugeStatus(80, t)).toBe('warning')
    expect(gaugeStatus(95, t)).toBe('critical')
  })
  it('flips the zones when higher is better', () => {
    const t = { warning: 99.5, critical: 99, higherIsBetter: true }
    expect(gaugeStatus(99.9, t)).toBe('ok')
    expect(gaugeStatus(99.5, t)).toBe('warning')
    expect(gaugeStatus(98.2, t)).toBe('critical')
  })
})

describe('heatmapLevel', () => {
  it('is 0 for nothing, then quarters of max', () => {
    expect(heatmapLevel(null, 10)).toBe(0)
    expect(heatmapLevel(undefined, 10)).toBe(0)
    expect(heatmapLevel(0, 10)).toBe(0)
    expect(heatmapLevel(-3, 10)).toBe(0)
    expect(heatmapLevel(Number.NaN, 10)).toBe(0)
    expect(heatmapLevel(0.1, 10)).toBe(1)
    expect(heatmapLevel(2.5, 10)).toBe(1)
    expect(heatmapLevel(2.6, 10)).toBe(2)
    expect(heatmapLevel(10, 10)).toBe(4)
    expect(heatmapLevel(99, 10)).toBe(4)
    expect(heatmapLevel(5, 0)).toBe(0)
  })
})

describe('calendar', () => {
  it('parses YYYY-MM-DD as midnight UTC and rejects anything else', () => {
    expect(parseDay('2026-10-14')).toBe(Date.UTC(2026, 9, 14))
    expect(parseDay('2026-10-14T00:00:00Z')).toBeNaN()
    expect(parseDay('14/10/2026')).toBeNaN()
    expect(parseDay('')).toBeNaN()
  })

  it('ends with the week of `to`, Monday first', () => {
    const to = parseDay('2026-10-14') // a Wednesday
    const weeks = calendarWeeks(to, 2)
    expect(weeks).toHaveLength(2)
    expect(weeks[1][0]).toBe(parseDay('2026-10-12'))
    expect(weeks[1][2]).toBe(to)
    expect(weeks[1][6]).toBe(parseDay('2026-10-18'))
    expect(weeks[0][0]).toBe(parseDay('2026-10-05'))
    expect(calendarWeeks(to, 0)).toHaveLength(1)
  })
})

describe('funnelRates', () => {
  it('gives each step its share of the start and of the step before', () => {
    expect(funnelRates([{ value: 200 }, { value: 50 }, { value: 10 }])).toEqual([
      { ofStart: 1, ofPrevious: 1 },
      { ofStart: 0.25, ofPrevious: 0.25 },
      { ofStart: 0.05, ofPrevious: 0.2 },
    ])
  })
  it('never divides by zero', () => {
    expect(funnelRates([{ value: 0 }, { value: 0 }])).toEqual([
      { ofStart: 0, ofPrevious: 1 },
      { ofStart: 0, ofPrevious: 0 },
    ])
    expect(funnelRates([])).toEqual([])
  })
})
