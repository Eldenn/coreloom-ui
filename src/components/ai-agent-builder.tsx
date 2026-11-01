'use client'

// Coreloom UI — AI agent builder (block). Design an agent graph the way LangGraph thinks about it:
// a shared state, nodes (agents, tools, your functions, human review, subgraphs), plain and
// conditional edges (a Router with one output per route), START and END. Built on NodeEditor;
// `toLangGraphJSON` / `fromLangGraphJSON` speak the shape of LangGraph's `get_graph().to_json()`,
// so your app can hand the graph to its runtime. Nothing runs here: `onRun` is your app's.
import {
  BotIcon,
  BracesIcon,
  CirclePlayIcon,
  CircleStopIcon,
  CodeIcon,
  NetworkIcon,
  PlusIcon,
  SplitIcon,
  Trash2Icon,
  UserCheckIcon,
  WrenchIcon,
} from 'lucide-react'
import * as React from 'react'

import { promptVariables } from '@/components/ai-agents'
import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ModelPicker } from '@/components/ui/model-picker'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  connectNodes,
  layoutWorkflow,
  type NodeEditorProps,
  type NodeKind,
  type NodeRun,
  type Workflow,
  type WorkflowNode,
} from '@/components/ui/node-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { WorkflowBuilder } from '@/components/workflow-builder'
import type { AiModel } from '@/lib/ai'
import { useCoreloomI18n } from '@/lib/i18n'

const START = '__start__'
const END = '__end__'

type AgentNodeType =
  'start' | 'end' | 'agent' | 'tool' | 'function' | 'router' | 'human' | 'subgraph'

const NODE_TYPES: readonly AgentNodeType[] = [
  'start',
  'end',
  'agent',
  'tool',
  'function',
  'router',
  'human',
  'subgraph',
]

type StateFieldType = 'messages' | 'string' | 'number' | 'boolean' | 'list' | 'object'
const FIELD_TYPES: readonly StateFieldType[] = [
  'messages',
  'string',
  'number',
  'boolean',
  'list',
  'object',
]

/** One key of the graph's state. `append` is LangGraph's `add` / `add_messages` reducer. */
interface StateField {
  name: string
  type: StateFieldType
  reducer: 'replace' | 'append'
}

/** A tool an agent may call. `AgentTool` from ai-agents fits. */
interface AgentBuilderTool {
  id: string
  name: string
  description?: string
}

/** A node as `graph.get_graph().to_json()` writes it. */
interface LangGraphNodeJSON {
  id: string
  type?: string
  data?: unknown
  metadata?: Record<string, unknown> | null
}

/** An edge as `to_json()` writes it: `conditional` with the route in `data`. */
interface LangGraphEdgeJSON {
  source: string
  target: string
  data?: unknown
  conditional?: boolean
}

