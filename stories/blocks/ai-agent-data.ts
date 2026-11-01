// Demo data for the agent graph and the agent teams block: a support desk with a research team.
import type { AgentTeamMember } from '@/components/ai-agent-teams'
import type { TraceSpan } from '@/components/ai-runs'
import type { AgentGraphEdge, AgentGraphTeam } from '@/components/ui/agent-graph'

export const agentTeams: AgentGraphTeam[] = [
  { id: 'support', name: 'Support' },
  { id: 'research', name: 'Research' },
]

export const teamAgents: AgentTeamMember[] = [
  {
    id: 'concierge',
    name: 'Concierge',
    role: 'Supervisor',
    model: 'Claude Sonnet',
    status: 'active',
    description: 'Reads every request first and sends it to the team that can answer it.',
  },
  {
    id: 'triage',
    name: 'Triage',
    role: 'Team lead',
    team: 'support',
    model: 'Claude Haiku',
    status: 'active',
    description: 'Sorts support tickets by topic and urgency, then assigns a specialist.',
  },
  {
    id: 'billing',
    name: 'Billing',
    role: 'Specialist',
    team: 'support',
    model: 'Claude Haiku',
    status: 'active',
    description: 'Invoices, refunds and plan changes. Refunds above €200 ask a person first.',
  },
  {
    id: 'tech',
    name: 'Tech support',
    role: 'Specialist',
    team: 'support',
    model: 'Claude Sonnet',
    status: 'active',
    description: 'Debugs failed deployments and walks customers through fixes.',
  },
  {
    id: 'oncall',
    name: 'On-call engineer',
    kind: 'human',
    role: 'Escalation',
    team: 'support',
    description: 'Takes over when an outage is suspected.',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Team lead',
    team: 'research',
    model: 'Claude Opus',
    status: 'active',
    description: 'Finds and summarises sources for product questions.',
  },
  {
    id: 'writer',
    name: 'Writer',
    role: 'Drafts answers',
    team: 'research',
    model: 'Claude Sonnet',
    status: 'active',
  },
  {
    id: 'checker',
    name: 'Fact-checker',
    role: 'Reviews drafts',
    team: 'research',
    model: 'Claude Haiku',
    status: 'paused',
  },
  { id: 'kb', name: 'Help center', kind: 'knowledge' },
  { id: 'tickets', name: 'Ticketing', kind: 'tool' },
  { id: 'stripe', name: 'Billing API', kind: 'tool' },
  { id: 'web', name: 'Web search', kind: 'tool' },
]

export const teamEdges: AgentGraphEdge[] = [
  { from: 'concierge', to: 'triage', kind: 'delegates' },
  { from: 'concierge', to: 'researcher', kind: 'delegates' },
  { from: 'triage', to: 'billing', kind: 'delegates' },
  { from: 'triage', to: 'tech', kind: 'delegates' },
  { from: 'billing', to: 'tech', kind: 'handoff', label: 'Bugs' },
  { from: 'tech', to: 'oncall', kind: 'handoff', label: 'Outages' },
  { from: 'researcher', to: 'writer', kind: 'delegates' },
  { from: 'writer', to: 'checker', kind: 'handoff' },
  { from: 'triage', to: 'kb', kind: 'uses' },
  { from: 'triage', to: 'tickets', kind: 'uses' },
  { from: 'billing', to: 'stripe', kind: 'uses' },
  { from: 'billing', to: 'kb', kind: 'uses' },
  { from: 'tech', to: 'kb', kind: 'uses' },
  { from: 'tech', to: 'tickets', kind: 'uses' },
  { from: 'researcher', to: 'web', kind: 'uses' },
  { from: 'checker', to: 'web', kind: 'uses' },
]

/** A run in progress: Concierge sent a ticket to Triage, Billing handed it to Tech support. */
export const liveSpans: TraceSpan[] = [
  {
    id: 'a1',
    kind: 'agent',
    name: 'Concierge',
    agentId: 'concierge',
    startMs: 0,
    durationMs: 0,
    status: 'running',
  },
  {
    id: 'a2',
    parentId: 'a1',
    kind: 'agent',
    name: 'Triage',
    agentId: 'triage',
    startMs: 900,
    durationMs: 0,
    status: 'running',
  },
  {
    id: 'a3',
    parentId: 'a2',
    kind: 'agent',
    name: 'Billing',
    agentId: 'billing',
    startMs: 2100,
    durationMs: 3200,
    status: 'ok',
  },
  {
    id: 'a4',
    parentId: 'a2',
    kind: 'agent',
    name: 'Tech support',
    agentId: 'tech',
    startMs: 5400,
    durationMs: 0,
    status: 'running',
  },
]
