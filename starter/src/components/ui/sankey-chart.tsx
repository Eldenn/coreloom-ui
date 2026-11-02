'use client'

// Coreloom UI — SankeyChart. Where a quantity flows from step to step: traffic from sources to
// pages to sign-ups, tokens from agents to tools, budget from teams to services. Nodes in columns,
// bands as wide as the flow. Nodes take the chart colors by column; each band takes its source's
// color. On Recharts through ChartContainer; every flow is also in a visually hidden list.
//
//   <SankeyChart nodes={[{ id: 'ads', label: 'Ads' }, { id: 'signup', label: 'Sign-up' }]}
//     links={[{ source: 'ads', target: 'signup', value: 120 }]} />
import { Layer, Rectangle, Sankey } from 'recharts'

import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface SankeyChartNode {
  id: string
  label: string
}

interface SankeyChartLink {
  /** `id` of the node the flow leaves. */
  source: string
  /** `id` of the node the flow reaches. */
  target: string
  value: number
}

interface SankeyChartProps {
  nodes: readonly SankeyChartNode[]
  /** Flows between nodes. Links to unknown ids, loops and values ≤ 0 are left out. */
  links: readonly SankeyChartLink[]
  /** Height in pixels (default 320). */
  height?: number
  /** Formats flows in the tooltip and the hidden list (default: the locale's number format). */
  formatValue?: (value: number) => string
  className?: string
  /** What flows where, for screen readers ("Visitors from source to plan"). */
  'aria-label'?: string
}

interface DrawnNode {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name: string; depth?: number; value?: number; sourceLinks?: unknown[] }
}

interface DrawnLink {
  sourceX: number
  targetX: number
  sourceY: number
  targetY: number
  sourceControlX: number
  targetControlX: number
  linkWidth: number
  index: number
  payload: { source: { depth?: number; name: string }; target: { name: string }; value: number }
}

const columnColor = (depth = 0) => `var(--chart-${(Math.min(depth, 4) % 5) + 1})`

/** The links Recharts can draw: known nodes, positive values, no self-loops; nodes as indexes. */
function sankeyData(nodes: readonly SankeyChartNode[], links: readonly SankeyChartLink[]) {
  const index = new Map(nodes.map((n, i) => [n.id, i]))
  const valid = links.filter(
    (l) =>
      index.has(l.source) &&
      index.has(l.target) &&
      l.source !== l.target &&
      Number.isFinite(l.value) &&
      l.value > 0,
  )
  return {
    nodes: nodes.map((n) => ({ name: n.label })),
    links: valid.map((l) => ({
      source: index.get(l.source) ?? 0,
      target: index.get(l.target) ?? 0,
      value: l.value,
    })),
    valid,
  }
}

function SankeyChart({
  nodes,
  links,
  height = 320,
  formatValue,
  className,
  'aria-label': ariaLabel,
}: SankeyChartProps) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.charts
  const fmt = formatValue ?? formatNumber
  const data = sankeyData(nodes, links)
  const labelOf = new Map(nodes.map((n) => [n.id, n.label]))
  const lastDepth = Math.max(0, ...longestPaths(data.nodes.length, data.links))

  function node({ x, y, width, height: h, payload }: DrawnNode) {
    const last = (payload.depth ?? 0) === lastDepth
    return (
      <Layer>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={h}
          radius={2}
          fill={columnColor(payload.depth)}
        />
        <text
          x={last ? x - 6 : x + width + 6}
          y={y + h / 2}
          dy="0.35em"
          textAnchor={last ? 'end' : 'start'}
          className="fill-fg-secondary text-[12px]"
        >
          {payload.name}
        </text>
      </Layer>
    )
  }

  function link({
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    payload,
  }: DrawnLink) {
    return (
      <path
        d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={columnColor(payload.source.depth)}
        strokeOpacity={0.28}
        strokeWidth={Math.max(1, linkWidth)}
      />
    )
  }

  if (data.links.length === 0)
    return <p className={cn('text-[13px] text-muted-foreground', className)}>{t.empty}</p>

  return (
    <div data-slot="sankey-chart" className={cn('w-full', className)}>
      <ChartContainer
        config={{}}
        className="aspect-auto w-full"
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
      >
        <Sankey
          data={{ nodes: data.nodes, links: data.links }}
          nodeWidth={10}
          nodePadding={18}
          linkCurvature={0.5}
          margin={{ top: 8, bottom: 8, left: 4, right: 4 }}
          node={(props) => node(props)}
          link={(props) => link(props)}
        >
          <ChartTooltip
            content={({ active, payload }) => {
              const item = payload.at(0)?.payload as
                | {
                    payload?: {
                      source?: { name: string }
                      target?: { name: string }
                      value?: number
                      name?: string
                    }
                  }
                | undefined
              const p = item?.payload
              if (!active || !p) return null
              return (
                <div className="grid gap-1 rounded-md border border-border bg-popover px-2.5 py-2 text-[12px] text-fg-secondary shadow-lg">
                  <div className="font-medium text-foreground">
                    {p.source && p.target ? `${p.source.name} → ${p.target.name}` : p.name}
                  </div>
                  {p.value !== undefined && (
                    <div className="font-mono text-foreground tabular-nums">{fmt(p.value)}</div>
                  )}
                </div>
              )
            }}
          />
        </Sankey>
      </ChartContainer>
      <ul className="sr-only" aria-label={ariaLabel}>
        {data.valid.map((l) => (
          <li key={`${l.source}-${l.target}`}>
            {t.flow(
              labelOf.get(l.source) ?? l.source,
              labelOf.get(l.target) ?? l.target,
              fmt(l.value),
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Each node's column: the longest path to it from a node nothing flows into (cycles are cut). */
function longestPaths(count: number, links: readonly { source: number; target: number }[]) {
  const depth = new Array<number>(count).fill(0)
  // Bellman-Ford style relaxation, bounded by the node count so a cycle can't loop forever.
  for (let pass = 0; pass < count; pass++) {
    let changed = false
    for (const l of links) {
      if (depth[l.target] < depth[l.source] + 1 && depth[l.source] + 1 < count) {
        depth[l.target] = depth[l.source] + 1
        changed = true
      }
    }
    if (!changed) break
  }
  return depth
}

export {
  longestPaths,
  SankeyChart,
  type SankeyChartLink,
  type SankeyChartNode,
  type SankeyChartProps,
  sankeyData,
}