interface LangGraphJSON {
  nodes: LangGraphNodeJSON[]
  edges: LangGraphEdgeJSON[]
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const isPoint = (v: unknown): v is { x: number; y: number } =>
  isRecord(v) && Number.isFinite(v.x) && Number.isFinite(v.y)

const strings = (v: unknown) =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []

const routesOf = (n: WorkflowNode) => [...new Set(strings(n.data?.routes))]

/** A graph with START and END, the two nodes every LangGraph graph has. */
function emptyAgentGraph(): Workflow {
  return {
    nodes: [
      { id: START, type: 'start', position: { x: 0, y: 0 } },
      { id: END, type: 'end', position: { x: 720, y: 0 } },
    ],
    edges: [],
  }
}

const DEFAULT_STATE: StateField[] = [{ name: 'messages', type: 'messages', reducer: 'append' }]

/**
 * The graph in the shape of LangGraph's `get_graph().to_json()`. A Router isn't a LangGraph node:
 * its routes become conditional edges from the nodes that lead to it, with the route in `data`.
 * Everything LangGraph doesn't model (positions, names, settings, the routers, the state) travels
 * in `metadata.coreloom`, so `fromLangGraphJSON` gives the same graph back.
 */
function toLangGraphJSON(wf: Workflow, state: readonly StateField[] = []): LangGraphJSON {
  const byId = new Map(wf.nodes.map((n) => [n.id, n]))
  const idOf = (id: string) => {
    const n = byId.get(id)
    return n?.type === 'start' ? START : n?.type === 'end' ? END : id
  }
  const isRouter = (id: string) => byId.get(id)?.type === 'router'
  const routers = wf.nodes.filter((n) => n.type === 'router')
  const real = wf.nodes.filter((n) => n.type !== 'router')
  const base = (n: WorkflowNode) => ({
    type: n.type,
    position: n.position,
    ...(n.name !== undefined ? { name: n.name } : {}),
    ...(n.data && Object.keys(n.data).length ? { data: n.data } : {}),
  })

  const nodes: LangGraphNodeJSON[] = real.map((n) => {
    if (n.type === 'start')
      return {
        id: START,
        type: 'schema',
        data: START,
        metadata: {
          coreloom: {
            ...base(n),
            state,
            routers: routers.map((r) => ({
              id: r.id,
              ...base(r),
              sources: wf.edges.filter((e) => e.target === r.id).map((e) => idOf(e.source)),
            })),
          },
        },
      }
    if (n.type === 'end')
      return { id: END, type: 'schema', data: END, metadata: { coreloom: base(n) } }
    return {
      id: n.id,
      type: 'runnable',
      data: {
        id:
          n.type === 'tool'
            ? ['langgraph', 'prebuilt', 'tool_node', 'ToolNode']
            : ['coreloom', n.type],
        name: n.id,
      },
      metadata: { coreloom: base(n) },
    }
  })

  const edges: LangGraphEdgeJSON[] = []
  const seen = new Set<string>()
  const push = (e: LangGraphEdgeJSON) => {
    const key = `${e.source}\u0000${e.target}\u0000${typeof e.data === 'string' ? e.data : ''}`
    if (seen.has(key)) return
    seen.add(key)
    edges.push(e)
  }
  for (const e of wf.edges) {
    if (isRouter(e.target)) continue
    if (!isRouter(e.source)) {
      push({ source: idOf(e.source), target: idOf(e.target) })
      continue
    }
    // A route: one conditional edge from every node that leads to the router.
    const route = e.sourcePort ?? strings(byId.get(e.source)?.data?.routes).at(0)
    for (const into of wf.edges.filter((x) => x.target === e.source && !isRouter(x.source)))
      push({
        source: idOf(into.source),
        target: idOf(e.target),
        ...(route !== undefined ? { data: route } : {}),
        conditional: true,
      })
  }
  return { nodes, edges }
}

/** A node type from what LangGraph tells us, when there's no `metadata.coreloom`. */
function guessType(n: LangGraphNodeJSON): AgentNodeType {
  if (n.id === START) return 'start'
  if (n.id === END) return 'end'
  const path = isRecord(n.data) ? strings(n.data.id) : []
  if (path.includes('ToolNode') || /^tools?$/i.test(n.id)) return 'tool'
  if (/agent|model|llm|assistant|chat/i.test(n.id)) return 'agent'
  return 'function'
}

/**
 * Reads LangGraph's `to_json()` output (an object or its text) into a graph and its state.
 * Conditional edges from one node become a Router after it, one output per route. Positions come
 * from `metadata.coreloom` when present; otherwise the graph is laid out. Returns null when the
 * input isn't a graph. Unknown or malformed entries are skipped, never trusted.
 */
function fromLangGraphJSON(input: unknown): { workflow: Workflow; state: StateField[] } | null {
  let json = input
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json) as unknown
    } catch {
      return null
    }
  }
  if (!isRecord(json) || !Array.isArray(json.nodes) || !Array.isArray(json.edges)) return null

  const rawNodes = json.nodes.filter(
    (n): n is LangGraphNodeJSON => isRecord(n) && typeof n.id === 'string' && n.id !== '',
  )
  const rawEdges = json.edges.filter(
    (e): e is LangGraphEdgeJSON =>
      isRecord(e) && typeof e.source === 'string' && typeof e.target === 'string',
  )
  const meta = (n: LangGraphNodeJSON) =>
    isRecord(n.metadata) && isRecord(n.metadata.coreloom) ? n.metadata.coreloom : undefined

  let laidOut = true
  const toNode = (id: string, m: Record<string, unknown> | undefined, type: AgentNodeType) => {
    const node: WorkflowNode = { id, type, position: { x: 0, y: 0 } }
    if (m && isPoint(m.position)) node.position = { x: m.position.x, y: m.position.y }
    else laidOut = false
    if (m && typeof m.name === 'string' && m.name) node.name = m.name
    if (m && isRecord(m.data)) node.data = structuredClone(m.data)
    return node
  }

  const nodes: WorkflowNode[] = []
  const seenIds = new Set<string>()
  let startMeta: Record<string, unknown> | undefined
  for (const n of rawNodes) {
    if (seenIds.has(n.id)) continue
    seenIds.add(n.id)
    const m = meta(n)
    const declared = m && typeof m.type === 'string' ? m.type : undefined
    const type =
      n.id === START
        ? 'start'
        : n.id === END
          ? 'end'
          : declared && NODE_TYPES.includes(declared as AgentNodeType) && declared !== 'router'
            ? (declared as AgentNodeType)
            : guessType(n)
    if (n.id === START) startMeta = m
    nodes.push(toNode(n.id, m, type))
  }

  const state = (Array.isArray(startMeta?.state) ? startMeta.state : []).flatMap(
    (f): StateField[] =>
      isRecord(f) &&
      typeof f.name === 'string' &&
      f.name &&
      FIELD_TYPES.includes(f.type as StateFieldType) &&
      (f.reducer === 'replace' || f.reducer === 'append')
        ? [{ name: f.name, type: f.type as StateFieldType, reducer: f.reducer }]
        : [],
  )

  // Routers saved by toLangGraphJSON, and which nodes lead to each.
  const routerOf = new Map<string, WorkflowNode>()
  for (const r of Array.isArray(startMeta?.routers) ? startMeta.routers : []) {
    if (!isRecord(r) || typeof r.id !== 'string' || !r.id || seenIds.has(r.id)) continue
    seenIds.add(r.id)
    const node = toNode(r.id, r, 'router')
    node.data = { ...node.data, routes: routesOf(node) }
    nodes.push(node)
    for (const s of strings(r.sources)) if (!routerOf.has(s)) routerOf.set(s, node)
  }

  let wf: Workflow = { nodes, edges: [] }
  const has = (id: string) => nodes.some((n) => n.id === id)
  for (const e of rawEdges) {
    if (!has(e.source) || !has(e.target)) continue
    if (!e.conditional) {
      wf = connectNodes(wf, { source: e.source, target: e.target })
      continue
    }
    let router = routerOf.get(e.source)
    if (!router) {
      let id = `${e.source}-route`
      for (let i = 2; seenIds.has(id); i++) id = `${e.source}-route-${String(i)}`
      seenIds.add(id)
      router = { id, type: 'router', position: { x: 0, y: 0 }, data: { routes: [] } }
      laidOut = false
      nodes.push(router)
      routerOf.set(e.source, router)
    }
    const route = typeof e.data === 'string' && e.data ? e.data : e.target
    const routes = routesOf(router)
    if (!routes.includes(route)) router.data = { ...router.data, routes: [...routes, route] }
    wf = { nodes, edges: wf.edges }
    wf = connectNodes(wf, { source: e.source, target: router.id })
    wf = connectNodes(wf, { source: router.id, sourcePort: route, target: e.target })
  }
  wf = { nodes, edges: wf.edges }
  return { workflow: laidOut ? wf : layoutWorkflow(wf), state }
}

