# @coreloom/ai-agent-replay

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-agent-replay.tsx

```ts
type AgentRunMetrics = {}
AgentRunMetrics.agentId: string
AgentRunMetrics.turns: number
AgentRunMetrics.durationMs: number
AgentRunMetrics.tokens: number
AgentRunMetrics.cost: number
AgentRunMetrics.toolCalls: number
AgentRunMetrics.errors: number
function agentRunMetrics(spans: readonly ReplaySpan[], agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[]) => AgentRunMetrics[]
function AgentRunReplay
AgentRunReplay.agents: AgentGraphNode[]
AgentRunReplay.edges: AgentGraphEdge[]
AgentRunReplay.teams?: AgentGraphTeam[] | undefined
AgentRunReplay.spans: ReplaySpan[]
AgentRunReplay.defaultTime?: number | undefined
AgentRunReplay.avatars?: import("./ui/agent-avatar").AgentAvatarVariant | undefined
AgentRunReplay.className?: string | undefined
function replayDuration(spans: readonly ReplaySpan[]) => number
type ReplaySpan = {}
ReplaySpan.durationMs: number
ReplaySpan.tokens?: {}
ReplaySpan.tokens.input: number
ReplaySpan.tokens.output: number
ReplaySpan.cost?: number | undefined
ReplaySpan.id: string
ReplaySpan.parentId?: string | undefined
ReplaySpan.kind: string
ReplaySpan.name: string
ReplaySpan.agentId?: string | undefined
ReplaySpan.startMs: number
ReplaySpan.status: 'error' | 'running' | 'ok'
type ReplayStep = {}
ReplayStep.n: number
ReplayStep.agentId: string
ReplayStep.startMs: number
function replaySteps(spans: readonly ReplaySpan[], agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[]) => ReplayStep[]
function spansAt<T extends ReplaySpan>(spans: readonly T[], ms: number) => T[]
```
