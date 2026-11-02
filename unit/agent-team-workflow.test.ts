import { describe, expect, it } from 'vitest'

import {
  agentTeamToWorkflow,
  fromLangGraphJSON,
  toLangGraphJSON,
  workflowToAgentTeam,
} from '@/components/ai-agent-builder'
import type { AgentGraphEdge } from '@/components/ui/agent-graph'

import { agentTeams, teamAgents, teamEdges } from '../stories/blocks/ai-agent-data'

const key = (e: AgentGraphEdge) => `${e.kind} ${e.from}>${e.to}${e.label ? ` (${e.label})` : ''}`
const sorted = (edges: AgentGraphEdge[]) => edges.map(key).sort()

describe('agentTeamToWorkflow', () => {
  const wf = agentTeamToWorkflow({ agents: teamAgents, edges: teamEdges, teams: agentTeams })
  const node = (id: string) => wf.nodes.find((n) => n.id === id)
  const targets = (from: string) =>
    wf.edges.filter((e) => e.source === from).map((e) => `${e.sourcePort ?? ''}>${e.target}`)

  it('starts at the agent nobody delegates or hands off to', () => {
    expect(targets('__start__')).toEqual(['>concierge'])
  })

  it('makes a supervisor route to its workers, and end the run when done', () => {
    expect(targets('concierge')).toEqual(['>concierge-route'])
    expect(targets('concierge-route')).toEqual([
      'triage>triage',
      'researcher>researcher',
      'done>__end__',
    ])
  })

  it('sends a worker back to its supervisor, and lets it hand off by its label', () => {
    expect(targets('billing-route')).toEqual(['Bugs>tech', 'done>triage'])
    expect(targets('checker')).toEqual(['>__end__'])
  })

  it('keeps what LangGraph does not model in the nodes data', () => {
    expect(node('billing')?.data).toMatchObject({ team: 'support', tools: ['stripe', 'kb'] })
    expect(node('oncall')?.type).toBe('human')
    expect(node('kb')).toBeUndefined()
  })
})

describe('workflowToAgentTeam', () => {
  it('gives the team graph back', () => {
    const team = workflowToAgentTeam(
      agentTeamToWorkflow({ agents: teamAgents, edges: teamEdges, teams: agentTeams }),
    )
    expect(sorted(team.edges)).toEqual(sorted(teamEdges))
    expect(team.teams).toEqual(agentTeams.map(({ id, name }) => ({ id, name })))
    expect(team.agents.map((a) => a.id).sort()).toEqual(teamAgents.map((a) => a.id).sort())
    expect(team.agents.find((a) => a.id === 'kb')?.kind).toBe('knowledge')
    const billing = team.agents.find((a) => a.id === 'billing')
    const original = teamAgents.find((a) => a.id === 'billing')
    expect(billing).toMatchObject({
      name: original?.name,
      role: original?.role,
      team: original?.team,
      model: original?.model,
    })
  })

  it('survives a trip through LangGraph JSON', () => {
    const wf = agentTeamToWorkflow({ agents: teamAgents, edges: teamEdges, teams: agentTeams })
    const back = fromLangGraphJSON(JSON.stringify(toLangGraphJSON(wf)))
    expect(back).not.toBeNull()
    if (!back) return
    expect(sorted(workflowToAgentTeam(back.workflow).edges)).toEqual(sorted(teamEdges))
  })

  it('reads a supervisor graph from LangGraph (langgraph-supervisor)', () => {
    const parsed = fromLangGraphJSON({
      nodes: [
        { id: '__start__', type: 'schema', data: '__start__' },
        { id: 'supervisor', type: 'runnable', data: { name: 'supervisor' } },
        { id: 'research_expert', type: 'runnable', data: { name: 'research_expert' } },
        { id: 'math_expert', type: 'runnable', data: { name: 'math_expert' } },
        { id: '__end__', type: 'schema', data: '__end__' },
      ],
      edges: [
        { source: '__start__', target: 'supervisor' },
        { source: 'supervisor', target: 'research_expert', conditional: true },
        { source: 'supervisor', target: 'math_expert', conditional: true },
        { source: 'supervisor', target: '__end__', conditional: true },
        { source: 'research_expert', target: 'supervisor' },
        { source: 'math_expert', target: 'supervisor' },
      ],
    })
    expect(parsed).not.toBeNull()
    if (!parsed) return
    // fromLangGraphJSON reads unnamed runnables as functions; an app marks its agents.
    const wf = {
      ...parsed.workflow,
      nodes: parsed.workflow.nodes.map((n) =>
        n.type === 'function' ? { ...n, type: 'agent' } : n,
      ),
    }
    expect(sorted(workflowToAgentTeam(wf).edges)).toEqual([
      'delegates supervisor>math_expert',
      'delegates supervisor>research_expert',
    ])
  })

  it('reads agents that hand off to each other as a swarm', () => {
    const wf = agentTeamToWorkflow({
      agents: [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
      ],
      edges: [
        { from: 'alice', to: 'bob', kind: 'handoff' },
        { from: 'bob', to: 'alice', kind: 'handoff' },
      ],
    })
    expect(sorted(workflowToAgentTeam(wf).edges)).toEqual([
      'handoff alice>bob',
      'handoff bob>alice',
    ])
  })
})