/** The node kinds of the agent builder, in the current language. */
function useAgentBuilderKinds({
  models = [],
  tools = [],
}: {
  models?: readonly AiModel[]
  tools?: readonly AgentBuilderTool[]
}): NodeKind[] {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  return React.useMemo(() => {
    const toolOptions = tools.map((x) => ({ value: x.id, label: x.name }))
    const toolNames = (data: Record<string, unknown>) =>
      strings(data.tools).map((id) => tools.find((x) => x.id === id)?.name ?? id)
    const toolsField = {
      name: 'tools',
      label: t.fields.tools,
      type: 'custom' as const,
      render: ({
        id,
        value,
        onChange,
        describedBy,
        invalid,
      }: {
        id: string
        value: unknown
        onChange: (v: unknown) => void
        describedBy?: string
        invalid: boolean
      }) => (
        <MultiSelect
          id={id}
          options={toolOptions}
          value={strings(value)}
          onValueChange={onChange}
          placeholder={t.fields.toolsPlaceholder}
          aria-label={t.fields.tools}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      ),
    }
    const kinds: NodeKind[] = [
      {
        type: 'start',
        label: t.kinds.start.label,
        description: t.kinds.start.description,
        icon: CirclePlayIcon,
        inputs: [],
        max: 1,
        removable: false,
        hidden: true,
      },
      {
        type: 'end',
        label: t.kinds.end.label,
        description: t.kinds.end.description,
        icon: CircleStopIcon,
        outputs: [],
        max: 1,
        removable: false,
        hidden: true,
      },
      {
        type: 'agent',
        label: t.kinds.agent.label,
        description: t.kinds.agent.description,
        category: t.categories.agents,
        icon: BotIcon,
        defaults: { instructions: '', tools: [] },
        fields: [
          models.length
            ? {
                name: 'model',
                label: t.fields.model,
                type: 'custom',
                required: true,
                render: ({ id, labelId, value, onChange, invalid, describedBy }) => (
                  <ModelPicker
                    id={id}
                    variant="outline"
                    models={models}
                    value={typeof value === 'string' ? value : ''}
                    onValueChange={onChange}
                    placeholder={t.fields.modelPlaceholder}
                    aria-labelledby={labelId}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                  />
                ),
              }
            : { name: 'model', label: t.fields.model, type: 'text', required: true },
          {
            name: 'instructions',
            label: t.fields.instructions,
            description: t.fields.instructionsHint,
            type: 'custom',
            required: true,
            render: ({ id, value, onChange, invalid, describedBy }) => {
              const text = typeof value === 'string' ? value : ''
              const vars = promptVariables(text)
              return (
                <>
                  <Textarea
                    id={id}
                    rows={5}
                    value={text}
                    onChange={(e) => {
                      onChange(e.target.value)
                    }}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                  />
                  {vars.length > 0 && (
                    <p className="m-0 font-mono text-[11.5px] text-fg-secondary">
                      {t.variables(vars.join(', '))}
                    </p>
                  )}
                </>
              )
            },
          },
          ...(tools.length ? [toolsField] : []),
        ],
        summary: (data) => {
          const model =
            models.find((m) => m.id === data.model)?.name ??
            (typeof data.model === 'string' ? data.model : '')
          const n = strings(data.tools).length
          return [model, n ? t.toolCount(n) : ''].filter(Boolean).join(' · ') || undefined
        },
      },
      {
        type: 'tool',
        label: t.kinds.tool.label,
        description: t.kinds.tool.description,
        category: t.categories.agents,
        icon: WrenchIcon,
        defaults: { tools: [] },
        fields: tools.length ? [{ ...toolsField, required: true }] : [],
        summary: (data) => toolNames(data).join(', ') || undefined,
      },
      {
        type: 'function',
        label: t.kinds.function.label,
        description: t.kinds.function.description,
        category: t.categories.logic,
        icon: CodeIcon,
        fields: [
          {
            name: 'description',
            label: t.fields.description,
            description: t.fields.descriptionHint,
            type: 'textarea',
            rows: 3,
          },
        ],
        summary: (data) => (typeof data.description === 'string' && data.description) || undefined,
      },
      {
        type: 'router',
        label: t.kinds.router.label,
        description: t.kinds.router.description,
        category: t.categories.logic,
        icon: SplitIcon,
        defaults: { routes: ['continue', 'end'] },
        outputs: (data) => strings(data.routes).map((r) => ({ id: r, label: r })),
        fields: [
          {
            name: 'routes',
            label: t.fields.routes,
            description: t.fields.routesHint,
            placeholder: t.fields.routesPlaceholder,
            type: 'list',
            required: true,
          },
          { name: 'condition', label: t.fields.condition, type: 'textarea', rows: 3 },
        ],
        summary: (data) => (typeof data.condition === 'string' && data.condition) || undefined,
      },
      {
        type: 'human',
        label: t.kinds.human.label,
        description: t.kinds.human.description,
        category: t.categories.people,
        icon: UserCheckIcon,
        fields: [{ name: 'question', label: t.fields.question, type: 'textarea', rows: 3 }],
        summary: (data) => (typeof data.question === 'string' && data.question) || undefined,
      },
      {
        type: 'subgraph',
        label: t.kinds.subgraph.label,
        description: t.kinds.subgraph.description,
        category: t.categories.logic,
        icon: NetworkIcon,
        fields: [{ name: 'graph', label: t.fields.graph, type: 'text', required: true }],
        summary: (data) => (typeof data.graph === 'string' && data.graph) || undefined,
      },
    ]
    return kinds
  }, [t, models, tools])
}

