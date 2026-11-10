# @coreloom/ai-agents

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-agents.tsx

```ts
function AgentEditor
AgentEditor.defaultValues: AgentValues
AgentEditor.models: AiModel[]
AgentEditor.tools: AgentTool[]
AgentEditor.knowledgeBases?: { id: string; name: string; }[] | undefined
AgentEditor.onSubmit: (values: AgentValues) => unknown
AgentEditor.className?: string | undefined
function AgentList
AgentList.agents: AgentSummary[]
AgentList.href: (id: string) => string
AgentList.onNew?: (() => void) | undefined
AgentList.now?: Date | undefined
AgentList.className?: string | undefined
type AgentStatus = 'active' | 'paused' | 'draft'
function AgentStatusBadge
AgentStatusBadge.status: AgentStatus
AgentStatusBadge.className?: string | undefined
type AgentSummary = {}
AgentSummary.id: string
AgentSummary.name: string
AgentSummary.description?: string | undefined
AgentSummary.status: AgentStatus
AgentSummary.model: string
AgentSummary.toolCount: number
AgentSummary.lastRunAt?: string | Date | undefined
AgentSummary.runsThisWeek?: number | undefined
type AgentTool = {}
AgentTool.id: string
AgentTool.name: string
AgentTool.description?: string | undefined
AgentTool.sensitive?: boolean | undefined
type AgentValues = {}
AgentValues.name: string
AgentValues.description: string
AgentValues.instructions: string
AgentValues.model: string
AgentValues.temperature: number
AgentValues.maxSteps: number
AgentValues.tools: string[]
AgentValues.askFirst: string[]
AgentValues.knowledge: string[]
function promptVariables(text: string) => string[]
```
