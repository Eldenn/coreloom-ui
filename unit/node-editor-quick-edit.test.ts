import { describe, expect, it } from 'vitest'

import {
  copyNodes,
  insertNodeOnEdge,
  type NodeKind,
  pasteNodes,
  updateNode,
  validateWorkflow,
  type Workflow,
} from '@/components/ui/node-editor'

const kinds: NodeKind[] = [
  { type: 'start', label: 'Start', inputs: [], max: 1 },
  {
    type: 'step',
    label: 'Step',
    fields: [{ name: 'url', label: 'URL', type: 'text', required: true }],
  },
  { type: 'if', label: 'If', outputs: [{ id: 'yes' }, { id: 'no' }] },
]
const at = { x: 0, y: 0 }
const wf: Workflow = {
  nodes: [
    { id: 'start', type: 'start', position: at },
    { id: 'if', type: 'if', position: { x: 400, y: 0 } },
    { id: 'a', type: 'step', position: { x: 800, y: 0 }, data: { url: 'x' } },
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'if' },
    { id: 'e2', source: 'if', sourcePort: 'no', target: 'a' },
  ],
}
const step = kinds[1]

describe('insertNodeOnEdge', () => {
  it('puts the node between both ends and keeps the port', () => {
    const { workflow, id } = insertNodeOnEdge(wf, step, 'e2', kinds)
    expect(id).toBe('step')
    expect(workflow.edges.some((e) => e.id === 'e2')).toBe(false)
    expect(workflow.edges).toContainEqual(
      expect.objectContaining({ source: 'if', sourcePort: 'no', target: 'step' }),
    )
    expect(workflow.edges).toContainEqual(expect.objectContaining({ source: 'step', target: 'a' }))
    expect(workflow.nodes.find((n) => n.id === 'step')?.position.x).toBe(600)
  })
  it('just adds the node when the connection is gone', () => {
    const { workflow } = insertNodeOnEdge(wf, step, 'ghost', kinds)
    expect(workflow.edges).toHaveLength(2)
    expect(workflow.nodes).toHaveLength(4)
  })
})

describe('copyNodes and pasteNodes', () => {
  it('pastes copies with new ids and names, and the connections between them', () => {
    const clip = copyNodes(wf, ['if', 'a'])
    expect(clip.edges.map((e) => e.id)).toEqual(['e2'])
    const { workflow, ids } = pasteNodes(wf, JSON.stringify(clip), kinds)
    expect(ids).toEqual(['if-2', 'a-2'])
    const names = workflow.nodes.filter((n) => ids.includes(n.id)).map((n) => n.name)
    expect(names).toEqual(['If 2', 'Step 2'])
    expect(workflow.edges.at(-1)).toMatchObject({ source: 'if-2', sourcePort: 'no', target: 'a-2' })
    expect(workflow.nodes.find((n) => n.id === 'a-2')?.position).toEqual({ x: 840, y: 40 })
  })
  it('respects max, unknown kinds and hostile input', () => {
    expect(pasteNodes(wf, copyNodes(wf, ['start']), kinds).ids).toEqual([])
    expect(pasteNodes(wf, '{not json', kinds).ids).toEqual([])
    expect(pasteNodes(wf, { coreloom: 'other', nodes: [] }, kinds).ids).toEqual([])
    const hostile = {
      coreloom: 'workflow',
      nodes: [
        { id: 'x', type: 'evil', position: at },
        { id: 'y', type: 'step', position: { x: '1', y: 0 } },
        { id: '__proto__', type: 'step', position: at, data: 'nope', name: 42 },
        null,
      ],
      edges: [{ source: '__proto__', target: 'ghost' }, 'junk'],
    }
    const { workflow, ids } = pasteNodes(wf, hostile, kinds)
    expect(ids).toEqual(['node-__proto__'])
    expect(workflow.nodes.at(-1)).toMatchObject({ type: 'step', name: 'Step 2', data: {} })
    expect(workflow.edges).toHaveLength(2)
  })
})

describe('disabled and pinned', () => {
  it('updateNode sets and removes the flags as plain JSON', () => {
    const on = updateNode(wf, 'a', { disabled: true, pinned: [{ ok: 1 }] })
    expect(on.nodes[2]).toMatchObject({ disabled: true, pinned: [{ ok: 1 }] })
    const off = updateNode(on, 'a', { disabled: false, pinned: undefined })
    expect(off.nodes[2]).toEqual(wf.nodes[2])
    expect('pinned' in (off.nodes[2] ?? {})).toBe(false)
  })
  it('a disabled node is not checked', () => {
    const broken = updateNode(wf, 'a', { data: {} })
    expect(validateWorkflow(broken, kinds).some((i) => i.nodeId === 'a')).toBe(true)
    const off = updateNode(broken, 'a', { disabled: true })
    expect(validateWorkflow(off, kinds).some((i) => i.nodeId === 'a')).toBe(false)
  })
})