/** The state's fields: name, type and how an update applies. */
function StateEditor({
  value,
  onValueChange,
  readOnly = false,
}: {
  value: StateField[]
  onValueChange: (value: StateField[]) => void
  readOnly?: boolean
}) {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  const baseId = React.useId()
  const set = (i: number, patch: Partial<StateField>) => {
    onValueChange(value.map((f, j) => (j === i ? { ...f, ...patch } : f)))
  }
  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 ? (
        <p className="m-0 text-[13px] text-muted-foreground">{t.noFields}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {value.map((f, i) => (
            <li
              // eslint-disable-next-line @eslint-react/no-array-index-key -- fields have no id and the name is what's being edited
              key={i}
              className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_8.5rem_8rem_auto]"
            >
              <Input
                id={`${baseId}-${String(i)}`}
                value={f.name}
                readOnly={readOnly}
                aria-label={t.fieldName}
                autoComplete="off"
                className="font-mono text-[13px]"
                onChange={(e) => {
                  set(i, { name: e.target.value.replace(/\s+/g, '_') })
                }}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.removeField(f.name || t.fieldName)}
                disabled={readOnly}
                className="sm:order-last"
                onClick={() => {
                  onValueChange(value.filter((_, j) => j !== i))
                }}
              >
                <Trash2Icon aria-hidden />
              </Button>
              <Select
                value={f.type}
                disabled={readOnly}
                onValueChange={(v) => {
                  if (FIELD_TYPES.includes(v as StateFieldType))
                    set(i, {
                      type: v as StateFieldType,
                      ...(v === 'messages' ? { reducer: 'append' as const } : {}),
                    })
                }}
              >
                <SelectTrigger aria-label={t.type} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ty) => (
                    <SelectItem key={ty} value={ty}>
                      {t.types[ty]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={f.reducer}
                disabled={readOnly}
                onValueChange={(v) => {
                  if (v === 'replace' || v === 'append') set(i, { reducer: v })
                }}
              >
                <SelectTrigger aria-label={t.reducer} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">{t.reducers.replace}</SelectItem>
                  <SelectItem value="append">{t.reducers.append}</SelectItem>
                </SelectContent>
              </Select>
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            const taken = new Set(value.map((f) => f.name))
            let name = 'field'
            for (let i = 2; taken.has(name); i++) name = `field_${String(i)}`
            onValueChange([...value, { name, type: 'string', reducer: 'replace' }])
            // Focus the new name so the keyboard can type it straight away.
            requestAnimationFrame(() => {
              document.getElementById(`${baseId}-${String(value.length)}`)?.focus()
            })
          }}
        >
          <PlusIcon aria-hidden />
          {t.addField}
        </Button>
      )}
    </div>
  )
}

