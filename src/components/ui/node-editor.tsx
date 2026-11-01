'use client'

// Coreloom UI — NodeEditor. A canvas of nodes joined by connections, n8n-style: drag nodes, draw a
// connection from an output to an input, configure the selected node in a side panel. The app
// declares its kinds of node (ports, fields, icon); the editor knows nothing about what they do and
// runs nothing — `runs` shows what the app's own run reports. Built on React Flow (@xyflow/react);
// everything a pointer does also works from the keyboard through the panel.
import '@xyflow/react/dist/base.css'

import {
  Background,
  BackgroundVariant,
  BaseEdge,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  getBezierPath,
  Handle,
  MarkerType,
  type Node,
  type NodeChange,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useInternalNode,
  useReactFlow,
} from '@xyflow/react'
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDotIcon,
  ClockIcon,
  CopyIcon,
  Loader2Icon,
  MaximizeIcon,
  MinusIcon,
  NetworkIcon,
  PlusIcon,
  Redo2Icon,
  Trash2Icon,
  Undo2Icon,
  WorkflowIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TagsInput } from '@/components/ui/tags-input'
import { Textarea } from '@/components/ui/textarea'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A connection point. `label` names it on the card when a node has several ("true", "false"). */
interface NodePort {
  id: string
  label?: string
}

interface NodeFieldOption {
  value: string
  label: string
}

/** What a `custom` field's `render` gets: wire `id` and the aria props to your control. */
interface NodeFieldRenderProps {
  id: string
  labelId: string
  value: unknown
  onChange: (value: unknown) => void
  invalid: boolean
  describedBy?: string
  /** The node's whole data, for fields that depend on another. */
  data: Record<string, unknown>
}

interface NodeFieldBase {
  /** The key in the node's `data`. */
  name: string
  label: string
  description?: string
  required?: boolean
}

/** One setting of a node, drawn in the panel. Values live in the node's `data` under `name`. */
type NodeField =
  | (NodeFieldBase & { type: 'text'; placeholder?: string })
  | (NodeFieldBase & { type: 'textarea'; placeholder?: string; rows?: number })
  | (NodeFieldBase & { type: 'number'; min?: number; max?: number; step?: number })
  | (NodeFieldBase & { type: 'select'; options: NodeFieldOption[]; placeholder?: string })
  | (NodeFieldBase & { type: 'switch' })
  /** A list of short strings (`string[]`), typed as tags. */
  | (NodeFieldBase & { type: 'list'; placeholder?: string })
  | (NodeFieldBase & { type: 'custom'; render: (props: NodeFieldRenderProps) => React.ReactNode })

/** A kind of node the app offers: how it looks, its ports and its settings. */
interface NodeKind {
  type: string
  label: string
  description?: string
  /** Groups the "Add node" list ("Triggers", "Logic"). */
  category?: string
  icon?: React.ComponentType<{ className?: string }>
  /** Default: one input. `[]` for a trigger, which starts a flow. */
  inputs?: NodePort[]
  /** Default: one output. A function when the outputs depend on the settings (one per route). */
  outputs?: NodePort[] | ((data: Record<string, unknown>) => NodePort[])
  fields?: NodeField[]
  /** The `data` of a new node. */
  defaults?: Record<string, unknown>
  /** A line on the card that sums up the settings ("Every day at 9:00"). */
  summary?: (data: Record<string, unknown>) => string | undefined
  /** How many a workflow may hold (1 for a start node). */
  max?: number
  /** False keeps it on the canvas: it can't be deleted. */
  removable?: boolean
  /** Not offered in "Add node" (the app places it). */
  hidden?: boolean
}

interface WorkflowNode {
  id: string
  /** A `NodeKind['type']`. */
  type: string
  position: { x: number; y: number }
  /** Shown on the card; defaults to the kind's label. */
  name?: string
  data?: Record<string, unknown>
}

interface WorkflowEdge {
  id: string
  source: string
  /** The output's id; the first output when left out. */
  sourcePort?: string
  target: string
  /** The input's id; the first input when left out. */
  targetPort?: string
}

