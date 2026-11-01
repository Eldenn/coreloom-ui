import { describe, expect, it } from 'vitest'

import { agentActivityFromSpans } from '@/components/ai-agent-teams'
import {
  type AgentGraphEdge,
  type AgentGraphNode,
  agentRelations,
  layoutAgentGraph,
} from '@/components/ui/agent-graph'

const a = (id: string, extra: Partial<AgentGraphNode> = {}): AgentGraphNode => ({
  id,
  name: id.toUpperCase(),
  ...extra,
})
const rowOf = (layout: ReturnType<typeof layoutAgentGraph>, id: string) =>
  layout.nodes.find((n) => n.node.id === id)?.row

describe('layoutAgentGraph', () => {
  it('puts each agent one row below the deepest agent that delegates to it', () => {
    const edges: AgentGraphEdge[] = [
      { from: 'boss', to: 'lead', kind: 'delegates' },
      { from: 'lead', to: 'worker', kind: 'delegates' },
      { from: 'boss', to: 'worker', kind: 'delegates' },
    ]
    const layout = layoutAgentGraph([a('worker'), a('lead'), a('boss')], edges)
    expect(rowOf(layout, 'boss')).toBe(0)
    expect(rowOf(layout, 'lead')).toBe(1)
    expect(rowOf(layout, 'worker')).toBe(2)
    expect(layout.edges).toHaveLength(3)
  })

  it('keeps an agent outside the hierarchy on the row of the agent that hands off to it', () => {
    const layout = layoutAgentGraph(
      [a('boss'), a('worker'), a('human', { kind: 'human' })],
      [
        { from: 'boss', to: 'worker', kind: 'delegates' },
        { from: 'worker', to: 'human', kind: 'handoff' },
      ],
    )
    expect(rowOf(layout, 'human')).toBe(1)
  })

  it('does not move a supervisor down when a worker hands back to it', () => {
    const layout = layoutAgentGraph(
      [a('boss'), a('worker')],
      [
        { from: 'boss', to: 'worker', kind: 'delegates' },
        { from: 'worker', to: 'boss', kind: 'handoff' },
      ],
    )
    expect(rowOf(layout, 'boss')).toBe(0)
    expect(rowOf(layout, 'worker')).toBe(1)
  })

  it('puts tools and knowledge in a shared row below every agent', () => {
    const layout = layoutAgentGraph(
      [a('boss'), a('worker'), a('kb', { kind: 'knowledge' }), a('api', { kind: 'tool' })],
      [
        { from: 'boss', to: 'worker', kind: 'delegates' },
        { from: 'worker', to: 'kb', kind: 'uses' },
        { from: 'boss', to: 'api', kind: 'uses' },
      ],
    )
    expect(rowOf(layout, 'kb')).toBe(2)
    expect(rowOf(layout, 'api')).toBe(2)
  })

  it('survives delegation cycles, unknown ids, self-links and repeated ids', () => {
    const layout = layoutAgentGraph(
      [a('x'), a('y'), a('z'), a('x', { name: 'Duplicate' })],
      [
        { from: 'x', to: 'y', kind: 'delegates' },
        { from: 'y', to: 'z', kind: 'delegates' },
        { from: 'z', to: 'x', kind: 'delegates' },
        { from: 'x', to: 'x', kind: 'handoff' },
        { from: 'x', to: 'ghost', kind: 'delegates' },
        { from: 'x', to: 'y', kind: 'delegates' },
      ],
    )
    expect(layout.nodes).toHaveLength(3)
    expect(layout.nodes.find((n) => n.node.id === 'x')?.node.name).toBe('X')
    // The cycle is cut where it closes, so the three agents still form a chain.
    expect(new Set(layout.nodes.map((n) => n.row)).size).toBe(3)
    expect(layout.edges).toHaveLength(3)
    for (const n of layout.nodes) {
      expect(Number.isFinite(n.x) && Number.isFinite(n.y)).toBe(true)
    }
  })

  it('frames each team around its members without overlapping another team', () => {
    const layout = layoutAgentGraph(
      [
        a('boss'),
        a('a1', { team: 'a' }),
        a('a2', { team: 'a' }),
        a('b1', { team: 'b' }),
        a('loner'),
      ],
      [
        { from: 'boss', to: 'a1', kind: 'delegates' },
        { from: 'boss', to: 'b1', kind: 'delegates' },
        { from: 'boss', to: 'loner', kind: 'delegates' },
        { from: 'a1', to: 'a2', kind: 'delegates' },
      ],
      [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'empty', name: 'No members' },
      ],
    )
    expect(layout.frames.map((f) => f.team.id)).toEqual(['a', 'b'])
    for (const f of layout.frames) {
      for (const n of layout.nodes.filter((p) => p.node.team === f.team.id)) {
        expect(n.x).toBeGreaterThanOrEqual(f.x)
        expect(n.x + n.w).toBeLessThanOrEqual(f.x + f.w)
        expect(n.y).toBeGreaterThanOrEqual(f.y)
        expect(n.y + n.h).toBeLessThanOrEqual(f.y + f.h)
      }
      for (const n of layout.nodes.filter((p) => p.node.team !== f.team.id)) {
        const inside = n.x < f.x + f.w && n.x + n.w > f.x && n.y < f.y + f.h && n.y + n.h > f.y
        expect(inside).toBe(false)
      }
    }
    // No two nodes overlap.
    for (const p of layout.nodes)
      for (const q of layout.nodes)
        if (p !== q)
          expect(p.x < q.x + q.w && p.x + p.w > q.x && p.y < q.y + q.h && p.y + p.h > q.y).toBe(
            false,
          )
  })

  it('lays out nothing when there are no agents', () => {
    const layout = layoutAgentGraph([], [{ from: 'a', to: 'b', kind: 'delegates' }])
    expect(layout.nodes).toEqual([])
    expect(layout.edges).toEqual([])
    expect(layout.width).toBeGreaterThan(0)
  })
})