/** The agent graph's page: name, State, LangGraph JSON, Save and Run, and the editor. */
function AgentBuilder({
  models,
  tools,
  value,
  defaultValue,
  onValueChange,
  state: stateProp,
  defaultState = DEFAULT_STATE,
  onStateChange,
  name,
  defaultName,
  onNameChange,
  onSave,
  onRun,
  running,
  runs,
  onRunNode,
  readOnly = false,
  defaultSelectedId,
  height,
  className,
}: {
  /** Offered in the Agent node's model picker; a text field without them. */
  models?: AiModel[]
  /** Offered to Agent and Tools nodes. */
  tools?: AgentBuilderTool[]
  value?: Workflow
  defaultValue?: Workflow
  onValueChange?: (workflow: Workflow) => void
  state?: StateField[]
  defaultState?: StateField[]
  onStateChange?: (state: StateField[]) => void
  name?: string
  defaultName?: string
  onNameChange?: (name: string) => void
  /** Gets the graph, its LangGraph JSON and its name. */
  onSave?: (graph: {
    workflow: Workflow
    json: LangGraphJSON
    name: string
  }) => Promise<unknown> | undefined
  /** Gets the graph and its LangGraph JSON: run it in your app and report through `runs`. */
  onRun?: (graph: { workflow: Workflow; json: LangGraphJSON }) => void
  running?: boolean
  runs?: Partial<Record<string, NodeRun>>
  /** Runs one node in your app, for "Test node" (see NodeEditor). */
  onRunNode?: NodeEditorProps['onRunNode']
  readOnly?: boolean
  /** The node whose settings show first. */
  defaultSelectedId?: string
  height?: number
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  const kinds = useAgentBuilderKinds({ models, tools })
  const [graphState, setGraphState] = React.useState<Workflow>(defaultValue ?? emptyAgentGraph)
  const workflow = value ?? graphState
  const [fieldsState, setFieldsState] = React.useState(defaultState)
  const fields = stateProp ?? fieldsState
  const [nameState, setNameState] = React.useState(defaultName ?? '')
  const currentName = name ?? nameState
  const [dialog, setDialog] = React.useState<'state' | 'json' | null>(null)
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState('')
  // Bumped on import so the editor remounts and fits the new graph in view.
  const [generation, setGeneration] = React.useState(0)
  const jsonId = React.useId()

  const setWorkflow = (next: Workflow) => {
    setGraphState(next)
    onValueChange?.(next)
  }
  const setFields = (next: StateField[]) => {
    setFieldsState(next)
    onStateChange?.(next)
  }

  const openJson = () => {
    setDraft(JSON.stringify(toLangGraphJSON(workflow, fields), null, 2))
    setError('')
    setDialog('json')
  }
  const importJson = () => {
    const parsed = fromLangGraphJSON(draft)
    if (!parsed) {
      setError(t.invalidJson)
      return
    }
    setWorkflow(parsed.workflow)
    if (parsed.state.length) setFields(parsed.state)
    setGeneration((g) => g + 1)
    setDialog(null)
  }

  return (
    <>
      <WorkflowBuilder
        key={generation}
        kinds={kinds}
        value={workflow}
        onValueChange={setWorkflow}
        name={currentName}
        onNameChange={(n) => {
          setNameState(n)
          onNameChange?.(n)
        }}
        {...(onSave
          ? {
              onSave: (wf: Workflow, n: string) =>
                onSave({ workflow: wf, json: toLangGraphJSON(wf, fields), name: n }),
            }
          : {})}
        {...(onRun
          ? {
              onRun: (wf: Workflow) => {
                onRun({ workflow: wf, json: toLangGraphJSON(wf, fields) })
              },
            }
          : {})}
        {...(running !== undefined ? { running } : {})}
        {...(runs ? { runs } : {})}
        readOnly={readOnly}
        {...(height !== undefined ? { height } : {})}
        editorProps={{
          label: t.label,
          defaultSelectedId: defaultSelectedId ?? null,
          // State fields are what `{{ }}` in any node can read.
          variables: fields.map((f) => ({ path: f.name })),
          ...(onRunNode ? { onRunNode } : {}),
        }}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDialog('state')
              }}
            >
              <BracesIcon aria-hidden />
              {t.state}
            </Button>
            <Button variant="ghost" size="sm" onClick={openJson}>
              <CodeIcon aria-hidden />
              {t.json}
            </Button>
          </>
        }
        {...(className ? { className } : {})}
      />
      <Dialog
        open={dialog === 'state'}
        onOpenChange={(open) => {
          setDialog(open ? 'state' : null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.state}</DialogTitle>
            <DialogDescription>{t.stateHint}</DialogDescription>
          </DialogHeader>
          <StateEditor value={fields} onValueChange={setFields} readOnly={readOnly} />
          <DialogFooter>
            <Button
              onClick={() => {
                setDialog(null)
              }}
            >
              {t.done}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialog === 'json'}
        onOpenChange={(open) => {
          if (open) openJson()
          else setDialog(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.json}</DialogTitle>
            <DialogDescription>{t.jsonHint}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <label htmlFor={jsonId} className="sr-only">
              {t.json}
            </label>
            <Textarea
              id={jsonId}
              value={draft}
              readOnly={readOnly}
              spellCheck={false}
              rows={14}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${jsonId}-error` : undefined}
              onChange={(e) => {
                setDraft(e.target.value)
                setError('')
              }}
              className="max-h-[50vh] font-mono text-[12px]"
            />
            <CopyButton value={draft} className="absolute top-2 right-2 bg-card" />
          </div>
          {error && (
            <p id={`${jsonId}-error`} role="alert" className="m-0 text-[12.5px] text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            {!readOnly && (
              <Button variant="outline" onClick={importJson}>
                {t.import}
              </Button>
            )}
            <Button
              onClick={() => {
                setDialog(null)
              }}
            >
              {t.done}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export {
  AgentBuilder,
  type AgentBuilderTool,
  type AgentNodeType,
  emptyAgentGraph,
  fromLangGraphJSON,
  type LangGraphEdgeJSON,
  type LangGraphJSON,
  type LangGraphNodeJSON,
  StateEditor,
  type StateField,
  type StateFieldType,
  toLangGraphJSON,
  useAgentBuilderKinds,
}