/** The graph the editor edits. Plain data: store it, send it, diff it. */
interface Workflow {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

type NodeRunStatus = 'running' | 'waiting' | 'success' | 'error' | 'skipped'

/** What the app's run says about one node. */
interface NodeRun {
  status: NodeRunStatus
  /** A short result or error ("3 items", "Timed out"). */
  message?: string
}

/** Something to fix before the workflow can run. `validateWorkflow` returns these. */
type WorkflowIssue =
  | { nodeId: string; code: 'required'; field: string }
  | { nodeId: string; code: 'unconnectedInput' }
  | { nodeId: string; code: 'unconnectedOutput'; port: string }
  | { nodeId: string; code: 'tooMany'; max: number }

const NODE_W = 240
const COL_GAP = 120
const ROW_GAP = 48
const DEFAULT_INPUTS: NodePort[] = [{ id: 'in' }]
const DEFAULT_OUTPUTS: NodePort[] = [{ id: 'out' }]
const EMPTY: Record<string, unknown> = {}
const NO_RUNS: Partial<Record<string, NodeRun>> = {}

/** The node's ports, from its kind (and, for computed outputs, its settings). */
function nodePorts(kind: NodeKind | undefined, data: Record<string, unknown> = EMPTY) {
  const outputs = kind?.outputs
  return {
    inputs: kind?.inputs ?? DEFAULT_INPUTS,
    outputs: typeof outputs === 'function' ? outputs(data) : (outputs ?? DEFAULT_OUTPUTS),
  }
}

function kindMap(kinds: readonly NodeKind[]) {
  return new Map(kinds.map((k) => [k.type, k]))
}

const sourcePortOf = (e: WorkflowEdge, kinds: Map<string, NodeKind>, wf: Workflow) => {
  if (e.sourcePort !== undefined) return e.sourcePort
  const n = wf.nodes.find((x) => x.id === e.source)
  return n ? nodePorts(kinds.get(n.type), n.data).outputs.at(0)?.id : undefined
}
const targetPortOf = (e: WorkflowEdge, kinds: Map<string, NodeKind>, wf: Workflow) => {
  if (e.targetPort !== undefined) return e.targetPort
  const n = wf.nodes.find((x) => x.id === e.target)
  return n ? nodePorts(kinds.get(n.type), n.data).inputs.at(0)?.id : undefined
}

/** An id not used yet: "agent", then "agent-2", "agent-3"… Deterministic, so tests can name it. */
function freeId(base: string, taken: ReadonlySet<string>) {
  const clean = base.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'node'
  if (!taken.has(clean)) return clean
  for (let i = 2; ; i++) if (!taken.has(`${clean}-${String(i)}`)) return `${clean}-${String(i)}`
}

/** A name not used yet: "Agent", then "Agent 2"… */
function freeName(base: string, taken: ReadonlySet<string>) {
  if (!taken.has(base)) return base
  for (let i = 2; ; i++) if (!taken.has(`${base} ${String(i)}`)) return `${base} ${String(i)}`
}

const displayName = (n: WorkflowNode, kind: NodeKind | undefined) => n.name ?? kind?.label ?? n.type

/**
 * Adds a node of `kind`. With `after`, it goes to the right of that node and its output is
 * connected to the new node's input. Returns the new graph and the new node's id.
 */
function addNode(
  wf: Workflow,
  kind: NodeKind,
  options: {
    position?: { x: number; y: number }
    after?: { nodeId: string; port?: string }
    kinds?: readonly NodeKind[]
  } = {},
): { workflow: Workflow; id: string } {
  const id = freeId(kind.type, new Set(wf.nodes.map((n) => n.id)))
  const kinds = kindMap(options.kinds ?? [kind])
  const names = new Set(wf.nodes.map((n) => displayName(n, kinds.get(n.type))))
  const from = options.after ? wf.nodes.find((n) => n.id === options.after?.nodeId) : undefined
  const position =
    options.position ??
    (from ? { x: from.position.x + NODE_W + COL_GAP, y: from.position.y } : { x: 0, y: 0 })
  const node: WorkflowNode = {
    id,
    type: kind.type,
    position,
    ...(names.has(kind.label) ? { name: freeName(kind.label, names) } : {}),
    data: { ...kind.defaults },
  }
  let next: Workflow = { ...wf, nodes: [...wf.nodes, node] }
  if (from && nodePorts(kind, node.data).inputs.length) {
    const port = options.after?.port ?? nodePorts(kinds.get(from.type), from.data).outputs.at(0)?.id
    if (port !== undefined)
      next = connectNodes(next, { source: from.id, sourcePort: port, target: id }, options.kinds)
  }
  return { workflow: next, id }
}

/** Whether a connection may be drawn: both ends exist, not a node to itself, not twice. */
function canConnect(
  wf: Workflow,
  c: { source: string; sourcePort?: string; target: string; targetPort?: string },
  kinds: readonly NodeKind[] = [],
) {
  if (c.source === c.target) return false
  const map = kindMap(kinds)
  const a = wf.nodes.find((n) => n.id === c.source)
  const b = wf.nodes.find((n) => n.id === c.target)
  if (!a || !b) return false
  const outs = nodePorts(map.get(a.type), a.data).outputs
  const ins = nodePorts(map.get(b.type), b.data).inputs
  // Without kinds every node has the default ports, so only the ends and duplicates are checked.
  if (kinds.length) {
    if (!outs.length || !ins.length) return false
    if (c.sourcePort !== undefined && !outs.some((p) => p.id === c.sourcePort)) return false
    if (c.targetPort !== undefined && !ins.some((p) => p.id === c.targetPort)) return false
  }
  const sp = c.sourcePort ?? outs[0]?.id
  const tp = c.targetPort ?? ins[0]?.id
  return !wf.edges.some(
    (e) =>
      e.source === c.source &&
      e.target === c.target &&
      sourcePortOf(e, map, wf) === sp &&
      targetPortOf(e, map, wf) === tp,
  )
}

/** Adds a connection if `canConnect` allows it; otherwise returns the graph unchanged. */
function connectNodes(
  wf: Workflow,
  c: { source: string; sourcePort?: string; target: string; targetPort?: string },
  kinds: readonly NodeKind[] = [],
): Workflow {
  if (!canConnect(wf, c, kinds)) return wf
  const id = freeId(
    `${c.source}-${c.sourcePort ?? 'out'}-${c.target}`,
    new Set(wf.edges.map((e) => e.id)),
  )
  const edge: WorkflowEdge = { id, source: c.source, target: c.target }
  if (c.sourcePort !== undefined) edge.sourcePort = c.sourcePort
  if (c.targetPort !== undefined) edge.targetPort = c.targetPort
  return { ...wf, edges: [...wf.edges, edge] }
}

/** Removes nodes (except kinds marked `removable: false`) and their connections. */
function removeNodes(wf: Workflow, ids: readonly string[], kinds: readonly NodeKind[] = []) {
  const map = kindMap(kinds)
  const gone = new Set(
    ids.filter((id) => {
      const n = wf.nodes.find((x) => x.id === id)
      return n && map.get(n.type)?.removable !== false
    }),
  )
  if (!gone.size) return wf
  return {
    nodes: wf.nodes.filter((n) => !gone.has(n.id)),
    edges: wf.edges.filter((e) => !gone.has(e.source) && !gone.has(e.target)),
  }
}

function removeEdges(wf: Workflow, ids: readonly string[]): Workflow {
  const gone = new Set(ids)
  return { ...wf, edges: wf.edges.filter((e) => !gone.has(e.id)) }
}

/**
 * Changes one node. Connections from outputs that no longer exist (a route removed) are dropped, so
 * the graph never points at a port the card doesn't show.
 */
function updateNode(
  wf: Workflow,
  id: string,
  patch: { name?: string; data?: Record<string, unknown>; position?: { x: number; y: number } },
  kinds: readonly NodeKind[] = [],
): Workflow {
  const nodes = wf.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n))
  const node = nodes.find((n) => n.id === id)
  if (!node || !patch.data || !kinds.length) return { ...wf, nodes }
  const map = kindMap(kinds)
  const { inputs, outputs } = nodePorts(map.get(node.type), node.data)
  const outIds = new Set(outputs.map((p) => p.id))
  const inIds = new Set(inputs.map((p) => p.id))
  const next = { ...wf, nodes }
  return {
    nodes,
    edges: wf.edges.filter((e) => {
      if (e.source === id) {
        const p = sourcePortOf(e, map, next)
        if (p === undefined || !outIds.has(p)) return false
      }
      if (e.target === id) {
        const p = targetPortOf(e, map, next)
        if (p === undefined || !inIds.has(p)) return false
      }
      return true
    }),
  }
}

/** Copies a node (settings included, connections not) a little below and to the right. */
function duplicateNode(wf: Workflow, id: string, kinds: readonly NodeKind[] = []) {
  const n = wf.nodes.find((x) => x.id === id)
  const kind = n ? kindMap(kinds).get(n.type) : undefined
  if (!n) return { workflow: wf, id }
  const count = wf.nodes.filter((x) => x.type === n.type).length
  if (kind?.max !== undefined && count >= kind.max) return { workflow: wf, id }
  const copyId = freeId(n.id, new Set(wf.nodes.map((x) => x.id)))
  const names = new Set(wf.nodes.map((x) => displayName(x, kindMap(kinds).get(x.type))))
  const copy: WorkflowNode = {
    ...n,
    id: copyId,
    name: freeName(displayName(n, kind), names),
    position: { x: n.position.x + 32, y: n.position.y + 32 },
    data: structuredClone(n.data ?? {}),
  }
  return { workflow: { ...wf, nodes: [...wf.nodes, copy] }, id: copyId }
}

/**
 * Column of each node, left to right: one after the furthest node that leads to it. Loops (an
 * agent calling tools and coming back) are broken where they close, as AgentGraph does for
 * delegation.
 */
