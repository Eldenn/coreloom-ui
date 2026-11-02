'use client'

// Coreloom UI — AI agent builder (block). Design an agent graph the way LangGraph thinks about it:
// a shared state, nodes (agents, tools, your functions, human review, subgraphs), plain and
// conditional edges (a Router with one output per route), START and END. Built on NodeEditor;
// `toLangGraphJSON` / `fromLangGraphJSON` speak the shape of LangGraph's `get_graph().to_json()`,
// so your app can hand the graph to its runtime, and `toLangGraphConfig` gives what `compile()` and
// `invoke()` take (interrupts, recursion limit). A paused run shows its interrupt for a person to
// approve, edit or reject (`interrupt` / `onResume`). Nothing runs here: `onRun` is your app's.
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
  type NodeField,
  type NodeKind,
  type NodeRun,
  type Workflow,
  type WorkflowNode,
} from '@/components/ui/node-editor'
import { ExpressionInput } from '@/components/ui/node-editor-fields'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

/** One parameter of a tool, as a JSON Schema property. */
interface ToolParameter {
  type?: string
  description?: string
  enum?: readonly string[]
}

/** A tool's input, as a JSON Schema object (LangChain's `args_schema`, MCP's `inputSchema`). */
interface ToolParameters {
  type?: 'object'
  properties?: Record<string, ToolParameter>
  required?: readonly string[]
}

/** A tool an agent may call. `AgentTool` from ai-agents fits. */
interface AgentBuilderTool {
  id: string
  name: string
  description?: string
  /** It changes data (sends, deletes): asks a person first by default when picked. */
  sensitive?: boolean
  /** Its input: each parameter can then be fixed per node, or left to the model. */
  parameters?: ToolParameters
}

/** Settings of the whole graph. */
interface AgentGraphConfig {
  /** Steps a run may take before it stops (LangGraph's `recursion_limit`, 25 by default). */
  recursionLimit?: number
}

/** When a node pauses the run for a person: LangGraph's `interrupt_before` / `interrupt_after`. */
type AgentPause = 'none' | 'before' | 'after'

/** What a person may do with a paused tool call (LangChain's human-in-the-loop decisions). */
type AgentDecisionType = 'approve' | 'edit' | 'reject' | 'respond'
const DECISIONS: readonly AgentDecisionType[] = ['approve', 'edit', 'reject', 'respond']

/** A tool call waiting for a person. */
interface AgentInterruptAction {
  name: string
  args: Record<string, unknown>
  description?: string
  /** Default: the interrupt's `decisions`. */
  decisions?: readonly AgentDecisionType[]
}

/**
 * A paused run, as your app reports it: the node it stopped at, what it asks, and the tool calls
 * waiting for approval (LangChain's `action_requests`). Without actions, the person answers the
 * question (a Human review node's `interrupt()`).
 */
interface AgentInterrupt {
  nodeId: string
  question?: string
  actions?: readonly AgentInterruptAction[]
  /** Default: approve, edit and reject with actions; approve, reject and answer without. */
  decisions?: readonly AgentDecisionType[]
}

/** One decision, in the shape LangChain's human-in-the-loop middleware resumes with. */
type AgentDecision =
  | { type: 'approve' }
  | { type: 'edit'; edited_action: { name: string; args: Record<string, unknown> } }
  | { type: 'reject'; message?: string }
  | { type: 'respond'; message: string }

