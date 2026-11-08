import type { Meta, StoryObj } from '@storybook/react-vite'

import { AgentRunReplay, type ReplaySpan } from '@/components/ai-agent-replay'

import { agentTeams, teamAgents, teamEdges } from './ai-agent-data'

/** A finished support run: the concierge hands to triage, which asks billing then tech support. */
const runSpans: ReplaySpan[] = [
  {
    id: 'a1',
    kind: 'agent',
    name: 'Concierge',
    agentId: 'concierge',
    startMs: 0,
    durationMs: 14200,
    status: 'ok',
    tokens: { input: 820, output: 140 },
    cost: 0.004,
  },
  {
    id: 'l1',
    parentId: 'a1',
    kind: 'llm',
    name: 'Route the request',
    startMs: 120,
    durationMs: 700,
    status: 'ok',
    tokens: { input: 640, output: 60 },
    cost: 0.002,
  },
  {
    id: 'a2',
    parentId: 'a1',
    kind: 'agent',
    name: 'Triage',
    agentId: 'triage',
    startMs: 900,
    durationMs: 12400,
    status: 'ok',
    tokens: { input: 1300, output: 210 },
    cost: 0.006,
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
    tokens: { input: 2100, output: 380 },
    cost: 0.011,
  },
  {
    id: 't1',
    parentId: 'a3',
    kind: 'tool',
    name: 'lookup_invoice',
    startMs: 2600,
    durationMs: 900,
    status: 'ok',
  },
  {
    id: 'a4',
    parentId: 'a2',
    kind: 'agent',
    name: 'Tech support',
    agentId: 'tech',
    startMs: 5400,
    durationMs: 7300,
    status: 'ok',
    tokens: { input: 3400, output: 720 },
    cost: 0.019,
  },
  {
    id: 't2',
    parentId: 'a4',
    kind: 'tool',
    name: 'search_docs',
    startMs: 5900,
    durationMs: 1100,
    status: 'ok',
  },
  {
    id: 't3',
    parentId: 'a4',
    kind: 'tool',
    name: 'get_logs',
    startMs: 7200,
    durationMs: 2400,
    status: 'error',
  },
  {
    id: 't4',
    parentId: 'a4',
    kind: 'tool',
    name: 'get_logs',
    startMs: 9800,
    durationMs: 1300,
    status: 'ok',
  },
]

const meta = {
  title: 'Blocks/AI/Agent run replay',
  component: AgentRunReplay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Replays a finished multi-agent run from its trace spans. The consumer provides `agents`, `edges` and `teams` (as for AgentTeams) and the run’s `spans` (`TraceSpan` from ai-runs fits: `startMs`, `durationMs`, `status`, `agentId`, `tokens`, `cost`), and optionally `defaultTime` and `avatars`. Play or scrub the timeline; a turn in the list jumps there.',
      },
    },
  },
  args: { agents: teamAgents, edges: teamEdges, teams: agentTeams, spans: runSpans },
} satisfies Meta<typeof AgentRunReplay>
export default meta
type Story = StoryObj<typeof meta>

/** Half-way: Tech support is working, Triage waits for it. */
export const Default: Story = { args: { defaultTime: 6400 } }

/** At the start: press Play. */
export const AtStart: Story = {}

/** The end of the run: every agent done, the metrics complete. */
export const Finished: Story = { args: { defaultTime: 14200 } }

export const WithAvatars: Story = { args: { defaultTime: 6400, avatars: 'face' } }

export const Empty: Story = { args: { spans: [] } }

export const Phone: Story = {
  args: { defaultTime: 6400 },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const French: Story = { globals: { locale: 'fr' }, args: { defaultTime: 6400 } }