function columns(wf: Workflow) {
  const next = new Map<string, string[]>()
  for (const e of wf.edges) next.set(e.source, [...(next.get(e.source) ?? []), e.target])
  const hasInput = new Set(wf.edges.map((e) => e.target))
  const state = new Map<string, 'open' | 'done'>()
  const order: string[] = []
  const ignored = new Set<string>()
  const visit = (id: string) => {
    state.set(id, 'open')
    for (const c of next.get(id) ?? []) {
      const s = state.get(c)
      if (s === 'open') ignored.add(`${id}\u0000${c}`)
      else if (!s) visit(c)
    }
    state.set(id, 'done')
    order.push(id)
  }
  // Start from the nodes nothing leads to, so a loop is broken at its far end.
  for (const n of wf.nodes) if (!hasInput.has(n.id) && !state.has(n.id)) visit(n.id)
  for (const n of wf.nodes) if (!state.has(n.id)) visit(n.id)
  order.reverse()
  const col = new Map(wf.nodes.map((n) => [n.id, 0]))
  for (const id of order)
    for (const c of next.get(id) ?? [])
      if (!ignored.has(`${id}\u0000${c}`))
        col.set(c, Math.max(col.get(c) ?? 0, (col.get(id) ?? 0) + 1))
  return col
}

/**
 * Tidies the canvas: columns left to right in flow order, each column centred and ordered so
 * connections cross less. `heights` (measured card heights by id) spaces tall cards; 96 px otherwise.
 */
function layoutWorkflow(wf: Workflow, heights: ReadonlyMap<string, number> = new Map()): Workflow {
  if (!wf.nodes.length) return wf
  const col = columns(wf)
  const count = Math.max(...col.values()) + 1
  const byCol = Array.from({ length: count }, (_, c) => wf.nodes.filter((n) => col.get(n.id) === c))
  const y = new Map<string, number>()
  const h = (id: string) => heights.get(id) ?? 96
  const colHeight = (ns: WorkflowNode[]) =>
    ns.reduce((s, n) => s + h(n.id), 0) + Math.max(0, ns.length - 1) * ROW_GAP
  const tallest = Math.max(...byCol.map(colHeight))
  const positions = new Map<string, { x: number; y: number }>()
  byCol.forEach((ns, c) => {
    // Order by the average height of the nodes that lead here; first column keeps input order.
    const key = (n: WorkflowNode) => {
      const ys = wf.edges
        .filter((e) => e.target === n.id && y.has(e.source))
        .map((e) => (y.get(e.source) ?? 0) + h(e.source) / 2)
      return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null
    }
    const scored = ns.map((n, i) => ({ n, k: key(n), i }))
    const ordered = [
      ...scored.filter((s) => s.k !== null).sort((a, b) => (a.k ?? 0) - (b.k ?? 0) || a.i - b.i),
      ...scored.filter((s) => s.k === null),
    ].map((s) => s.n)
    let cursor = (tallest - colHeight(ordered)) / 2
    for (const n of ordered) {
      y.set(n.id, cursor)
      positions.set(n.id, { x: c * (NODE_W + COL_GAP), y: Math.round(cursor) })
      cursor += h(n.id) + ROW_GAP
    }
  })
  return {
    ...wf,
    nodes: wf.nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position })),
  }
}

const isEmptyValue = (v: unknown) =>
  v === undefined ||
  v === null ||
  (typeof v === 'string' && !v.trim()) ||
  (Array.isArray(v) && v.length === 0)

/**
 * What to fix before running: required settings left empty, nodes nothing leads to, named outputs
 * (routes) left unconnected, more nodes of a kind than its `max`.
 */
function validateWorkflow(wf: Workflow, kinds: readonly NodeKind[]): WorkflowIssue[] {
  const map = kindMap(kinds)
  const issues: WorkflowIssue[] = []
  const counts = new Map<string, number>()
  for (const n of wf.nodes) {
    const kind = map.get(n.type)
    const data = n.data ?? EMPTY
    for (const f of kind?.fields ?? [])
      if (f.required && isEmptyValue(data[f.name]))
        issues.push({ nodeId: n.id, code: 'required', field: f.name })
    const { inputs, outputs } = nodePorts(kind, data)
    if (inputs.length && !wf.edges.some((e) => e.target === n.id))
      issues.push({ nodeId: n.id, code: 'unconnectedInput' })
    if (outputs.length > 1)
      for (const p of outputs)
        if (!wf.edges.some((e) => e.source === n.id && sourcePortOf(e, map, wf) === p.id))
          issues.push({ nodeId: n.id, code: 'unconnectedOutput', port: p.id })
    counts.set(n.type, (counts.get(n.type) ?? 0) + 1)
    const max = kind?.max
    if (max !== undefined && (counts.get(n.type) ?? 0) > max)
      issues.push({ nodeId: n.id, code: 'tooMany', max })
  }
  return issues
}

const RUN = {
  running: { icon: Loader2Icon, className: 'text-primary-text', spin: true },
  waiting: { icon: ClockIcon, className: 'text-muted-foreground', spin: false },
  success: { icon: CheckIcon, className: 'text-success', spin: false },
  error: { icon: CircleAlertIcon, className: 'text-destructive', spin: false },
  skipped: { icon: MinusIcon, className: 'text-muted-foreground', spin: false },
} as const

interface CardData extends Record<string, unknown> {
  node: WorkflowNode
  kind: NodeKind | undefined
  name: string
  inputs: NodePort[]
  outputs: NodePort[]
  run: NodeRun | undefined
  issues: string[]
  readOnly: boolean
}

type CardNode = Node<CardData, 'card'>

const handleClass =
  '!size-3 !min-h-0 !min-w-0 !rounded-full !border-2 !border-border-strong !bg-card transition-colors hover:!border-primary hover:!bg-primary-subtle'