/** What `onResume` gets: pass `{ decisions }` to `Command(resume=…)`. */
interface AgentResume {
  nodeId: string
  /** One per action, in order; one alone for a question. */
  decisions: AgentDecision[]
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
function toLangGraphJSON(
  wf: Workflow,
  state: readonly StateField[] = [],
  config: AgentGraphConfig = {},
): LangGraphJSON {
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
            ...(Object.keys(config).length ? { config } : {}),
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

/** What LangGraph's `compile()` and `invoke()` take: `interrupt_before` / `_after` and limits. */
interface LangGraphConfig {
  interrupt_before: string[]
  interrupt_after: string[]
  recursion_limit?: number
}

/**
 * The graph's interrupts (nodes set to pause before or after, disabled ones left out) and its
 * recursion limit, named as LangGraph names them: `builder.compile(interrupt_before=…,
 * interrupt_after=…)`, `graph.invoke(input, { recursion_limit })`.
 */
function toLangGraphConfig(wf: Workflow, config: AgentGraphConfig = {}): LangGraphConfig {
  const at = (when: AgentPause) =>
    wf.nodes.filter((n) => !n.disabled && n.data?.pause === when).map((n) => n.id)
  const limit = config.recursionLimit
  return {
    interrupt_before: at('before'),
    interrupt_after: at('after'),
    ...(limit !== undefined && Number.isInteger(limit) && limit > 0
      ? { recursion_limit: limit }
      : {}),
  }
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
function fromLangGraphJSON(
  input: unknown,
): { workflow: Workflow; state: StateField[]; config: AgentGraphConfig } | null {
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

  const rawConfig = isRecord(startMeta?.config) ? startMeta.config : {}
  const limit = rawConfig.recursionLimit
  const config: AgentGraphConfig =
    typeof limit === 'number' && Number.isInteger(limit) && limit > 0
      ? { recursionLimit: limit }
      : {}

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
  return { workflow: laidOut ? wf : layoutWorkflow(wf), state, config }
}

/** A tool's parameters, by name. */
const paramsOf = (tool: AgentBuilderTool | undefined) =>
  Object.entries(tool?.parameters?.properties ?? {})

/** Fixed values for the parameters of the node's tools; an empty one is left to the model. */
function ToolArgsEditor({
  id,
  labelId,
  tools,
  value,
  onChange,
  describedBy,
}: {
  id: string
  labelId: string
  tools: readonly AgentBuilderTool[]
  value: unknown
  onChange: (value: unknown) => void
  describedBy?: string | undefined
}) {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  const args = isRecord(value) ? value : {}
  const withParams = tools.filter((x) => paramsOf(x).length > 0)
  if (!withParams.length)
    return (
      <p id={id} className="m-0 text-[12.5px] text-muted-foreground">
        {t.fields.noToolParams}
      </p>
    )
  const set = (tool: string, param: string, v: string) => {
    const entry = args[tool]
    const own = Object.fromEntries(
      Object.entries({ ...(isRecord(entry) ? entry : {}), [param]: v }).filter(([, x]) => x !== ''),
    )
    onChange(
      Object.fromEntries(
        Object.entries({ ...args, [tool]: own }).filter(
          ([, x]) => !isRecord(x) || Object.keys(x).length > 0,
        ),
      ),
    )
  }
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      className="flex flex-col gap-3"
    >
      {withParams.map((tool) => {
        const entry = args[tool.id]
        const own = isRecord(entry) ? entry : {}
        const required = tool.parameters?.required ?? []
        return (
          <fieldset key={tool.id} className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-1.5 p-0 text-[12.5px] font-medium text-fg-secondary">
              {tool.name}
            </legend>
            {paramsOf(tool).map(([param, schema]) => {
              const inputId = `${id}-${tool.id}-${param}`
              const v = own[param]
              return (
                <div
                  key={param}
                  className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-start gap-2"
                >
                  <label
                    htmlFor={inputId}
                    className="truncate pt-2 font-mono text-[12px] text-fg-secondary"
                    title={schema.description}
                  >
                    {param}
                    {required.includes(param) && <span aria-hidden>*</span>}
                    <span className="sr-only">
                      {` (${tool.name}${schema.type ? `, ${schema.type}` : ''})`}
                    </span>
                  </label>
                  {schema.enum?.length ? (
                    <Select
                      value={typeof v === 'string' && v ? v : MODEL_CHOOSES}
                      onValueChange={(next) => {
                        set(tool.id, param, next === MODEL_CHOOSES ? '' : next)
                      }}
                    >
                      <SelectTrigger id={inputId} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MODEL_CHOOSES}>{t.fields.modelChooses}</SelectItem>
                        {schema.enum.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ExpressionInput
                      id={inputId}
                      value={typeof v === 'string' ? v : ''}
                      placeholder={t.fields.modelChooses}
                      preview={false}
                      onValueChange={(next) => {
                        set(tool.id, param, next)
                      }}
                    />
                  )}
                </div>
              )
            })}
          </fieldset>
        )
      })}
    </div>
  )
}

const MODEL_CHOOSES = '__model__'

/** The node kinds of the agent builder, in the current language. */
function useAgentBuilderKinds({
  models = [],
  tools = [],
  state = [],
}: {
  models?: readonly AiModel[]
  tools?: readonly AgentBuilderTool[]
  /** Offered in each node's "Reads" and "Writes". */
  state?: readonly StateField[]
}): NodeKind[] {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  return React.useMemo(() => {
    const f = t.fields
    const toolOptions = tools.map((x) => ({ value: x.id, label: x.name }))
    const picked = (data: Record<string, unknown>) =>
      strings(data.tools).flatMap((id) => tools.find((x) => x.id === id) ?? [])
    const toolNames = (data: Record<string, unknown>) =>
      strings(data.tools).map((id) => tools.find((x) => x.id === id)?.name ?? id)
    const stateOptions = state.filter((x) => x.name).map((x) => ({ value: x.name, label: x.name }))
    const multi = (
      name: string,
      label: string,
      placeholder: string,
      options: (data: Record<string, unknown>) => { value: string; label: string }[],
      description?: string,
    ): NodeField => ({
      name,
      label,
      ...(description ? { description } : {}),
      type: 'custom',
      render: ({ id, value, onChange, describedBy, invalid, data }) => (
        <MultiSelect
          id={id}
          options={options(data)}
          value={strings(value)}
          onValueChange={onChange}
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
      ),
    })
    const toolsField = multi('tools', f.tools, f.toolsPlaceholder, () => toolOptions)
    const toolSettings: NodeField[] = tools.length
      ? [
          ...(tools.some((x) => paramsOf(x).length)
            ? [
                {
                  name: 'toolArgs',
                  label: f.toolArgs,
                  description: f.toolArgsHint,
                  type: 'custom' as const,
                  render: ({ id, labelId, value, onChange, describedBy, data }) => (
                    <ToolArgsEditor
                      id={id}
                      labelId={labelId}
                      tools={picked(data)}
                      value={value}
                      onChange={onChange}
                      describedBy={describedBy}
                    />
                  ),
                } satisfies NodeField,
              ]
            : []),
          multi(
            'askFirst',
            f.askFirst,
            f.askFirstPlaceholder,
            (data) => picked(data).map((x) => ({ value: x.id, label: x.name })),
            f.askFirstHint,
          ),
        ]
      : []
    const io: NodeField[] = stateOptions.length
      ? [
          multi('reads', f.reads, f.statePlaceholder, () => stateOptions, f.readsHint),
          multi('writes', f.writes, f.statePlaceholder, () => stateOptions, f.writesHint),
        ]
      : []
    const pause: NodeField = {
      name: 'pause',
      label: f.pause,
      description: f.pauseHint,
      type: 'select',
      options: (['none', 'before', 'after'] as const).map((v) => ({
        value: v,
        label: f.pauseOptions[v],
      })),
      placeholder: f.pauseOptions.none,
    }
    const limits: NodeField[] = [
      {
        name: 'maxSteps',
        label: f.maxSteps,
        description: f.maxStepsHint,
        type: 'number',
        min: 1,
        step: 1,
      },
      { name: 'maxTokens', label: f.maxTokens, type: 'number', min: 1, step: 1 },
      { name: 'timeout', label: f.timeout, type: 'number', min: 1, step: 1 },
    ]
    /** "reads topic → writes brief", for the card. */
    const flow = (data: Record<string, unknown>) => {
      const w = strings(data.writes)
      return w.length ? t.writesSummary(w.join(', ')) : ''
    }
    const paused = (data: Record<string, unknown>) =>
      data.pause === 'before' || data.pause === 'after' ? t.pausedSummary : ''
    const join = (...parts: string[]) => parts.filter(Boolean).join(' · ') || undefined

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
                label: f.model,
                type: 'custom',
                required: true,
                render: ({ id, labelId, value, onChange, invalid, describedBy }) => (
                  <ModelPicker
                    id={id}
                    variant="outline"
                    models={models}
                    value={typeof value === 'string' ? value : ''}
                    onValueChange={onChange}
                    placeholder={f.modelPlaceholder}
                    aria-labelledby={labelId}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                  />
                ),
              }
            : { name: 'model', label: f.model, type: 'text', required: true },
          {
            name: 'instructions',
            label: f.instructions,
            description: f.instructionsHint,
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
          ...toolSettings,
          {
            name: 'outputSchema',
            label: f.outputSchema,
            description: f.outputSchemaHint,
            type: 'code',
            language: 'json',
            rows: 6,
            placeholder: '{ "type": "object", "properties": { … } }',
          },
          ...io,
          ...limits,
          pause,
        ],
        summary: (data) => {
          const model =
            models.find((m) => m.id === data.model)?.name ??
            (typeof data.model === 'string' ? data.model : '')
          const n = strings(data.tools).length
          const structured =
            typeof data.outputSchema === 'string' && data.outputSchema.trim()
              ? t.structuredSummary
              : ''
          return join(model, n ? t.toolCount(n) : '', structured, flow(data), paused(data))
        },
      },
      {
        type: 'tool',
        label: t.kinds.tool.label,
        description: t.kinds.tool.description,
        category: t.categories.agents,
        icon: WrenchIcon,
        defaults: { tools: [] },
        fields: tools.length
          ? [{ ...toolsField, required: true }, ...toolSettings, ...io, pause]
          : [...io, pause],
        summary: (data) => join(toolNames(data).join(', '), paused(data)),
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
            label: f.description,
            description: f.descriptionHint,
            type: 'textarea',
            rows: 3,
          },
          ...io,
          pause,
        ],
        summary: (data) =>
          join(
            (typeof data.description === 'string' && data.description) || '',
            data.description ? '' : flow(data),
            paused(data),
          ),
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
            label: f.routes,
            description: f.routesHint,
            placeholder: f.routesPlaceholder,
            type: 'list',
            required: true,
          },
          { name: 'condition', label: f.condition, type: 'textarea', rows: 3 },
          ...(stateOptions.length
            ? [multi('reads', f.reads, f.statePlaceholder, () => stateOptions, f.readsHint)]
            : []),
        ],
        summary: (data) => (typeof data.condition === 'string' && data.condition) || undefined,
      },
      {
        type: 'human',
        label: t.kinds.human.label,
        description: t.kinds.human.description,
        category: t.categories.people,
        icon: UserCheckIcon,
        defaults: { decisions: ['approve', 'reject', 'respond'] },
        fields: [
          { name: 'question', label: f.question, type: 'textarea', rows: 3 },
          multi('decisions', f.decisions, f.decisionsPlaceholder, () =>
            DECISIONS.map((d) => ({ value: d, label: t.decisions[d] })),
          ),
          ...(stateOptions.length
            ? [
                multi('reads', f.reads, f.statePlaceholder, () => stateOptions, f.readsHint),
                multi(
                  'writes',
                  f.writes,
                  f.statePlaceholder,
                  () => stateOptions,
                  f.answerWritesHint,
                ),
              ]
            : []),
        ],
        summary: (data) => (typeof data.question === 'string' && data.question) || undefined,
      },
      {
        type: 'subgraph',
        label: t.kinds.subgraph.label,
        description: t.kinds.subgraph.description,
        category: t.categories.logic,
        icon: NetworkIcon,
        fields: [{ name: 'graph', label: f.graph, type: 'text', required: true }, ...io, pause],
        summary: (data) => join((typeof data.graph === 'string' && data.graph) || '', paused(data)),
      },
    ]
    return kinds
  }, [t, models, tools, state])
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

