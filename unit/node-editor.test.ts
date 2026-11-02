import { describe, expect, it } from 'vitest'

import {
  emptyAgentGraph,
  fromLangGraphJSON,
  type LangGraphJSON,
  toLangGraphJSON,
} from '@/components/ai-agent-builder'
import {
  addNode,
  canConnect,
  connectNodes,
  duplicateNode,
  layoutWorkflow,
  type NodeKind,
  nodePorts,
  removeNodes,
  updateNode,
  validateWorkflow,
  type Workflow,
} from '@/components/ui/node-editor'

const kinds: NodeKind[] = [
  { type: 'trigger', label: 'Trigger', inputs: [], max: 1, removable: false },
  {
    type: 'step',
    label: 'Step',
    fields: [{ name: 'url', label: 'URL', type: 'text', required: true }],
  },
  {
    type: 'branch',
    label: 'Branch',
    outputs: (data) =>
      (Array.isArray(data.routes) ? (data.routes as string[]) : []).map((r) => ({
        id: r,
        label: r,
      })),
    defaults: { routes: ['yes', 'no'] },
  },
  { type: 'end', label: 'End', outputs: [] },
]
const [trigger, step, branch] = kinds as [NodeKind, NodeKind, NodeKind]

const at = { x: 0, y: 0 }
const base = (): Workflow => ({
  nodes: [
    { id: 't', type: 'trigger', position: at },
    { id: 's', type: 'step', position: { x: 300, y: 0 }, data: { url: 'https://x.test' } },
  ],
  edges: [{ id: 'e1', source: 't', target: 's' }],
})

describe('nodePorts', () => {
  it('defaults to one input and one output', () => {
    expect(nodePorts(step)).toEqual({ inputs: [{ id: 'in' }], outputs: [{ id: 'out' }] })
    expect(nodePorts(undefined).outputs).toEqual([{ id: 'out' }])
  })
  it('computes outputs from the settings', () => {
    expect(nodePorts(branch, { routes: ['a', 'b'] }).outputs.map((p) => p.id)).toEqual(['a', 'b'])
    expect(nodePorts(trigger).inputs).toEqual([])
  })
})

describe('addNode', () => {
  it('gives unique ids and names, and copies the defaults', () => {
    let wf = base()
    const first = addNode(wf, step, { kinds })
    wf = first.workflow
    expect(first.id).toBe('step')
    const second = addNode(wf, step, { kinds })
    expect(second.id).toBe('step-2')
    expect(second.workflow.nodes.at(-1)?.name).toBe('Step 3')
    const b = addNode(base(), branch, { kinds })
    expect(b.workflow.nodes.at(-1)?.data).toEqual({ routes: ['yes', 'no'] })
  })
  it('after a node: placed to its right and connected from its first output', () => {
    const { workflow, id } = addNode(base(), step, { after: { nodeId: 's' }, kinds })
    const added = workflow.nodes.find((n) => n.id === id)
    expect(added?.position.x).toBeGreaterThan(300)
    expect(workflow.edges.some((e) => e.source === 's' && e.target === id)).toBe(true)
  })
  it("doesn't connect into a node without inputs", () => {
    const { workflow } = addNode(base(), trigger, { after: { nodeId: 's' }, kinds })
    expect(workflow.edges).toHaveLength(1)
  })
})

describe('connections', () => {
  it('refuses self-links, unknown nodes, missing ports and duplicates', () => {
    const wf = base()
    expect(canConnect(wf, { source: 's', target: 's' }, kinds)).toBe(false)
    expect(canConnect(wf, { source: 's', target: 'nope' }, kinds)).toBe(false)
    expect(canConnect(wf, { source: 's', target: 't' }, kinds)).toBe(false) // trigger has no input
    expect(canConnect(wf, { source: 't', target: 's' }, kinds)).toBe(false) // already there
    expect(
      canConnect(wf, { source: 't', sourcePort: 'out', target: 's', targetPort: 'in' }, kinds),
    ).toBe(false)
    expect(canConnect(wf, { source: 's', sourcePort: 'zzz', target: 't' }, kinds)).toBe(false)
  })
  it('allows loops (an agent and its tools)', () => {
    const wf = addNode(base(), step, { kinds }).workflow
    const a = connectNodes(wf, { source: 's', target: 'step' }, kinds)
    const b = connectNodes(a, { source: 'step', target: 's' }, kinds)
    expect(b.edges).toHaveLength(3)
  })
  it('returns the same graph when nothing changes', () => {
    const wf = base()
    expect(connectNodes(wf, { source: 's', target: 's' }, kinds)).toBe(wf)
  })
})

