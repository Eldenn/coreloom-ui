# @coreloom/node-editor

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/node-editor.tsx

```ts
type ExpressionVariable = {}
ExpressionVariable.path: string
ExpressionVariable.sample?: unknown
ExpressionVariable.group?: string | undefined
type NodeCredential = {}
NodeCredential.id: string
NodeCredential.name: string
NodeCredential.type: string
function addNode(wf: Workflow, kind: NodeKind, options?: { position?: { x: number; y: number; }; after?: { nodeId: string; port?: string; }; kinds?: readonly NodeKind[]; }) => { workflow: Workflow; id: string; }
function canConnect(wf: Workflow, c: { source: string; sourcePort?: string; target: string; targetPort?: string; }, kinds?: readonly NodeKind[]) => boolean
function connectNodes(wf: Workflow, c: { source: string; sourcePort?: string; target: string; targetPort?: string; }, kinds?: readonly NodeKind[]) => Workflow
function copyNodes(wf: Workflow, ids: readonly string[]) => WorkflowClipboard
function duplicateNode(wf: Workflow, id: string, kinds?: readonly NodeKind[]) => { workflow: Workflow; id: string; }
function insertNodeOnEdge(wf: Workflow, kind: NodeKind, edgeId: string, kinds?: readonly NodeKind[]) => { workflow: Workflow; id: string; }
function layoutWorkflow(wf: Workflow, heights?: ReadonlyMap<string, number>) => Workflow
function NodeEditor
NodeEditor.kinds: NodeKind[]
NodeEditor.value?: Workflow | undefined
NodeEditor.defaultValue?: Workflow | undefined
NodeEditor.onValueChange?: ((workflow: Workflow) => void) | undefined
NodeEditor.runs?: Partial<Record<string, NodeRun>> | undefined
NodeEditor.selectedId?: string | null | undefined
NodeEditor.defaultSelectedId?: string | null | undefined
NodeEditor.onSelectedChange?: ((id: string | null) => void) | undefined
NodeEditor.readOnly?: boolean | undefined
NodeEditor.inspector?: boolean | undefined
NodeEditor.showIssues?: boolean | undefined
NodeEditor.actions?: React.ReactNode
NodeEditor.minimap?: boolean | undefined
NodeEditor.height?: number | undefined
NodeEditor.label?: string | undefined
NodeEditor.onRunNode?: ((request: NodeTestRequest) => Promise<NodeTestResult>) | undefined
NodeEditor.variables?: ExpressionVariable[] | undefined
NodeEditor.credentials?: NodeCredential[] | undefined
NodeEditor.onCreateCredential?: ((type: string) => Promise<NodeCredential | undefined>) | undefined
NodeEditor.className?: string | undefined
type NodeEditorProps = {}
NodeEditorProps.kinds: NodeKind[]
NodeEditorProps.value?: Workflow | undefined
NodeEditorProps.defaultValue?: Workflow | undefined
NodeEditorProps.onValueChange?: ((workflow: Workflow) => void) | undefined
NodeEditorProps.runs?: Partial<Record<string, NodeRun>> | undefined
NodeEditorProps.selectedId?: string | null | undefined
NodeEditorProps.defaultSelectedId?: string | null | undefined
NodeEditorProps.onSelectedChange?: ((id: string | null) => void) | undefined
NodeEditorProps.readOnly?: boolean | undefined
NodeEditorProps.inspector?: boolean | undefined
NodeEditorProps.showIssues?: boolean | undefined
NodeEditorProps.actions?: React.ReactNode
NodeEditorProps.minimap?: boolean | undefined
NodeEditorProps.height?: number | undefined
NodeEditorProps.label?: string | undefined
NodeEditorProps.onRunNode?: ((request: NodeTestRequest) => Promise<NodeTestResult>) | undefined
NodeEditorProps.variables?: ExpressionVariable[] | undefined
NodeEditorProps.credentials?: NodeCredential[] | undefined
NodeEditorProps.onCreateCredential?: ((type: string) => Promise<NodeCredential | undefined>) | undefined
NodeEditorProps.className?: string | undefined
type NodeField = (NodeFieldBase & { type: 'text'; placeholder?: string; expression?: boolean; }) | (NodeFieldBase & { type: 'textarea'; placeholder?: string; rows?: number; expression?: boolean; }) | (NodeFieldBase & { type: 'number'; min?: number; max?: number; step?: number; }) | (NodeFieldBase & { type: 'select'; options: NodeFieldOption[]; placeholder?: string; }) | (NodeFieldBase & { type: 'switch'; }) | (NodeFieldBase & { type: 'list'; placeholder?: string; }) | (NodeFieldBase & { type: 'conditions'; }) | (NodeFieldBase & { type: 'keyValue'; keyPlaceholder?: string; valuePlaceholder?: string; }) | (NodeFieldBase & { type: 'code'; language?: string; rows?: number; placeholder?: string; }) | (NodeFieldBase & { type: 'credential'; credentialType: string; }) | (NodeFieldBase & { type: 'custom'; render: (props: NodeFieldRenderProps) => React.ReactNode; })
type NodeFieldOption = {}
NodeFieldOption.value: string
NodeFieldOption.label: string
type NodeFieldRenderProps = {}
NodeFieldRenderProps.id: string
NodeFieldRenderProps.labelId: string
NodeFieldRenderProps.value: unknown
NodeFieldRenderProps.onChange: (value: unknown) => void
NodeFieldRenderProps.invalid: boolean
NodeFieldRenderProps.describedBy?: string | undefined
NodeFieldRenderProps.data: Record<string, unknown>
function NodeInspector
NodeInspector.workflow: Workflow
NodeInspector.node: WorkflowNode
NodeInspector.kinds: readonly NodeKind[]
NodeInspector.run?: NodeRun | undefined
NodeInspector.issues: WorkflowIssue[]
NodeInspector.readOnly: boolean
NodeInspector.onChange: (next: Workflow, announce?: string) => void
NodeInspector.onDelete: () => void
NodeInspector.onDuplicate?: (() => void) | undefined
NodeInspector.input?: unknown
NodeInspector.onTest?: (() => Promise<unknown>) | undefined
NodeInspector.className?: string | undefined
type NodeKind = {}
NodeKind.type: string
NodeKind.label: string
NodeKind.description?: string | undefined
NodeKind.category?: string | undefined
NodeKind.icon?: React.ComponentType<{ className?: string; }> | undefined
NodeKind.inputs?: NodePort[] | undefined
NodeKind.outputs?: NodePort[] | ((data: Record<string, unknown>) => NodePort[]) | undefined
NodeKind.fields?: NodeField[] | undefined
NodeKind.defaults?: Record<string, unknown> | undefined
NodeKind.summary?: ((data: Record<string, unknown>) => string | undefined) | undefined
NodeKind.max?: number | undefined
NodeKind.removable?: boolean | undefined
NodeKind.hidden?: boolean | undefined
function NodePalette
NodePalette.kinds: readonly NodeKind[]
NodePalette.disabledTypes: ReadonlySet<string>
NodePalette.onPick: (kind: NodeKind) => void
type NodePort = {}
NodePort.id: string
NodePort.label?: string | undefined
function nodePorts(kind: NodeKind | undefined, data?: Record<string, unknown>) => { inputs: NodePort[]; outputs: NodePort[]; }
type NodeRun = {}
NodeRun.status: NodeRunStatus
NodeRun.message?: string | undefined
NodeRun.input?: unknown
NodeRun.output?: unknown
type NodeRunStatus = 'error' | 'running' | 'skipped' | 'waiting' | 'success'
type NodeTestRequest = {}
NodeTestRequest.node: WorkflowNode
NodeTestRequest.input: unknown
NodeTestRequest.workflow: Workflow
type NodeTestResult = {}
NodeTestResult.status?: 'error' | 'success' | undefined
NodeTestResult.output?: unknown
NodeTestResult.message?: string | undefined
function pasteNodes(wf: Workflow, clip: unknown, kinds: readonly NodeKind[], offset?: { x: number; y: number; }) => { workflow: Workflow; ids: string[]; }
function removeEdges(wf: Workflow, ids: readonly string[]) => Workflow
function removeNodes(wf: Workflow, ids: readonly string[], kinds?: readonly NodeKind[]) => Workflow
function updateNode(wf: Workflow, id: string, patch: { name?: string | undefined; data?: Record<string, unknown>; position?: { x: number; y: number; }; disabled?: boolean | undefined; pinned?: unknown; }, kinds?: readonly NodeKind[]) => Workflow
function validateWorkflow(wf: Workflow, kinds: readonly NodeKind[]) => WorkflowIssue[]
type Workflow = {}
Workflow.nodes: WorkflowNode[]
Workflow.edges: WorkflowEdge[]
Workflow.notes?: WorkflowNote[] | undefined
Workflow.groups?: WorkflowGroup[] | undefined
type WorkflowClipboard = {}
WorkflowClipboard.coreloom: 'workflow'
WorkflowClipboard.nodes: WorkflowNode[]
WorkflowClipboard.edges: WorkflowEdge[]
type WorkflowEdge = {}
WorkflowEdge.id: string
WorkflowEdge.source: string
WorkflowEdge.sourcePort?: string | undefined
WorkflowEdge.target: string
WorkflowEdge.targetPort?: string | undefined
type WorkflowIssue = { nodeId: string; code: 'required'; field: string; } | { nodeId: string; code: 'invalid'; field: string; } | { nodeId: string; code: 'unconnectedInput'; } | { nodeId: string; code: 'unconnectedOutput'; port: string; } | { nodeId: string; code: 'tooMany'; max: number; }
type WorkflowNode = {}
WorkflowNode.id: string
WorkflowNode.type: string
WorkflowNode.position: {}
WorkflowNode.position.x: number
WorkflowNode.position.y: number
WorkflowNode.name?: string | undefined
WorkflowNode.data?: Record<string, unknown> | undefined
WorkflowNode.disabled?: boolean | undefined
WorkflowNode.pinned?: unknown
```