/** Adds the sensitive tools a node just picked to its `askFirst`, as the agent form does. */
function askFirstSensitive(
  prev: Workflow,
  next: Workflow,
  tools: readonly AgentBuilderTool[],
): Workflow {
  const sensitive = new Set(tools.filter((x) => x.sensitive).map((x) => x.id))
  if (!sensitive.size) return next
  const before = new Map(prev.nodes.map((n) => [n.id, strings(n.data?.tools)]))
  const nodes = next.nodes.map((n) => {
    const had = before.get(n.id)
    if (!had) return n
    const added = strings(n.data?.tools).filter((x) => !had.includes(x) && sensitive.has(x))
    const ask = strings(n.data?.askFirst)
    const missing = added.filter((x) => !ask.includes(x))
    if (!missing.length) return n
    return { ...n, data: { ...n.data, askFirst: [...ask, ...missing] } }
  })
  return nodes.some((n, i) => n !== next.nodes[i]) ? { ...next, nodes } : next
}

const defaultDecisions = (i: AgentInterrupt): readonly AgentDecisionType[] =>
  i.decisions ??
  (i.actions?.length ? ['approve', 'edit', 'reject'] : ['approve', 'reject', 'respond'])

/** One tool call's decision while the person makes it. */
interface Draft {
  type: AgentDecisionType
  args: string
  message: string
}

