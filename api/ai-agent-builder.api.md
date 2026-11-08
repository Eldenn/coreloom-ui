# @coreloom/ai-agent-builder

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-agent-builder.tsx

```ts
function AgentBuilder
AgentBuilder.models?: AiModel[] | undefined
AgentBuilder.tools?: AgentBuilderTool[] | undefined
AgentBuilder.value?: Workflow | undefined
AgentBuilder.defaultValue?: Workflow | undefined
AgentBuilder.onValueChange?: ((workflow: Workflow) => void) | undefined
AgentBuilder.state?: StateField[] | undefined
AgentBuilder.defaultState?: StateField[] | undefined
AgentBuilder.onStateChange?: ((state: StateField[]) => void) | undefined
AgentBuilder.name?: string | undefined
AgentBuilder.defaultName?: string | undefined
AgentBuilder.onNameChange?: ((name: string) => void) | undefined
AgentBuilder.config?: AgentGraphConfig | undefined
AgentBuilder.defaultConfig?: AgentGraphConfig | undefined
AgentBuilder.onConfigChange?: ((config: AgentGraphConfig) => void) | undefined
AgentBuilder.onSave?: ((graph: { workflow: Workflow; json: LangGraphJSON; config: LangGraphConfig; name: string; }) => Promise<unknown> | undefined) | undefined
AgentBuilder.onRun?: ((graph: { workflow: Workflow; json: LangGraphJSON; config: LangGraphConfig; }) => void) | undefined
AgentBuilder.running?: boolean | undefined
AgentBuilder.runs?: Partial<Record<string, NodeRun>> | undefined
AgentBuilder.onRunNode?: ((request: import("@/components/ui/node-editor").NodeTestRequest) => Promise<import("@/components/ui/node-editor").NodeTestResult>) | undefined
AgentBuilder.interrupt?: AgentInterrupt | null | undefined
AgentBuilder.onResume?: ((resume: AgentResume) => void) | undefined
AgentBuilder.readOnly?: boolean | undefined
AgentBuilder.defaultSelectedId?: string | undefined
AgentBuilder.height?: number | undefined
AgentBuilder.className?: string | undefined
type AgentBuilderTool = {}
AgentBuilderTool.id: string
AgentBuilderTool.name: string
AgentBuilderTool.description?: string | undefined
AgentBuilderTool.sensitive?: boolean | undefined
AgentBuilderTool.parameters?: ToolParameters | undefined
type AgentDecision = { type: 'approve'; } | { type: 'edit'; edited_action: { name: string; args: Record<string, unknown>; }; } | { type: 'reject'; message?: string; } | { type: 'respond'; message: string; }
type AgentDecisionType = 'approve' | 'edit' | 'reject' | 'respond'
type AgentGraphConfig = {}
AgentGraphConfig.recursionLimit?: number | undefined
type AgentInterrupt = {}
AgentInterrupt.nodeId: string
AgentInterrupt.question?: string | undefined
AgentInterrupt.actions?: readonly AgentInterruptAction[] | undefined
AgentInterrupt.decisions?: readonly AgentDecisionType[] | undefined
type AgentInterruptAction = {}
AgentInterruptAction.name: string
AgentInterruptAction.args: Record<string, unknown>
AgentInterruptAction.description?: string | undefined
AgentInterruptAction.decisions?: readonly AgentDecisionType[] | undefined
type AgentNodeType = 'function' | 'end' | 'agent' | 'human' | 'tool' | 'start' | 'router' | 'subgraph'
type AgentPause = 'none' | 'before' | 'after'
type AgentResume = {}
AgentResume.nodeId: string
AgentResume.decisions: AgentDecision[]
type AgentTeamGraph = {}
AgentTeamGraph.agents: (AgentGraphNode & { description?: string; })[]
AgentTeamGraph.edges: AgentGraphEdge[]
AgentTeamGraph.teams?: AgentGraphTeam[] | undefined
function agentTeamToWorkflow({ agents, edges, teams }: AgentTeamGraph) => Workflow
function emptyAgentGraph() => Workflow
function fromLangGraphJSON(input: unknown) => { workflow: Workflow; state: StateField[]; config: AgentGraphConfig; } | null
type LangGraphConfig = {}
LangGraphConfig.interrupt_before: string[]
LangGraphConfig.interrupt_after: string[]
LangGraphConfig.recursion_limit?: number | undefined
type LangGraphEdgeJSON = {}
LangGraphEdgeJSON.source: string
LangGraphEdgeJSON.target: string
LangGraphEdgeJSON.data?: unknown
LangGraphEdgeJSON.conditional?: boolean | undefined
type LangGraphJSON = {}
LangGraphJSON.nodes: LangGraphNodeJSON[]
LangGraphJSON.edges: LangGraphEdgeJSON[]
type LangGraphNodeJSON = {}
LangGraphNodeJSON.id: string
LangGraphNodeJSON.type?: string | undefined
LangGraphNodeJSON.data?: unknown
LangGraphNodeJSON.metadata?: Record<string, unknown> | null | undefined
function StateEditor
StateEditor.value: StateField[]
StateEditor.onValueChange: (value: StateField[]) => void
StateEditor.readOnly?: boolean | undefined
type StateField = {}
StateField.name: string
StateField.type: StateFieldType
StateField.reducer: 'replace' | 'append'
type StateFieldType = 'string' | 'number' | 'boolean' | 'object' | 'list' | 'messages'
function toLangGraphConfig(wf: Workflow, config?: AgentGraphConfig) => LangGraphConfig
function toLangGraphJSON(wf: Workflow, state?: readonly StateField[], config?: AgentGraphConfig) => LangGraphJSON
type ToolParameter = {}
ToolParameter.type?: string | undefined
ToolParameter.description?: string | undefined
ToolParameter.enum?: readonly string[] | undefined
type ToolParameters = {}
ToolParameters.type?: 'object' | undefined
ToolParameters.properties?: Record<string, ToolParameter> | undefined
ToolParameters.required?: readonly string[] | undefined
function useAgentBuilderKinds({ models, tools, state, }: { models?: readonly AiModel[]; tools?: readonly AgentBuilderTool[]; state?: readonly StateField[]; }) => NodeKind[]
function workflowToAgentTeam(wf: Workflow, { tools }?: { tools?: readonly AgentBuilderTool[]; }) => Required<AgentTeamGraph>
```