describe('removeNodes / updateNode / duplicateNode', () => {
  it('removes connections with the node, and keeps kinds that are not removable', () => {
    const wf = removeNodes(base(), ['s', 't'], kinds)
    expect(wf.nodes.map((n) => n.id)).toEqual(['t'])
    expect(wf.edges).toEqual([])
  })
  it('drops connections from outputs that disappear', () => {
    let wf: Workflow = {
      nodes: [
        { id: 'b', type: 'branch', position: at, data: { routes: ['yes', 'no'] } },
        { id: 'x', type: 'step', position: at },
        { id: 'y', type: 'step', position: at },
      ],
      edges: [],
    }
    wf = connectNodes(wf, { source: 'b', sourcePort: 'yes', target: 'x' }, kinds)
    wf = connectNodes(wf, { source: 'b', sourcePort: 'no', target: 'y' }, kinds)
    const next = updateNode(wf, 'b', { data: { routes: ['yes'] } }, kinds)
    expect(next.edges.map((e) => e.target)).toEqual(['x'])
  })
  it('duplicates settings but not connections, up to the kind’s max', () => {
    const { workflow, id } = duplicateNode(base(), 's', kinds)
    const copy = workflow.nodes.find((n) => n.id === id)
    expect(copy?.data).toEqual({ url: 'https://x.test' })
    expect(copy?.data).not.toBe(base().nodes[1]?.data)
    expect(workflow.edges).toHaveLength(1)
    expect(duplicateNode(base(), 't', kinds).workflow.nodes).toHaveLength(2)
  })
})

describe('validateWorkflow', () => {
  it('flags required settings, loose inputs, unconnected routes and too many of a kind', () => {
    const wf: Workflow = {
      nodes: [
        { id: 't', type: 'trigger', position: at },
        { id: 't2', type: 'trigger', position: at },
        { id: 's', type: 'step', position: at, data: { url: '  ' } },
        { id: 'b', type: 'branch', position: at, data: { routes: ['yes', 'no'] } },
        { id: 'e', type: 'end', position: at },
      ],
      edges: [
        { id: '1', source: 't', target: 'b' },
        { id: '2', source: 'b', sourcePort: 'yes', target: 'e' },
      ],
    }
    const issues = validateWorkflow(wf, kinds)
    expect(issues).toContainEqual({ nodeId: 's', code: 'required', field: 'url' })
    expect(issues).toContainEqual({ nodeId: 's', code: 'unconnectedInput' })
    expect(issues).toContainEqual({ nodeId: 'b', code: 'unconnectedOutput', port: 'no' })
    expect(issues).toContainEqual({ nodeId: 't2', code: 'tooMany', max: 1 })
    expect(issues.some((i) => i.nodeId === 'e')).toBe(false)
  })
  it('a complete graph has no issues', () => {
    expect(validateWorkflow(base(), kinds)).toEqual([])
  })
})

describe('layoutWorkflow', () => {
  it('puts nodes in columns by flow order, loops included', () => {
    const wf: Workflow = {
      nodes: ['a', 'b', 'c'].map((id) => ({ id, type: 'step', position: { x: 999, y: 999 } })),
      edges: [
        { id: '1', source: 'a', target: 'b' },
        { id: '2', source: 'b', target: 'c' },
        { id: '3', source: 'c', target: 'b' },
      ],
    }
    const out = layoutWorkflow(wf)
    const x = (id: string) => out.nodes.find((n) => n.id === id)?.position.x ?? -1
    expect(x('a')).toBe(0)
    expect(x('b')).toBeGreaterThan(x('a'))
    expect(x('c')).toBeGreaterThan(x('b'))
  })
  it('leaves an empty graph alone', () => {
    const empty = { nodes: [], edges: [] }
    expect(layoutWorkflow(empty)).toBe(empty)
  })
})

const react: LangGraphJSON = {
  nodes: [
    { id: '__start__', type: 'schema', data: '__start__' },
    { id: 'agent', type: 'runnable', data: { id: ['x', 'RunnableCallable'], name: 'agent' } },
    {
      id: 'tools',
      type: 'runnable',
      data: { id: ['langgraph', 'prebuilt', 'tool_node', 'ToolNode'] },
    },
    { id: '__end__', type: 'schema', data: '__end__' },
  ],
  edges: [
    { source: '__start__', target: 'agent' },
    { source: 'agent', target: 'tools', conditional: true },
    { source: 'agent', target: '__end__', conditional: true },
    { source: 'tools', target: 'agent' },
  ],
}