function NodeCard({ data, selected }: NodeProps<CardNode>) {
  const t = useCoreloomI18n().messages.nodeEditor
  const { node, kind, name, inputs, outputs, run, issues, readOnly } = data
  const Icon = kind?.icon ?? WorkflowIcon
  const summary = kind?.summary?.(node.data ?? EMPTY)
  const trigger = inputs.length === 0
  const Run = run ? RUN[run.status] : null
  const many = outputs.length > 1 || inputs.length > 1
  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card text-left shadow-xs transition-[border-color,box-shadow] duration-150 group-focus-visible/node:ring-[3px] group-focus-visible/node:ring-ring',
        selected
          ? 'border-primary ring-2 ring-primary/40'
          : run?.status === 'error'
            ? 'border-destructive'
            : run?.status === 'running'
              ? 'border-primary'
              : 'border-border hover:border-border-strong',
      )}
      style={{ width: NODE_W }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span
          aria-hidden
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md',
            trigger ? 'bg-primary-subtle text-primary-text' : 'bg-secondary text-fg-secondary',
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] leading-5 font-semibold text-foreground">
            {name}
          </span>
          {name !== (kind?.label ?? node.type) && (
            <span className="truncate text-[12px] leading-4 text-muted-foreground">
              {kind?.label ?? node.type}
            </span>
          )}
        </span>
        {issues.length > 0 && (
          <CircleAlertIcon aria-hidden className="size-4 shrink-0 text-warning" />
        )}
      </div>
      {summary && (
        <p className="m-0 truncate border-t border-border-subtle px-3 py-1.5 text-[12px] text-fg-secondary">
          {summary}
        </p>
      )}
      {Run && run && (
        <p
          className={cn(
            'm-0 flex items-center gap-1.5 truncate border-t border-border-subtle px-3 py-1.5 text-[12px]',
            Run.className,
          )}
        >
          <Run.icon
            aria-hidden
            className={cn(
              'size-3.5 shrink-0',
              Run.spin && 'animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite]',
            )}
          />
          <span className="truncate">
            {t.run[run.status]}
            {run.message ? ` · ${run.message}` : ''}
          </span>
        </p>
      )}
      {many ? (
        <div className="flex justify-between gap-3 border-t border-border-subtle py-1.5">
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {inputs.map((p) => (
              <li key={p.id} className="relative flex h-5 items-center pl-3 text-[11.5px]">
                <Handle
                  type="target"
                  id={p.id}
                  position={Position.Left}
                  isConnectable={!readOnly}
                  className={handleClass}
                />
                <span className="truncate text-muted-foreground">
                  {inputs.length > 1 ? (p.label ?? p.id) : ''}
                </span>
              </li>
            ))}
          </ul>
          <ul className="m-0 flex min-w-0 list-none flex-col items-end gap-0.5 p-0">
            {outputs.map((p) => (
              <li
                key={p.id}
                className="relative flex h-5 max-w-full items-center pr-3 text-[11.5px]"
              >
                <span className="truncate font-mono text-fg-secondary">
                  {outputs.length > 1 ? (p.label ?? p.id) : ''}
                </span>
                <Handle
                  type="source"
                  id={p.id}
                  position={Position.Right}
                  isConnectable={!readOnly}
                  className={handleClass}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {inputs[0] && (
            <Handle
              type="target"
              id={inputs[0].id}
              position={Position.Left}
              isConnectable={!readOnly}
              className={handleClass}
            />
          )}
          {outputs[0] && (
            <Handle
              type="source"
              id={outputs[0].id}
              position={Position.Right}
              isConnectable={!readOnly}
              className={handleClass}
            />
          )}
        </>
      )}
    </div>
  )
}

const NODE_TYPES = { card: NodeCard }

/** A rounded orthogonal path through the given points. */
function roundedPath(points: { x: number; y: number }[], r = 10) {
  let d = ''
  points.forEach((p, i) => {
    const prev = points.at(i - 1)
    const next = points.at(i + 1)
    if (i === 0 || !prev) {
      d += `M${String(p.x)},${String(p.y)}`
      return
    }
    if (!next) {
      d += ` L${String(p.x)},${String(p.y)}`
      return
    }
    const inLen = Math.hypot(p.x - prev.x, p.y - prev.y)
    const outLen = Math.hypot(next.x - p.x, next.y - p.y)
    const k = Math.min(r, inLen / 2, outLen / 2)
    const a = {
      x: p.x - ((p.x - prev.x) / (inLen || 1)) * k,
      y: p.y - ((p.y - prev.y) / (inLen || 1)) * k,
    }
    const b = {
      x: p.x + ((next.x - p.x) / (outLen || 1)) * k,
      y: p.y + ((next.y - p.y) / (outLen || 1)) * k,
    }
    d += ` L${String(a.x)},${String(a.y)} Q${String(p.x)},${String(p.y)} ${String(b.x)},${String(b.y)}`
  })
  return d
}

/**
 * A connection. Forward it's a curve; when it goes back to an earlier node (a loop: tools back to
 * the agent) it runs below both cards instead of across them.
 */
function FlowEdge({
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  interactionWidth,
}: EdgeProps) {
  const a = useInternalNode(source)
  const b = useInternalNode(target)
  let path: string
  if (targetX >= sourceX + 24 || !a || !b) {
    ;[path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  } else {
    const bottom = (n: NonNullable<typeof a>) =>
      n.internals.positionAbsolute.y + (n.measured.height ?? 0)
    const below = Math.max(bottom(a), bottom(b)) + 28
    path = roundedPath([
      { x: sourceX, y: sourceY },
      { x: sourceX + 24, y: sourceY },
      { x: sourceX + 24, y: below },
      { x: targetX - 24, y: below },
      { x: targetX - 24, y: targetY },
      { x: targetX, y: targetY },
    ])
  }
  return (
    <BaseEdge
      path={path}
      {...(markerEnd ? { markerEnd } : {})}
      {...(style ? { style } : {})}
      {...(interactionWidth !== undefined ? { interactionWidth } : {})}
    />
  )
}

const EDGE_TYPES = { flow: FlowEdge }

/** The "Add node" list: the kinds by category, searchable. */
function NodePalette({
  kinds,
  disabledTypes,
  onPick,
}: {
  kinds: readonly NodeKind[]
  disabledTypes: ReadonlySet<string>
  onPick: (kind: NodeKind) => void
}) {
  const t = useCoreloomI18n().messages.nodeEditor
  const shown = kinds.filter((k) => !k.hidden)
  const categories = [...new Set(shown.map((k) => k.category ?? ''))]
  return (
    <Command>
      <CommandInput placeholder={t.searchNodes} />
      <CommandList>
        <CommandEmpty>{t.noNodes}</CommandEmpty>
        {categories.map((c) => (
          <CommandGroup key={c || '-'} heading={c || undefined}>
            {shown
              .filter((k) => (k.category ?? '') === c)
              .map((k) => {
                const Icon = k.icon ?? WorkflowIcon
                return (
                  <CommandItem
                    key={k.type}
                    value={`${k.label} ${k.description ?? ''} ${k.type}`}
                    disabled={disabledTypes.has(k.type)}
                    onSelect={() => {
                      onPick(k)
                    }}
                    className="items-start"
                  >
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[13px] font-medium text-foreground">{k.label}</span>
                      {k.description && (
                        <span className="text-[12px] text-muted-foreground">{k.description}</span>
                      )}
                    </span>
                  </CommandItem>
                )
              })}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

function FieldControl({
  field,
  id,
  labelId,
  describedBy,
  invalid,
  data,
  readOnly,
  onChange,
}: {
  field: NodeField
  id: string
  labelId: string
  describedBy?: string
  invalid: boolean
  data: Record<string, unknown>
  readOnly: boolean
  onChange: (value: unknown) => void
}) {
  const value = data[field.name]
  const aria = {
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
  }
  switch (field.type) {
    case 'text':
      return (
        <Input
          id={id}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          readOnly={readOnly}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value)
          }}
          {...aria}
        />
      )
    case 'textarea':
      return (
        <Textarea
          id={id}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          readOnly={readOnly}
          onChange={(e) => {
            onChange(e.target.value)
          }}
          {...aria}
        />
      )
    case 'number':
      return (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={typeof value === 'number' ? String(value) : ''}
          min={field.min}
          max={field.max}
          step={field.step}
          readOnly={readOnly}
          onChange={(e) => {
            const n = e.target.valueAsNumber
            onChange(Number.isNaN(n) ? undefined : n)
          }}
          {...aria}
        />
      )
    case 'select':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          disabled={readOnly}
          onValueChange={(v) => {
            onChange(v)
          }}
        >
          <SelectTrigger id={id} className="w-full" aria-labelledby={labelId} {...aria}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'switch':
      return (
        <Switch
          id={id}
          checked={value === true}
          disabled={readOnly}
          onCheckedChange={(v) => {
            onChange(v)
          }}
          aria-describedby={describedBy}
        />
      )
    case 'list':
      return (
        <TagsInput
          id={id}
          value={
            Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
          }
          placeholder={field.placeholder}
          disabled={readOnly}
          onValueChange={(v) => {
            onChange(v)
          }}
          {...aria}
        />
      )
    case 'custom':
      return field.render({ id, labelId, value, onChange, invalid, describedBy, data })
  }
}

/** The settings and connections of one node. */
function NodeInspector({
  workflow,
  node,
  kinds,
  run,
  issues,
  readOnly,
  onChange,
  onDelete,
  onDuplicate,
  className,
}: {
  workflow: Workflow
  node: WorkflowNode
  kinds: readonly NodeKind[]
  run?: NodeRun
  issues: WorkflowIssue[]
  readOnly: boolean
  onChange: (next: Workflow, announce?: string) => void
  onDelete: () => void
  onDuplicate?: () => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.nodeEditor
  const baseId = React.useId()
  const map = kindMap(kinds)
  const kind = map.get(node.type)
  const data = node.data ?? EMPTY
  const name = displayName(node, kind)
  const { inputs, outputs } = nodePorts(kind, data)
  const nameOf = (id: string) => {
    const n = workflow.nodes.find((x) => x.id === id)
    return n ? displayName(n, map.get(n.type)) : id
  }
  const Icon = kind?.icon ?? WorkflowIcon
  const Run = run ? RUN[run.status] : null
  const issueText = useIssueText(kinds)
  const nodeIssues = issues.filter((i) => i.nodeId === node.id && i.code !== 'required')
  const outgoing = (port: string) =>
    workflow.edges.filter((e) => e.source === node.id && sourcePortOf(e, map, workflow) === port)
  const incoming = workflow.edges.filter((e) => e.target === node.id)
  const targets = workflow.nodes.filter((n) => {
    if (n.id === node.id) return false
    return nodePorts(map.get(n.type), n.data).inputs.length > 0
  })
  const atMax =
    kind?.max !== undefined && workflow.nodes.filter((n) => n.type === node.type).length >= kind.max
  const removable = kind?.removable !== false

  return (
    <div data-slot="node-inspector" className={cn('flex min-w-0 flex-col gap-5 p-4', className)}>
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-fg-secondary"
        >
          <Icon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="m-0 truncate text-[14px] font-semibold text-foreground">{name}</p>
          <p className="m-0 text-[12.5px] text-muted-foreground">
            {kind?.description ?? kind?.label ?? node.type}
          </p>
        </div>
      </div>

      {Run && run && (
        <p className={cn('m-0 flex items-center gap-1.5 text-[12.5px]', Run.className)}>
          <Run.icon aria-hidden className={cn('size-3.5', Run.spin && 'animate-spin')} />
          {t.run[run.status]}
          {run.message ? ` · ${run.message}` : ''}
        </p>
      )}

      {nodeIssues.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 rounded-md bg-warning-subtle p-2.5 text-[12.5px] text-foreground">
          {nodeIssues.map((i) => (
            <li key={`${i.code}-${'port' in i ? i.port : ''}`} className="flex items-start gap-1.5">
              <CircleAlertIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />
              {issueText(i, workflow)}
            </li>
          ))}
        </ul>
      )}

      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`${baseId}-name`}>{t.name}</FieldLabel>
          <Input
            id={`${baseId}-name`}
            value={node.name ?? ''}
            placeholder={kind?.label}
            readOnly={readOnly}
            autoComplete="off"
            onChange={(e) => {
              onChange(updateNode(workflow, node.id, { name: e.target.value || undefined }, kinds))
            }}
          />
        </Field>
        {(kind?.fields ?? []).map((f) => {
          const id = `${baseId}-f-${f.name}`
          const missing = f.required === true && isEmptyValue(data[f.name])
          const described =
            [f.description ? `${id}-desc` : '', missing ? `${id}-err` : '']
              .filter(Boolean)
              .join(' ') || undefined
          const control = (
            <FieldControl
              field={f}
              id={id}
              labelId={`${id}-label`}
              describedBy={described}
              invalid={missing}
              data={data}
              readOnly={readOnly}
              onChange={(v) => {
                onChange(updateNode(workflow, node.id, { data: { ...data, [f.name]: v } }, kinds))
              }}
            />
          )
          return f.type === 'switch' ? (
            <Field key={f.name} orientation="horizontal">
              {control}
              <div className="flex flex-col gap-0.5">
                <FieldLabel id={`${id}-label`} htmlFor={id}>
                  {f.label}
                </FieldLabel>
                {f.description && (
                  <FieldDescription id={`${id}-desc`}>{f.description}</FieldDescription>
                )}
              </div>
            </Field>
          ) : (
            <Field key={f.name}>
              <FieldLabel id={`${id}-label`} htmlFor={id}>
                {f.label}
                {f.required && <span className="sr-only"> ({t.requiredMark})</span>}
              </FieldLabel>
              {control}
              {f.description && (
                <FieldDescription id={`${id}-desc`}>{f.description}</FieldDescription>
              )}
              {missing && (
                <p id={`${id}-err`} className="m-0 text-[11px] text-destructive">
                  {t.required}
                </p>
              )}
            </Field>
          )
        })}
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {t.connections}
        </p>
        {inputs.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-[12.5px] font-medium text-fg-secondary">{t.comesFrom}</p>
            {incoming.length ? (
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {incoming.map((e) => (
                  <ConnectionChip
                    key={e.id}
                    label={nameOf(e.source)}
                    removeLabel={t.removeConnection(nameOf(e.source), name)}
                    readOnly={readOnly}
                    onRemove={() => {
                      onChange(
                        removeEdges(workflow, [e.id]),
                        t.announce.disconnected(nameOf(e.source), name),
                      )
                    }}
                  />
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[12.5px] text-muted-foreground">{t.noConnection}</p>
            )}
          </div>
        )}
        {outputs.map((p) => {
          const out = outgoing(p.id)
          const options = targets.filter((n) => !out.some((e) => e.target === n.id))
          const selectId = `${baseId}-to-${p.id}`
          return (
            <div key={p.id} className="flex flex-col gap-1.5">
              <p
                id={`${selectId}-label`}
                className="m-0 text-[12.5px] font-medium text-fg-secondary"
              >
                {outputs.length > 1 ? t.outputTo(p.label ?? p.id) : t.goesTo}
              </p>
              {out.length > 0 && (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {out.map((e) => (
                    <ConnectionChip
                      key={e.id}
                      label={nameOf(e.target)}
                      removeLabel={t.removeConnection(name, nameOf(e.target))}
                      readOnly={readOnly}
                      onRemove={() => {
                        onChange(
                          removeEdges(workflow, [e.id]),
                          t.announce.disconnected(name, nameOf(e.target)),
                        )
                      }}
                    />
                  ))}
                </ul>
              )}
              {!readOnly && options.length > 0 && (
                <Select
                  value=""
                  onValueChange={(target) => {
                    onChange(
                      connectNodes(workflow, { source: node.id, sourcePort: p.id, target }, kinds),
                      t.announce.connected(name, nameOf(target)),
                    )
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="w-full"
                    aria-labelledby={`${selectId}-label ${selectId}`}
                    id={selectId}
                  >
                    <SelectValue placeholder={t.connectTo} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {displayName(n, map.get(n.type))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {readOnly && out.length === 0 && (
                <p className="m-0 text-[12.5px] text-muted-foreground">{t.noConnection}</p>
              )}
            </div>
          )
        })}
      </div>

      {!readOnly && (
        <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-4">
          {onDuplicate && (
            <Button variant="outline" size="sm" disabled={atMax} onClick={onDuplicate}>
              <CopyIcon aria-hidden />
              {t.duplicate}
            </Button>
          )}
          {removable && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2Icon aria-hidden />
              {t.remove}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function ConnectionChip({
  label,
  removeLabel,
  readOnly,
  onRemove,
}: {
  label: string
  removeLabel: string
  readOnly: boolean
  onRemove: () => void
}) {
  return (
    <li className="flex max-w-full items-center gap-1 rounded-md border border-border bg-secondary py-0.5 pr-0.5 pl-2 text-[12.5px] text-foreground">
      <CircleDotIcon aria-hidden className="size-3 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
      {!readOnly && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <XIcon className="size-3" />
        </button>
      )}
    </li>
  )
}

/** Issues as sentences. */
function useIssueText(kinds: readonly NodeKind[]) {
  const t = useCoreloomI18n().messages.nodeEditor.issues
  return React.useCallback(
    (issue: WorkflowIssue, wf: Workflow) => {
      const map = kindMap(kinds)
      const n = wf.nodes.find((x) => x.id === issue.nodeId)
      const kind = n ? map.get(n.type) : undefined
      switch (issue.code) {
        case 'required':
          return t.required(kind?.fields?.find((f) => f.name === issue.field)?.label ?? issue.field)
        case 'unconnectedInput':
          return t.unconnectedInput
        case 'unconnectedOutput': {
          const port = n
            ? nodePorts(kind, n.data).outputs.find((p) => p.id === issue.port)
            : undefined
          return t.unconnectedOutput(port?.label ?? issue.port)
        }
        case 'tooMany':
          return t.tooMany(kind?.label ?? n?.type ?? '', issue.max)
      }
    },
    [t, kinds],
  )
}

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

interface NodeEditorProps {
  /** The kinds of node on offer. Keep the array stable (module level or memoised). */
  kinds: NodeKind[]
  /** Controlled graph. */
  value?: Workflow
  defaultValue?: Workflow
  /** Every edit, including each step of a drag. */
  onValueChange?: (workflow: Workflow) => void
  /** What the app's run says about each node, by id. */
  runs?: Partial<Record<string, NodeRun>>
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedChange?: (id: string | null) => void
  /** Look, don't touch: no dragging, connecting or editing. */
  readOnly?: boolean
  /** The side panel with the selected node's settings (default: true). */
  inspector?: boolean
  /** Flag missing settings and loose connections on the cards (default: true). */
  showIssues?: boolean
  /** Buttons for the toolbar's end: Run, Save… */
  actions?: React.ReactNode
  /** The canvas's height in px (default: 560). Below 720 px of width the panel goes underneath. */
  height?: number
  /** Names the canvas for screen readers (default: "Workflow"). */
  label?: string
  className?: string
}

function NodeEditorInner({
  kinds,
  value,
  defaultValue,
  onValueChange,
  runs = NO_RUNS,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedChange,
  readOnly = false,
  inspector = true,
  showIssues = true,
  actions,
  height = 560,
  label,
  className,
}: NodeEditorProps) {
  const t = useCoreloomI18n().messages.nodeEditor
  const flow = useReactFlow<CardNode>()
  const map = React.useMemo(() => kindMap(kinds), [kinds])

  const [state, setState] = React.useState<Workflow>(defaultValue ?? { nodes: [], edges: [] })
  const workflow = value ?? state
  // History holds whole graphs: they are small, and undo stays exact.
  const [past, setPast] = React.useState<Workflow[]>([])
  const [future, setFuture] = React.useState<Workflow[]>([])
  const [message, setMessage] = React.useState('')

  const [selState, setSelState] = React.useState<string | null>(defaultSelectedId)
  const selected = selectedProp !== undefined ? selectedProp : selState
  const select = (id: string | null) => {
    setSelState(id)
    onSelectedChange?.(id)
  }
  // Extra nodes picked with Shift (React Flow's multi-selection), on top of `selected`.
  const [multi, setMulti] = React.useState<ReadonlySet<string>>(() => new Set())
  const [selectedEdges, setSelectedEdges] = React.useState<ReadonlySet<string>>(() => new Set())
  const [measured, setMeasured] = React.useState<
    ReadonlyMap<string, { width: number; height: number }>
  >(() => new Map())
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [width, setWidth] = React.useState(0)
  const root = React.useRef<HTMLDivElement>(null)
  const addButton = React.useRef<HTMLButtonElement>(null)
  // A deleted node (or the panel that went with it) may have held focus: land on "Add node", or
  // the first card, never on <body>.
  const keepFocus = () => {
    requestAnimationFrame(() => {
      const el = root.current
      if (!el || el.contains(document.activeElement)) return
      ;(addButton.current ?? el.querySelector<HTMLElement>('.react-flow__node'))?.focus()
    })
  }

  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [])
  const stacked = width > 0 && width < 720
  // The canvas changes shape when the panel moves under it (and on first measure): fit again.
  React.useEffect(() => {
    if (!width) return
    const id = requestAnimationFrame(() => {
      void flow.fitView({ padding: 0.2, maxZoom: 1 })
    })
    return () => {
      cancelAnimationFrame(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the layout switches
  }, [stacked, width > 0])

  const emit = (next: Workflow) => {
    setState(next)
    onValueChange?.(next)
  }
  const commit = (next: Workflow, announce?: string) => {
    if (next === workflow) return
    setPast((p) => [...p.slice(-99), workflow])
    setFuture([])
    emit(next)
    if (announce) setMessage(announce)
  }
  const undo = () => {
    const prev = past.at(-1)
    if (!prev) return
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [workflow, ...f])
    emit(prev)
    setMessage(t.announce.undone)
  }
  const redo = () => {
    const next = future.at(0)
    if (!next) return
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, workflow])
    emit(next)
    setMessage(t.announce.redone)
  }

  const issues = React.useMemo(
    () => (showIssues ? validateWorkflow(workflow, kinds) : []),
    [workflow, kinds, showIssues],
  )
  const issueText = useIssueText(kinds)
  const nameOf = (id: string) => {
    const n = workflow.nodes.find((x) => x.id === id)
    return n ? displayName(n, map.get(n.type)) : id
  }

  const rfNodes = React.useMemo<CardNode[]>(
    () =>
      workflow.nodes.map((n) => {
        const kind = map.get(n.type)
        const { inputs, outputs } = nodePorts(kind, n.data)
        const nodeIssues = issues
          .filter((i) => i.nodeId === n.id)
          .map((i) => issueText(i, workflow))
        const run = runs[n.id]
        const name = displayName(n, kind)
        return {
          id: n.id,
          type: 'card',
          position: n.position,
          data: { node: n, kind, name, inputs, outputs, run, issues: nodeIssues, readOnly },
          selected: n.id === selected || multi.has(n.id),
          deletable: !readOnly && kind?.removable !== false,
          measured: measured.get(n.id),
          className: 'group/node outline-none',
          ariaLabel: [
            name,
            kind?.label,
            run ? t.run[run.status] : null,
            nodeIssues.length ? t.issueCount(nodeIssues.length) : null,
          ]
            .filter(Boolean)
            .join(', '),
        }
      }),
    [workflow, map, issues, issueText, runs, readOnly, selected, multi, measured, t],
  )

  const rfEdges = React.useMemo<Edge[]>(
    () =>
      workflow.edges.map((e) => {
        const active =
          runs[e.source]?.status === 'success' &&
          (runs[e.target]?.status === 'running' || runs[e.target]?.status === 'success')
        return {
          id: e.id,
          type: 'flow',
          source: e.source,
          target: e.target,
          sourceHandle: sourcePortOf(e, map, workflow) ?? null,
          targetHandle: targetPortOf(e, map, workflow) ?? null,
          selected: selectedEdges.has(e.id),
          deletable: !readOnly,
          animated: runs[e.target]?.status === 'running' && runs[e.source]?.status === 'success',
          className: active ? 'is-active' : undefined,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: 'var(--edge-color)',
          },
          ariaLabel: t.edgeLabel(nameOf(e.source), nameOf(e.target)),
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nameOf reads workflow, listed
    [workflow, map, runs, selectedEdges, readOnly, t],
  )

  const dragStart = React.useRef<Workflow | null>(null)
  const onNodesChange = (changes: NodeChange<CardNode>[]) => {
    let next = workflow
    let sel = selected
    const multiNext = new Set(multi)
    let dims: Map<string, { width: number; height: number }> | null = null
    const removed: string[] = []
    for (const c of changes) {
      if (c.type === 'dimensions' && c.dimensions) {
        dims ??= new Map(measured)
        dims.set(c.id, c.dimensions)
      } else if (c.type === 'position' && c.position) {
        next = updateNode(next, c.id, { position: c.position })
      } else if (c.type === 'select') {
        if (c.selected) {
          if (sel === null || sel === c.id) sel = c.id
          else multiNext.add(c.id)
        } else {
          multiNext.delete(c.id)
          if (sel === c.id) sel = [...multiNext][0] ?? null
          multiNext.delete(sel ?? '')
        }
      } else if (c.type === 'remove') removed.push(c.id)
    }
    if (dims) setMeasured(dims)
    if (removed.length) {
      const after = removeNodes(next, removed, kinds)
      commit(after, t.announce.removed(workflow.nodes.length - after.nodes.length))
      keepFocus()
      if (sel !== null && removed.includes(sel)) sel = null
    } else if (next !== workflow) emit(next)
    if (sel !== selected) select(sel)
    if (multiNext.size !== multi.size || [...multiNext].some((id) => !multi.has(id)))
      setMulti(multiNext)
  }

  const onEdgesChange = (changes: EdgeChange[]) => {
    const sel = new Set(selectedEdges)
    const removed: string[] = []
    for (const c of changes) {
      if (c.type === 'select') {
        if (c.selected) sel.add(c.id)
        else sel.delete(c.id)
      } else if (c.type === 'remove') removed.push(c.id)
    }
    setSelectedEdges(sel)
    if (removed.length)
      commit(removeEdges(workflow, removed), t.announce.edgesRemoved(removed.length))
  }

  const onConnect = (c: Connection) => {
    const next = connectNodes(
      workflow,
      {
        source: c.source,
        target: c.target,
        ...(c.sourceHandle ? { sourcePort: c.sourceHandle } : {}),
        ...(c.targetHandle ? { targetPort: c.targetHandle } : {}),
      },
      kinds,
    )
    commit(next, t.announce.connected(nameOf(c.source), nameOf(c.target)))
  }

  const counts = new Map<string, number>()
  for (const n of workflow.nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1)
  const full = new Set(
    kinds
      .filter((k) => k.max !== undefined && (counts.get(k.type) ?? 0) >= k.max)
      .map((k) => k.type),
  )

  const pick = (kind: NodeKind) => {
    setPaletteOpen(false)
    const from = selected !== null ? workflow.nodes.find((n) => n.id === selected) : undefined
    const fromHasOutput = from ? nodePorts(map.get(from.type), from.data).outputs.length > 0 : false
    let position: { x: number; y: number } | undefined
    if (!from || !fromHasOutput) {
      // The middle of what's on screen, so the new card lands in view.
      const box = root.current?.querySelector('.react-flow')?.getBoundingClientRect()
      if (box) {
        const p = flow.screenToFlowPosition({
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        })
        position = { x: Math.round(p.x - NODE_W / 2), y: Math.round(p.y - 40) }
      }
    }
    const { workflow: next, id } = addNode(workflow, kind, {
      ...(position ? { position } : {}),
      ...(from && fromHasOutput ? { after: { nodeId: from.id } } : {}),
      kinds,
    })
    commit(
      next,
      t.announce.added(
        displayName(
          next.nodes.find((n) => n.id === id) ?? { id, type: kind.type, position: { x: 0, y: 0 } },
          kind,
        ),
      ),
    )
    setMulti(new Set())
    select(id)
  }

  const tidy = () => {
    const heights = new Map([...measured].map(([id, d]) => [id, d.height]))
    commit(layoutWorkflow(workflow, heights), t.announce.arranged)
    requestAnimationFrame(() => {
      void flow.fitView({ padding: 0.2, duration: 200 })
    })
  }

  // Undo and redo anywhere in the editor except while typing in a field (which has its own undo).
  const history = React.useRef({ undo, redo, readOnly })
  React.useEffect(() => {
    history.current = { undo, redo, readOnly }
  })
  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (history.current.readOnly || isTyping(e.target)) return
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) history.current.redo()
        else history.current.undo()
      } else if (mod && key === 'y') {
        e.preventDefault()
        history.current.redo()
      }
    }
    el.addEventListener('keydown', onKeyDown)
    return () => {
      el.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const selectedNode = selected !== null ? workflow.nodes.find((n) => n.id === selected) : undefined
  const issueTotal = new Set(issues.map((i) => i.nodeId)).size

  const ariaLabelConfig = React.useMemo(
    () => ({
      'node.a11yDescription.default': t.a11y.node,
      'node.a11yDescription.keyboardDisabled': t.a11y.node,
      'node.a11yDescription.ariaLiveMessage': ({
        x,
        y,
      }: {
        direction: string
        x: number
        y: number
      }) => t.a11y.moved(Math.round(x), Math.round(y)),
      'edge.a11yDescription.default': t.a11y.edge,
      'handle.ariaLabel': t.a11y.handle,
    }),
    [t],
  )

  return (
    <div
      ref={root}
      data-slot="node-editor"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          {!readOnly && (
            <Popover open={paletteOpen} onOpenChange={setPaletteOpen}>
              <PopoverTrigger asChild>
                <Button ref={addButton} size="sm" variant="secondary">
                  <PlusIcon aria-hidden />
                  {t.addNode}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-0">
                <NodePalette kinds={kinds} disabledTypes={full} onPick={pick} />
              </PopoverContent>
            </Popover>
          )}
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.undo}
                aria-keyshortcuts="Control+Z Meta+Z"
                disabled={!past.length}
                onClick={undo}
              >
                <Undo2Icon aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.redo}
                aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
                disabled={!future.length}
                onClick={redo}
              >
                <Redo2Icon aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t.arrange}
                disabled={!workflow.nodes.length}
                onClick={tidy}
              >
                <NetworkIcon aria-hidden />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.zoomOut}
            onClick={() => {
              void flow.zoomOut({ duration: 150 })
            }}
          >
            <ZoomOutIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.zoomIn}
            onClick={() => {
              void flow.zoomIn({ duration: 150 })
            }}
          >
            <ZoomInIcon aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t.fit}
            onClick={() => {
              void flow.fitView({ padding: 0.2, duration: 200 })
            }}
          >
            <MaximizeIcon aria-hidden />
          </Button>
          {showIssues && issueTotal > 0 && (
            <span className="ml-1 flex items-center gap-1 text-[12px] text-fg-secondary">
              <CircleAlertIcon aria-hidden className="size-3.5 text-warning" />
              {t.nodesNeedAttention(issueTotal)}
            </span>
          )}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
      <div className={cn('flex min-h-0', stacked ? 'flex-col' : 'flex-row')}>
        <div
          className={cn(
            'relative min-w-0 bg-inset/40 [--edge-color:var(--color-border-strong)] [&_.is-active]:[--edge-color:var(--color-primary)] [&_.react-flow__edge.selected]:[--edge-color:var(--color-primary)]',
            // Stacked, the canvas keeps its height; side by side it takes the room the panel leaves.
            stacked ? 'w-full flex-none' : 'flex-1',
          )}
          style={{ height }}
        >
          <ReactFlow<CardNode>
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={(c) =>
              canConnect(
                workflow,
                {
                  source: c.source,
                  target: c.target,
                  ...(c.sourceHandle ? { sourcePort: c.sourceHandle } : {}),
                  ...(c.targetHandle ? { targetPort: c.targetHandle } : {}),
                },
                kinds,
              )
            }
            onNodeDragStart={() => {
              dragStart.current = workflow
            }}
            onNodeDragStop={() => {
              const before = dragStart.current
              dragStart.current = null
              if (before && before !== workflow) {
                setPast((p) => [...p.slice(-99), before])
                setFuture([])
              }
            }}
            onPaneClick={() => {
              select(null)
              setMulti(new Set())
            }}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable
            deleteKeyCode={readOnly ? null : ['Delete', 'Backspace']}
            multiSelectionKeyCode="Shift"
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
            minZoom={0.25}
            maxZoom={1.75}
            proOptions={{ hideAttribution: true }}
            ariaLabelConfig={ariaLabelConfig}
            aria-label={label ?? t.label}
            style={
              {
                '--xy-edge-stroke-default': 'var(--edge-color)',
                '--xy-edge-stroke-selected-default': 'var(--color-primary)',
                '--xy-edge-stroke-width-default': '1.75',
                '--xy-connectionline-stroke-default': 'var(--color-primary)',
                '--xy-selection-background-color-default':
                  'color-mix(in oklab, var(--color-primary) 8%, transparent)',
                '--xy-selection-border-default': '1px dashed var(--color-primary)',
              } as React.CSSProperties
            }
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.2}
              color="var(--color-border-strong)"
            />
          </ReactFlow>
          {!workflow.nodes.length && (
            <p className="pointer-events-none absolute inset-x-6 top-1/2 m-0 -translate-y-1/2 text-center text-[13px] text-muted-foreground">
              {t.empty}
            </p>
          )}
        </div>
        {inspector && (selectedNode !== undefined || !stacked) && (
          <aside
            aria-label={t.inspector}
            className={cn(
              'flex shrink-0 flex-col overflow-y-auto bg-card',
              stacked ? 'border-t border-border-subtle' : 'w-80 border-l border-border-subtle',
            )}
            style={stacked ? undefined : { height }}
          >
            {selectedNode ? (
              <NodeInspector
                key={selectedNode.id}
                workflow={workflow}
                node={selectedNode}
                kinds={kinds}
                run={runs[selectedNode.id]}
                issues={issues}
                readOnly={readOnly}
                onChange={commit}
                onDuplicate={() => {
                  const { workflow: next, id } = duplicateNode(workflow, selectedNode.id, kinds)
                  if (next === workflow) return
                  commit(next, t.announce.added(nameOf(selectedNode.id)))
                  select(id)
                }}
                onDelete={() => {
                  const name = nameOf(selectedNode.id)
                  commit(
                    removeNodes(workflow, [selectedNode.id], kinds),
                    t.announce.removedNamed(name),
                  )
                  select(null)
                  keepFocus()
                }}
              />
            ) : (
              <p className="m-0 px-4 py-10 text-center text-[13px] text-muted-foreground">
                {t.selectNode}
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

/** The whole editor: toolbar, canvas and the selected node's panel. */
function NodeEditor(props: NodeEditorProps) {
  return (
    <ReactFlowProvider>
      <NodeEditorInner {...props} />
    </ReactFlowProvider>
  )
}

export {
  addNode,
  canConnect,
  connectNodes,
  duplicateNode,
  layoutWorkflow,
  NodeEditor,
  type NodeEditorProps,
  type NodeField,
  type NodeFieldOption,
  type NodeFieldRenderProps,
  NodeInspector,
  type NodeKind,
  NodePalette,
  type NodePort,
  nodePorts,
  type NodeRun,
  type NodeRunStatus,
  removeEdges,
  removeNodes,
  updateNode,
  validateWorkflow,
  type Workflow,
  type WorkflowEdge,
  type WorkflowIssue,
  type WorkflowNode,
}