## src/components/ui/node-editor-fields.tsx

```ts
function asConditions(v: unknown) => ConditionsValue
function CodeControl
CodeControl.id: string
CodeControl.value: unknown
CodeControl.onValueChange: (value: unknown) => void
CodeControl.readOnly: boolean
CodeControl.invalid?: boolean | undefined
CodeControl.describedBy?: string | undefined
CodeControl.labelId: string
CodeControl.rows?: number | undefined
CodeControl.placeholder?: string | undefined
type ConditionOperator = 'contains' | 'equals' | 'notEquals' | 'notContains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'isEmpty' | 'isNotEmpty'
type ConditionRule = {}
ConditionRule.left: string
ConditionRule.operator: ConditionOperator
ConditionRule.right?: string | undefined
function ConditionsControl
ConditionsControl.id: string
ConditionsControl.value: unknown
ConditionsControl.onValueChange: (value: unknown) => void
ConditionsControl.readOnly: boolean
ConditionsControl.invalid?: boolean | undefined
ConditionsControl.describedBy?: string | undefined
ConditionsControl.labelId: string
type ConditionsValue = {}
ConditionsValue.combinator: 'or' | 'and'
ConditionsValue.rules: ConditionRule[]
function CredentialControl
CredentialControl.id: string
CredentialControl.value: unknown
CredentialControl.onValueChange: (value: unknown) => void
CredentialControl.readOnly: boolean
CredentialControl.invalid?: boolean | undefined
CredentialControl.describedBy?: string | undefined
CredentialControl.labelId: string
CredentialControl.credentialType: string
function dataPaths(value: unknown, max?: number) => { path: string; sample: unknown; }[]
function DataView
DataView.value: unknown
DataView.draggable?: boolean | undefined
DataView.className?: string | undefined
function evaluateConditions(value: unknown, scope: ExpressionScope) => boolean | null
function ExpressionInput
ExpressionInput.id: string
ExpressionInput.value?: string | undefined
ExpressionInput.defaultValue?: string | undefined
ExpressionInput.onValueChange?: ((value: string) => void) | undefined
ExpressionInput.placeholder?: string | undefined
ExpressionInput.readOnly?: boolean | undefined
ExpressionInput.multiline?: boolean | undefined
ExpressionInput.rows?: number | undefined
ExpressionInput.preview?: boolean | undefined
ExpressionInput.className?: string | undefined
ExpressionInput.aria-invalid?: boolean | undefined
ExpressionInput.aria-describedby?: string | undefined
ExpressionInput.aria-label?: string | undefined
ExpressionInput.aria-labelledby?: string | undefined
type ExpressionInputProps = {}
ExpressionInputProps.id: string
ExpressionInputProps.value?: string | undefined
ExpressionInputProps.defaultValue?: string | undefined
ExpressionInputProps.onValueChange?: ((value: string) => void) | undefined
ExpressionInputProps.placeholder?: string | undefined
ExpressionInputProps.readOnly?: boolean | undefined
ExpressionInputProps.multiline?: boolean | undefined
ExpressionInputProps.rows?: number | undefined
ExpressionInputProps.preview?: boolean | undefined
ExpressionInputProps.className?: string | undefined
ExpressionInputProps.aria-invalid?: boolean | undefined
ExpressionInputProps.aria-describedby?: string | undefined
ExpressionInputProps.aria-label?: string | undefined
ExpressionInputProps.aria-labelledby?: string | undefined
type ExpressionScope = {}
ExpressionScope.input?: unknown
ExpressionScope.nodes?: Partial<Record<string, unknown>> | undefined
ExpressionScope.variables?: Record<string, unknown> | undefined
type ExpressionVariable = {}
ExpressionVariable.path: string
ExpressionVariable.sample?: unknown
ExpressionVariable.group?: string | undefined
function firstItem(v: unknown) => unknown
function hasExpression(s: string) => boolean
function jsonError(text: unknown) => string | null
function KeyValueControl
KeyValueControl.id: string
KeyValueControl.value: unknown
KeyValueControl.onValueChange: (value: unknown) => void
KeyValueControl.readOnly: boolean
KeyValueControl.invalid?: boolean | undefined
KeyValueControl.describedBy?: string | undefined
KeyValueControl.labelId: string
KeyValueControl.keyPlaceholder?: string | undefined
KeyValueControl.valuePlaceholder?: string | undefined
type KeyValueItem = {}
KeyValueItem.key: string
KeyValueItem.value: string
function keyValuesToObject(v: unknown, scope?: ExpressionScope) => Record<string, string>
type NodeCredential = {}
NodeCredential.id: string
NodeCredential.name: string
NodeCredential.type: string
function NodeFieldsContext
NodeFieldsContext.*: react
type NodeFieldsEnv = {}
NodeFieldsEnv.suggestions: ExpressionVariable[]
NodeFieldsEnv.scope: ExpressionScope | null
NodeFieldsEnv.credentials: readonly NodeCredential[]
NodeFieldsEnv.onCreateCredential?: ((type: string) => Promise<NodeCredential | undefined>) | undefined
NodeFieldsEnv.announce: (message: string) => void
function readPath(value: unknown, path: string) => { found: boolean; value: unknown; }
function resolveExpression(template: string, scope: ExpressionScope) => { text: string; value: unknown; missing: string[]; }
```

