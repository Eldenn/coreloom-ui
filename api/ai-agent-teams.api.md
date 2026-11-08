# @coreloom/ai-agent-teams

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-agent-teams.tsx

```ts
function agentActivityFromSpans(spans: readonly AgentSpanLike[], agents: readonly Pick<AgentGraphNode, 'id' | 'name'>[]) => { activity: Partial<Record<string, AgentActivity>>; path: string[]; }
function AgentDetails
AgentDetails.agent: AgentTeamMember
AgentDetails.agents: AgentTeamMember[]
AgentDetails.edges: AgentGraphEdge[]
AgentDetails.teams?: AgentGraphTeam[] | undefined
AgentDetails.activity?: AgentActivity | undefined
AgentDetails.href?: ((id: string) => string) | undefined
AgentDetails.runsHref?: ((id: string) => string) | undefined
AgentDetails.onSelect: (id: string) => void
AgentDetails.avatar?: AgentAvatarVariant | undefined
type AgentSpanLike = {}
AgentSpanLike.id: string
AgentSpanLike.parentId?: string | undefined
AgentSpanLike.kind: string
AgentSpanLike.name: string
AgentSpanLike.agentId?: string | undefined
AgentSpanLike.startMs: number
AgentSpanLike.status: 'error' | 'running' | 'ok'
type AgentTeamMember = {}
AgentTeamMember.description?: string | undefined
AgentTeamMember.id: string
AgentTeamMember.name: string
AgentTeamMember.kind?: import("@/components/ui/agent-graph").AgentNodeKind | undefined
AgentTeamMember.role?: string | undefined
AgentTeamMember.team?: string | undefined
AgentTeamMember.model?: string | undefined
AgentTeamMember.status?: 'active' | 'paused' | 'draft' | undefined
function AgentTeams
AgentTeams.agents: AgentTeamMember[]
AgentTeams.edges: AgentGraphEdge[]
AgentTeams.teams?: AgentGraphTeam[] | undefined
AgentTeams.activity?: Partial<Record<string, AgentActivity>> | undefined
AgentTeams.activePath?: string[] | undefined
AgentTeams.defaultSelectedId?: string | undefined
AgentTeams.defaultTeam?: string | undefined
AgentTeams.defaultView?: 'list' | 'graph' | undefined
AgentTeams.href?: ((id: string) => string) | undefined
AgentTeams.runsHref?: ((id: string) => string) | undefined
AgentTeams.onEdit?: ((selectedId: string | null) => void) | undefined
AgentTeams.avatars?: AgentAvatarVariant | undefined
AgentTeams.className?: string | undefined
```
