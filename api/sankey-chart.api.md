# @coreloom/sankey-chart

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/sankey-chart.tsx

```ts
function longestPaths(count: number, links: readonly { source: number; target: number; }[]) => number[]
function SankeyChart
SankeyChart.nodes: readonly SankeyChartNode[]
SankeyChart.links: readonly SankeyChartLink[]
SankeyChart.height?: number | undefined
SankeyChart.formatValue?: ((value: number) => string) | undefined
SankeyChart.className?: string | undefined
SankeyChart.aria-label?: string | undefined
type SankeyChartLink = {}
SankeyChartLink.source: string
SankeyChartLink.target: string
SankeyChartLink.value: number
type SankeyChartNode = {}
SankeyChartNode.id: string
SankeyChartNode.label: string
type SankeyChartProps = {}
SankeyChartProps.nodes: readonly SankeyChartNode[]
SankeyChartProps.links: readonly SankeyChartLink[]
SankeyChartProps.height?: number | undefined
SankeyChartProps.formatValue?: ((value: number) => string) | undefined
SankeyChartProps.className?: string | undefined
SankeyChartProps.aria-label?: string | undefined
function sankeyData(nodes: readonly SankeyChartNode[], links: readonly SankeyChartLink[]) => { nodes: { name: string; }[]; links: { source: number; target: number; value: number; }[]; valid: SankeyChartLink[]; }
```
