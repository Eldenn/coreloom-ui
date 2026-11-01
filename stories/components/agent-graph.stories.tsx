import type { Meta, StoryObj } from '@storybook/react-vite'

import { AgentGraph, AgentGraphLegend } from '@/components/ui/agent-graph'

import { agentTeams, teamAgents, teamEdges } from '../blocks/ai-agent-data'

const meta = {
  title: 'Components/AI/Agent graph',
  component: AgentGraph,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'How a multi-agent system fits together: agents as cards, teams as frames, and three kinds of links — delegates (solid), hands off (dashed) and uses a tool or knowledge base (dotted). Supervisors sit above the agents they delegate to; tools and knowledge share the bottom row. Select an agent to bring its links forward; arrow keys move between agents. The list view says the same in sentences. Pass `activity` and `activePath` to show a run as it happens.',
      },
    },
  },
  args: { agents: teamAgents, edges: teamEdges, teams: agentTeams },
  argTypes: {
    defaultView: { control: 'inline-radio', options: ['graph', 'list'] },
    maxHeight: { control: 'number' },
    legend: { control: 'boolean' },
    agents: { control: 'object' },
    edges: { control: 'object' },
    teams: { control: 'object' },
    activity: { control: 'object' },
    activePath: { control: 'object' },
  },
} satisfies Meta<typeof AgentGraph>
export default meta
type Story = StoryObj<typeof meta>

/** A supervisor, two teams, a person to escalate to, and the tools they share. */
export const Default: Story = {}

/** Tech support selected: its links come forward, the rest fade. */
export const Selected: Story = { args: { defaultSelectedId: 'tech' } }

/** A run in progress: Tech support is working, the agents above it wait, the path is highlighted. */
export const Live: Story = {
  args: {
    activity: { concierge: 'waiting', triage: 'waiting', billing: 'done', tech: 'working' },
    activePath: ['concierge', 'triage', 'billing', 'tech'],
  },
}

/** A step failed: the agent's card turns red and says so. */
export const Failed: Story = {
  args: {
    activity: { concierge: 'waiting', researcher: 'failed' },
    activePath: ['concierge', 'researcher'],
  },
}

/** The same system as text: each agent with who it reports to, delegates to and uses. */
export const ListView: Story = { args: { defaultView: 'list' } }

/** No teams: a plain hierarchy. */
export const WithoutTeams: Story = {
  args: {
    teams: [],
    agents: teamAgents.filter((a) => a.team !== 'research' && a.id !== 'concierge'),
    edges: teamEdges,
  },
}

export const Empty: Story = { args: { agents: [], edges: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultSelectedId: 'billing' },
}

/** The legend on its own, for a page that explains the graph elsewhere. */
export const Legend: Story = {
  render: () => <AgentGraphLegend />,
}