describe('fromLangGraphJSON', () => {
  it('reads to_json(): conditional edges become a router with one route per target', () => {
    const parsed = fromLangGraphJSON(react)
    expect(parsed).not.toBeNull()
    const wf = parsed?.workflow ?? emptyAgentGraph()
    const type = (id: string) => wf.nodes.find((n) => n.id === id)?.type
    expect(type('__start__')).toBe('start')
    expect(type('__end__')).toBe('end')
    expect(type('agent')).toBe('agent')
    expect(type('tools')).toBe('tool')
    const router = wf.nodes.find((n) => n.type === 'router')
    expect(router?.data?.routes).toEqual(['tools', '__end__'])
    expect(wf.edges.some((e) => e.source === 'agent' && e.target === router?.id)).toBe(true)
    expect(
      wf.edges.some(
        (e) => e.source === router?.id && e.sourcePort === 'tools' && e.target === 'tools',
      ),
    ).toBe(true)
    // No positions in the input: laid out, left to right.
    const x = (id: string) => wf.nodes.find((n) => n.id === id)?.position.x ?? 0
    expect(x('agent')).toBeGreaterThan(x('__start__'))
  })
  it('accepts the JSON text too, and uses edge data as the route name', () => {
    const text = JSON.stringify({
      ...react,
      edges: [{ source: 'agent', target: 'tools', data: 'continue', conditional: true }],
    })
    const router = fromLangGraphJSON(text)?.workflow.nodes.find((n) => n.type === 'router')
    expect(router?.data?.routes).toEqual(['continue'])
  })
  it('returns null for anything that is not a graph', () => {
    for (const bad of [
      '',
      'nope',
      '{',
      '[]',
      'null',
      '{"nodes":[]}',
      42,
      null,
      { nodes: {}, edges: [] },
    ])
      expect(fromLangGraphJSON(bad)).toBeNull()
  })
  it('skips malformed entries instead of trusting them', () => {
    const parsed = fromLangGraphJSON({
      nodes: [
        { id: 'ok', metadata: { coreloom: { type: 'agent', position: { x: 'NaN', y: 1 } } } },
        { id: '' },
        { id: 7 },
        'junk',
        { id: 'ok' },
        { id: '__proto__', metadata: { coreloom: { type: 'router' } } },
      ],
      edges: [{ source: 'ok', target: 'missing' }, { source: 1, target: 'ok' }, null],
    })
    expect(parsed?.workflow.nodes.map((n) => n.id)).toEqual(['ok', '__proto__'])
    expect(parsed?.workflow.nodes.find((n) => n.id === '__proto__')?.type).toBe('function')
    expect(parsed?.workflow.edges).toEqual([])
  })
})

describe('toLangGraphJSON', () => {
  const graph: Workflow = {
    nodes: [
      { id: '__start__', type: 'start', position: { x: 0, y: 0 } },
      {
        id: 'agent',
        type: 'agent',
        name: 'Agent',
        position: { x: 300, y: 0 },
        data: { model: 'm' },
      },
      {
        id: 'r',
        type: 'router',
        name: 'Next?',
        position: { x: 600, y: 0 },
        data: { routes: ['tools', 'done'] },
      },
      { id: 'tools', type: 'tool', position: { x: 900, y: 0 } },
      { id: '__end__', type: 'end', position: { x: 900, y: 200 } },
    ],
    edges: [
      { id: '1', source: '__start__', target: 'agent' },
      { id: '2', source: 'agent', target: 'r' },
      { id: '3', source: 'r', sourcePort: 'tools', target: 'tools' },
      { id: '4', source: 'r', sourcePort: 'done', target: '__end__' },
      { id: '5', source: 'tools', target: 'agent' },
    ],
  }
  const state = [{ name: 'messages', type: 'messages' as const, reducer: 'append' as const }]

  it('writes routers as conditional edges from the nodes that lead to them', () => {
    const json = toLangGraphJSON(graph, state)
    expect(json.nodes.map((n) => n.id)).toEqual(['__start__', 'agent', 'tools', '__end__'])
    expect(json.edges).toEqual([
      { source: '__start__', target: 'agent' },
      { source: 'agent', target: 'tools', data: 'tools', conditional: true },
      { source: 'agent', target: '__end__', data: 'done', conditional: true },
      { source: 'tools', target: 'agent' },
    ])
    expect(json.nodes.find((n) => n.id === 'tools')?.data).toMatchObject({
      id: ['langgraph', 'prebuilt', 'tool_node', 'ToolNode'],
    })
  })

  it('round-trips through fromLangGraphJSON: same nodes, edges, settings, positions and state', () => {
    const back = fromLangGraphJSON(JSON.parse(JSON.stringify(toLangGraphJSON(graph, state))))
    expect(back?.state).toEqual(state)
    const norm = (wf: Workflow) => ({
      nodes: [...wf.nodes].sort((a, b) => a.id.localeCompare(b.id)),
      edges: wf.edges.map((e) => `${e.source}:${e.sourcePort ?? ''}>${e.target}`).sort(),
    })
    expect(norm(back?.workflow ?? emptyAgentGraph())).toEqual(norm(graph))
  })
})