/**
 * A paused run's review: each tool call with its arguments, and approve, edit (the arguments as
 * JSON) or reject with a reason; or, for a question, an answer. Sends one decision per call.
 */
function InterruptReview({
  interrupt,
  nodeName,
  onResume,
  onDone,
}: {
  interrupt: AgentInterrupt
  nodeName: string
  onResume: (resume: AgentResume) => void
  onDone: () => void
}) {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  const baseId = React.useId()
  const actions = interrupt.actions ?? []
  const allowed = defaultDecisions(interrupt)
  const [drafts, setDrafts] = React.useState<Draft[]>(() =>
    actions.map((a) => ({
      type: (a.decisions ?? allowed).includes('approve')
        ? 'approve'
        : ((a.decisions ?? allowed)[0] ?? 'approve'),
      args: JSON.stringify(a.args, null, 2),
      message: '',
    })),
  )
  const [answer, setAnswer] = React.useState('')
  const [error, setError] = React.useState<number | null>(null)

  const send = (decisions: AgentDecision[]) => {
    onResume({ nodeId: interrupt.nodeId, decisions })
    onDone()
  }
  const submit = () => {
    const decisions: AgentDecision[] = []
    for (const [i, a] of actions.entries()) {
      const d = drafts[i]
      if (d.type === 'edit') {
        let args: unknown
        try {
          args = JSON.parse(d.args) as unknown
        } catch {
          args = undefined
        }
        if (!isRecord(args)) {
          setError(i)
          document.getElementById(`${baseId}-${String(i)}-args`)?.focus()
          return
        }
        decisions.push({ type: 'edit', edited_action: { name: a.name, args } })
      } else if (d.type === 'reject')
        decisions.push({
          type: 'reject',
          ...(d.message.trim() ? { message: d.message.trim() } : {}),
        })
      else if (d.type === 'respond') decisions.push({ type: 'respond', message: d.message })
      else decisions.push({ type: 'approve' })
    }
    send(decisions)
  }
  const set = (i: number, patch: Partial<Draft>) => {
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)))
    setError(null)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.review.title}</DialogTitle>
        <DialogDescription>{t.review.pausedAt(nodeName)}</DialogDescription>
      </DialogHeader>
      {interrupt.question && (
        <p className="m-0 text-[14px] text-foreground">{interrupt.question}</p>
      )}
      {actions.length > 0 ? (
        <ol className="m-0 flex max-h-[55vh] list-none flex-col gap-4 overflow-y-auto p-0">
          {actions.map((a, i) => {
            const d = drafts[i]
            const id = `${baseId}-${String(i)}`
            const choices = (a.decisions ?? allowed).filter((x) => x !== 'respond')
            return (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- the calls of one interrupt don't move
              <li key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
                <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-[13px]">
                  <span className="font-mono font-semibold">{a.name}</span>
                  {a.description && <span className="text-muted-foreground">{a.description}</span>}
                </p>
                <RadioGroup
                  value={d.type}
                  onValueChange={(v) => {
                    if (DECISIONS.includes(v as AgentDecisionType))
                      set(i, { type: v as AgentDecisionType })
                  }}
                  aria-label={t.review.decisionFor(a.name)}
                  className="flex flex-wrap gap-x-4 gap-y-2"
                >
                  {choices.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <RadioGroupItem id={`${id}-${c}`} value={c} />
                      <label htmlFor={`${id}-${c}`} className="text-[13px]">
                        {t.decisions[c]}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
                {d.type === 'edit' ? (
                  <>
                    <label htmlFor={`${id}-args`} className="text-[12.5px] font-medium">
                      {t.review.args}
                    </label>
                    <Textarea
                      id={`${id}-args`}
                      rows={5}
                      spellCheck={false}
                      value={d.args}
                      aria-invalid={error === i || undefined}
                      aria-describedby={error === i ? `${id}-err` : undefined}
                      className="font-mono text-[12px]"
                      onChange={(e) => {
                        set(i, { args: e.target.value })
                      }}
                    />
                    {error === i && (
                      <p id={`${id}-err`} role="alert" className="m-0 text-[12px] text-destructive">
                        {t.review.invalidArgs}
                      </p>
                    )}
                  </>
                ) : (
                  <pre className="m-0 max-h-40 overflow-auto rounded bg-muted p-2 font-mono text-[12px] whitespace-pre-wrap">
                    {JSON.stringify(a.args, null, 2)}
                  </pre>
                )}
                {d.type === 'reject' && (
                  <>
                    <label htmlFor={`${id}-why`} className="text-[12.5px] font-medium">
                      {t.review.reason}
                    </label>
                    <Input
                      id={`${id}-why`}
                      value={d.message}
                      autoComplete="off"
                      onChange={(e) => {
                        set(i, { message: e.target.value })
                      }}
                    />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        allowed.includes('respond') && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${baseId}-answer`} className="text-[12.5px] font-medium">
              {t.review.answer}
            </label>
            <Textarea
              id={`${baseId}-answer`}
              rows={3}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
              }}
            />
          </div>
        )
      )}
      <DialogFooter>
        <Button variant="ghost" onClick={onDone}>
          {t.review.later}
        </Button>
        {actions.length > 0 ? (
          <Button onClick={submit}>{t.review.send}</Button>
        ) : (
          <>
            {allowed.includes('reject') && (
              <Button
                variant="outline"
                onClick={() => {
                  send([{ type: 'reject', ...(answer.trim() ? { message: answer.trim() } : {}) }])
                }}
              >
                {t.decisions.reject}
              </Button>
            )}
            {allowed.includes('respond') && (
              <Button
                variant={allowed.includes('approve') ? 'outline' : 'default'}
                disabled={!answer.trim()}
                onClick={() => {
                  send([{ type: 'respond', message: answer.trim() }])
                }}
              >
                {t.review.send}
              </Button>
            )}
            {allowed.includes('approve') && (
              <Button
                onClick={() => {
                  send([{ type: 'approve' }])
                }}
              >
                {t.decisions.approve}
              </Button>
            )}
          </>
        )}
      </DialogFooter>
    </>
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
  config: configProp,
  defaultConfig = {},
  onConfigChange,
  onSave,
  onRun,
  running,
  runs,
  onRunNode,
  interrupt,
  onResume,
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
  /** The graph's settings (recursion limit), edited under State. */
  config?: AgentGraphConfig
  defaultConfig?: AgentGraphConfig
  onConfigChange?: (config: AgentGraphConfig) => void
  /** Gets the graph, its LangGraph JSON and config, and its name. */
  onSave?: (graph: {
    workflow: Workflow
    json: LangGraphJSON
    config: LangGraphConfig
    name: string
  }) => Promise<unknown> | undefined
  /**
   * Gets the graph, its LangGraph JSON and what `compile()` / `invoke()` take: run it in your app
   * and report through `runs` (and `interrupt` when it pauses).
   */
  onRun?: (graph: { workflow: Workflow; json: LangGraphJSON; config: LangGraphConfig }) => void
  running?: boolean
  runs?: Partial<Record<string, NodeRun>>
  /** Runs one node in your app, for "Test node" (see NodeEditor). */
  onRunNode?: NodeEditorProps['onRunNode']
  /** Where your run paused for a person; a Review dialog opens for it. Clear it once resumed. */
  interrupt?: AgentInterrupt | null
  /** The person's decisions: resume your run with them (`Command(resume=…)`). */
  onResume?: (resume: AgentResume) => void
  readOnly?: boolean
  /** The node whose settings show first. */
  defaultSelectedId?: string
  height?: number
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.agentBuilder
  const [fieldsState, setFieldsState] = React.useState(defaultState)
  const fields = stateProp ?? fieldsState
  const kinds = useAgentBuilderKinds({
    ...(models ? { models } : {}),
    ...(tools ? { tools } : {}),
    state: fields,
  })
  const [configState, setConfigState] = React.useState(defaultConfig)
  const graphConfig = configProp ?? configState
  const [graphState, setGraphState] = React.useState<Workflow>(defaultValue ?? emptyAgentGraph)
  const workflow = value ?? graphState
  const [nameState, setNameState] = React.useState(defaultName ?? '')
  const currentName = name ?? nameState
  const [dialog, setDialog] = React.useState<'state' | 'json' | 'review' | null>(null)
  // A new interrupt opens the review once; "Later" closes it and Review opens it again.
  const [seenInterrupt, setSeenInterrupt] = React.useState<AgentInterrupt | null | undefined>(null)
  if (interrupt !== seenInterrupt) {
    setSeenInterrupt(interrupt)
    if (interrupt && onResume) setDialog('review')
    else if (dialog === 'review') setDialog(null)
  }
  const limitId = React.useId()
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState('')
  // Bumped on import so the editor remounts and fits the new graph in view.
  const [generation, setGeneration] = React.useState(0)
  const jsonId = React.useId()

  const setWorkflow = (next: Workflow) => {
    const checked = askFirstSensitive(workflow, next, tools ?? [])
    setGraphState(checked)
    onValueChange?.(checked)
  }
  const setConfig = (next: AgentGraphConfig) => {
    setConfigState(next)
    onConfigChange?.(next)
  }
  const exportGraph = (wf: Workflow) => ({
    workflow: wf,
    json: toLangGraphJSON(wf, fields, graphConfig),
    config: toLangGraphConfig(wf, graphConfig),
  })
  const setFields = (next: StateField[]) => {
    setFieldsState(next)
    onStateChange?.(next)
  }

  const openJson = () => {
    setDraft(JSON.stringify(toLangGraphJSON(workflow, fields, graphConfig), null, 2))
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
    if (Object.keys(parsed.config).length) setConfig(parsed.config)
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
              onSave: (wf: Workflow, n: string) => onSave({ ...exportGraph(wf), name: n }),
            }
          : {})}
        {...(onRun
          ? {
              onRun: (wf: Workflow) => {
                onRun(exportGraph(wf))
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
            {interrupt && onResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDialog('review')
                }}
              >
                <UserCheckIcon aria-hidden />
                {t.review.open}
              </Button>
            )}
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
          <div className="flex flex-col gap-1.5 border-t border-border pt-4">
            <label htmlFor={limitId} className="text-[13px] font-medium">
              {t.recursionLimit}
            </label>
            <Input
              id={limitId}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="25"
              readOnly={readOnly}
              value={graphConfig.recursionLimit ?? ''}
              aria-describedby={`${limitId}-hint`}
              className="w-32"
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10)
                const { recursionLimit: _, ...rest } = graphConfig
                setConfig(Number.isInteger(n) && n > 0 ? { ...rest, recursionLimit: n } : rest)
              }}
            />
            <p id={`${limitId}-hint`} className="m-0 text-[12.5px] text-muted-foreground">
              {t.recursionLimitHint}
            </p>
          </div>
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
      {interrupt && onResume && (
        <Dialog
          open={dialog === 'review'}
          onOpenChange={(open) => {
            setDialog(open ? 'review' : null)
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <InterruptReview
              key={interrupt.nodeId + JSON.stringify(interrupt.actions ?? [])}
              interrupt={interrupt}
              nodeName={
                workflow.nodes.find((n) => n.id === interrupt.nodeId)?.name ?? interrupt.nodeId
              }
              onResume={onResume}
              onDone={() => {
                setDialog(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export {
  AgentBuilder,
  type AgentBuilderTool,
  type AgentDecision,
  type AgentDecisionType,
  type AgentGraphConfig,
  type AgentInterrupt,
  type AgentInterruptAction,
  type AgentNodeType,
  type AgentPause,
  type AgentResume,
  emptyAgentGraph,
  fromLangGraphJSON,
  type LangGraphConfig,
  type LangGraphEdgeJSON,
  type LangGraphJSON,
  type LangGraphNodeJSON,
  StateEditor,
  type StateField,
  type StateFieldType,
  toLangGraphConfig,
  toLangGraphJSON,
  type ToolParameter,
  type ToolParameters,
  useAgentBuilderKinds,
}
