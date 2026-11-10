# @coreloom/ai-runs

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-runs.tsx

```ts
function RunList
RunList.runs: RunSummary[]
RunList.href: (id: string) => string
RunList.className?: string | undefined
type RunStatus = 'running' | 'failed' | 'queued' | 'succeeded' | 'cancelled'
function RunStatusBadge
RunStatusBadge.status: RunStatus
type RunSummary = {}
RunSummary.id: string
RunSummary.agent: string
RunSummary.status: RunStatus
RunSummary.trigger: string
RunSummary.startedAt: string | Date
RunSummary.durationMs?: number | undefined
RunSummary.tokens?: number | undefined
RunSummary.cost?: number | undefined
function RunTrace
RunTrace.run: {}
RunTrace.run.status: RunStatus
RunTrace.run.durationMs: number
RunTrace.run.tokens?: {}
RunTrace.run.tokens.input: number
RunTrace.run.tokens.output: number
RunTrace.run.cost?: number | undefined
RunTrace.run.model?: string | undefined
RunTrace.spans: TraceSpan[]
RunTrace.defaultSelectedId?: string | undefined
RunTrace.className?: string | undefined
type SpanKind = 'agent' | 'tool' | 'llm' | 'retrieval'
type TraceSpan = {}
TraceSpan.id: string
TraceSpan.parentId?: string | undefined
TraceSpan.kind: SpanKind
TraceSpan.name: string
TraceSpan.agentId?: string | undefined
TraceSpan.startMs: number
TraceSpan.durationMs: number
TraceSpan.status: 'error' | 'running' | 'ok'
TraceSpan.model?: string | undefined
TraceSpan.tokens?: {}
TraceSpan.tokens.input: number
TraceSpan.tokens.output: number
TraceSpan.cost?: number | undefined
TraceSpan.input?: unknown
TraceSpan.output?: unknown
TraceSpan.error?: string | undefined
```