## src/components/ui/node-editor-canvas.tsx

```ts
function addGroup<W extends CanvasGraph>(wf: W, options: { label: string; nodeIds?: readonly string[]; sizes?: Sizes; position?: { x: number; y: number; }; color?: CanvasColor; }) => { workflow: W; id: string; }
function addNote<W extends CanvasGraph>(wf: W, options: { position: { x: number; y: number; }; text?: string; color?: CanvasColor; width?: number; height?: number; }) => { workflow: W; id: string; }
function boundsOf(wf: CanvasGraph, ids: readonly string[], sizes?: Sizes) => { x: number; y: number; width: number; height: number; } | null
const CANVAS_COLORS: readonly CanvasColor[]
const CANVAS_NODE_TYPES: {}
CANVAS_NODE_TYPES.note: ({ data, selected }: NodeProps<NoteNode>) => React.JSX.Element
CANVAS_NODE_TYPES.frame: ({ data, selected }: NodeProps<FrameNode>) => React.JSX.Element
type CanvasColor = 'neutral' | 'blue' | 'yellow' | 'green' | 'red' | 'cyan'
function canvasColorFill(color: CanvasColor) => string
function CanvasFinder
CanvasFinder.items: readonly CanvasFinderItem[]
CanvasFinder.onPick: (id: string) => void
type CanvasFinderItem = {}
CanvasFinderItem.id: string
CanvasFinderItem.label: string
CanvasFinderItem.hint?: string | undefined
CanvasFinderItem.section: 'notes' | 'groups' | 'nodes'
CanvasFinderItem.icon?: React.ComponentType<{ className?: string; }> | undefined
type CanvasGraph = {}
CanvasGraph.nodes: { id: string; position: { x: number; y: number; }; }[]
CanvasGraph.notes?: WorkflowNote[] | undefined
CanvasGraph.groups?: WorkflowGroup[] | undefined
type FrameData = {}
FrameData.group: WorkflowGroup
FrameData.readOnly: boolean
FrameData.onText: (text: string) => void
FrameData.onResizeStart: () => void
FrameData.onResizeEnd: () => void
type FrameNode = { id: string; position: import("@xyflow/react").XYPosition; data: FrameData; sourcePosition?: import("@xyflow/react").Position; targetPosition?: import("@xyflow/react").Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'frame'; } & { style?: React.CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: React.AriaRole; domAttributes?: Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof React.DOMAttributes<HTMLDivElement>>; }
function groupMembers(wf: CanvasGraph, groupId: string, sizes?: Sizes) => string[]
function moveGroup<W extends CanvasGraph>(wf: W, groupId: string, delta: { x: number; y: number; }, options?: { members?: readonly string[]; sizes?: Sizes; skip?: ReadonlySet<string>; }) => W
type NoteData = {}
NoteData.note: WorkflowNote
NoteData.readOnly: boolean
NoteData.onText: (text: string) => void
NoteData.onResizeStart: () => void
NoteData.onResizeEnd: () => void
type NoteNode = { id: string; position: import("@xyflow/react").XYPosition; data: NoteData; sourcePosition?: import("@xyflow/react").Position; targetPosition?: import("@xyflow/react").Position; hidden?: boolean; selected?: boolean; dragging?: boolean; draggable?: boolean; selectable?: boolean; connectable?: boolean; deletable?: boolean; dragHandle?: string; width?: number; height?: number; initialWidth?: number; initialHeight?: number; parentId?: string; zIndex?: number; extent?: 'parent' | import("@xyflow/react").CoordinateExtent | null; expandParent?: boolean; ariaLabel?: string; origin?: import("@xyflow/react").NodeOrigin; handles?: import("@xyflow/react").NodeHandle[]; measured?: { width?: number; height?: number; }; } & { type: 'note'; } & { style?: React.CSSProperties; className?: string; resizing?: boolean; focusable?: boolean; ariaRole?: React.AriaRole; domAttributes?: Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'style' | 'className' | 'draggable' | 'role' | 'aria-label' | 'defaultValue' | 'dangerouslySetInnerHTML' | keyof React.DOMAttributes<HTMLDivElement>>; }
function refitGroups<W extends CanvasGraph>(before: CanvasGraph, after: W, sizes?: Sizes) => W
function removeCanvasItems<W extends CanvasGraph>(wf: W, ids: readonly string[]) => W
function updateGroup<W extends CanvasGraph>(wf: W, id: string, patch: Partial<Omit<WorkflowGroup, 'id'>>) => W
function updateNote<W extends CanvasGraph>(wf: W, id: string, patch: Partial<Omit<WorkflowNote, 'id'>>) => W
type WorkflowGroup = {}
WorkflowGroup.id: string
WorkflowGroup.label: string
WorkflowGroup.color?: CanvasColor | undefined
WorkflowGroup.position: {}
WorkflowGroup.position.x: number
WorkflowGroup.position.y: number
WorkflowGroup.width: number
WorkflowGroup.height: number
type WorkflowNote = {}
WorkflowNote.id: string
WorkflowNote.text: string
WorkflowNote.color?: CanvasColor | undefined
WorkflowNote.position: {}
WorkflowNote.position.x: number
WorkflowNote.position.y: number
WorkflowNote.width: number
WorkflowNote.height: number
```
