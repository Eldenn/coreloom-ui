# @coreloom/agent-graph

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/agent-graph.tsx

```ts
type AgentActivity = 'done' | 'failed' | 'working' | 'waiting'
function agentAvatarState(node: AgentGraphNode, activity?: AgentActivity) => AgentAvatarState
type AgentEdgeKind = 'delegates' | 'handoff' | 'uses'
function AgentGraph
AgentGraph.agents: AgentGraphNode[]
AgentGraph.edges: AgentGraphEdge[]
AgentGraph.teams?: AgentGraphTeam[] | undefined
AgentGraph.selectedId?: string | null | undefined
AgentGraph.defaultSelectedId?: string | undefined
AgentGraph.onSelectedChange?: ((id: string | null) => void) | undefined
AgentGraph.activity?: Partial<Record<string, AgentActivity>> | undefined
AgentGraph.activePath?: string[] | undefined
AgentGraph.view?: 'list' | 'graph' | undefined
AgentGraph.defaultView?: 'list' | 'graph' | undefined
AgentGraph.onViewChange?: ((view: 'graph' | 'list') => void) | undefined
AgentGraph.maxHeight?: number | undefined
AgentGraph.legend?: boolean | undefined
AgentGraph.avatars?: AgentAvatarVariant | undefined
AgentGraph.label?: string | undefined
AgentGraph.className?: string | undefined
type AgentGraphEdge = {}
AgentGraphEdge.from: string
AgentGraphEdge.to: string
AgentGraphEdge.kind: AgentEdgeKind
AgentGraphEdge.label?: string | undefined
type AgentGraphLayout = {}
AgentGraphLayout.nodes: PlacedNode[]
AgentGraphLayout.edges: PlacedEdge[]
AgentGraphLayout.frames: PlacedFrame[]
AgentGraphLayout.width: number
AgentGraphLayout.height: number
function AgentGraphLegend
AgentGraphLegend.className?: string | undefined
type AgentGraphNode = {}
AgentGraphNode.id: string
AgentGraphNode.name: string
AgentGraphNode.kind?: AgentNodeKind | undefined
AgentGraphNode.role?: string | undefined
AgentGraphNode.team?: string | undefined
AgentGraphNode.model?: string | undefined
AgentGraphNode.status?: 'active' | 'paused' | 'draft' | undefined
type AgentGraphTeam = {}
AgentGraphTeam.id: string
AgentGraphTeam.name: string
type AgentNodeKind = 'agent' | 'human' | 'tool' | 'knowledge'
type AgentRelations = {}
AgentRelations.reportsTo: string[]
AgentRelations.delegatesTo: string[]
AgentRelations.handsOffTo: string[]
AgentRelations.takesOverFrom: string[]
AgentRelations.uses: string[]
AgentRelations.usedBy: string[]
function agentRelations(id: string, edges: AgentGraphEdge[]) => { reportsTo: string[]; delegatesTo: string[]; handsOffTo: string[]; takesOverFrom: string[]; uses: string[]; usedBy: string[]; }
function layoutAgentGraph(inputNodes: AgentGraphNode[], inputEdges: AgentGraphEdge[], inputTeams?: AgentGraphTeam[]) => AgentGraphLayout
```