describe('agentRelations', () => {
  it('reads each kind of link in both directions', () => {
    const edges: AgentGraphEdge[] = [
      { from: 'boss', to: 'me', kind: 'delegates' },
      { from: 'me', to: 'helper', kind: 'delegates' },
      { from: 'peer', to: 'me', kind: 'handoff' },
      { from: 'me', to: 'human', kind: 'handoff' },
      { from: 'me', to: 'kb', kind: 'uses' },
    ]
    expect(agentRelations('me', edges)).toEqual({
      reportsTo: ['boss'],
      delegatesTo: ['helper'],
      takesOverFrom: ['peer'],
      handsOffTo: ['human'],
      uses: ['kb'],
      usedBy: [],
    })
    expect(agentRelations('kb', edges).usedBy).toEqual(['me'])
  })
})

describe('agentActivityFromSpans', () => {
  const agents = [a('boss'), a('lead'), a('worker'), a('other')]

  it('marks running agents working, their callers waiting, and finished ones done or failed', () => {
    const { activity, path } = agentActivityFromSpans(
      [
        { id: '1', kind: 'agent', name: 'BOSS', agentId: 'boss', startMs: 0, status: 'running' },
        { id: '2', parentId: '1', kind: 'llm', name: 'plan', startMs: 10, status: 'ok' },
        {
          id: '3',
          parentId: '1',
          kind: 'agent',
          name: 'x',
          agentId: 'lead',
          startMs: 20,
          status: 'running',
        },
        {
          id: '4',
          parentId: '3',
          kind: 'agent',
          name: 'x',
          agentId: 'other',
          startMs: 30,
          status: 'error',
        },
        {
          id: '5',
          parentId: '3',
          kind: 'agent',
          name: 'x',
          agentId: 'worker',
          startMs: 40,
          status: 'running',
        },
      ],
      agents,
    )
    expect(activity).toEqual({
      boss: 'waiting',
      lead: 'waiting',
      other: 'failed',
      worker: 'working',
    })
    expect(path).toEqual(['boss', 'lead', 'other', 'worker'])
  })

  it('matches spans by name when they carry no agent id, and ignores unknown agents', () => {
    const { activity, path } = agentActivityFromSpans(
      [
        { id: '1', kind: 'agent', name: 'LEAD', startMs: 0, status: 'ok' },
        { id: '2', kind: 'agent', name: 'Stranger', startMs: 5, status: 'running' },
        { id: '3', kind: 'agent', name: 'LEAD', startMs: 9, status: 'ok' },
      ],
      agents,
    )
    expect(activity).toEqual({ lead: 'done' })
    expect(path).toEqual(['lead'])
  })

  it('does not loop on spans that are their own ancestors', () => {
    const { activity } = agentActivityFromSpans(
      [
        { id: '1', parentId: '2', kind: 'agent', name: 'BOSS', startMs: 0, status: 'running' },
        { id: '2', parentId: '1', kind: 'agent', name: 'LEAD', startMs: 1, status: 'running' },
      ],
      agents,
    )
    expect(activity).toEqual({ boss: 'waiting', lead: 'waiting' })
  })
})
