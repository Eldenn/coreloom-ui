import type { Meta, StoryObj } from '@storybook/react-vite'

import { agentActivityFromSpans, AgentTeams } from '@/components/ai-agent-teams'

import { agentTeams, liveSpans, teamAgents, teamEdges } from './ai-agent-data'

const meta = {
  title: 'Blocks/AI/Agent teams',
  component: AgentTeams,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A multi-agent system at a glance: the agent graph, a team filter and a panel on the selected agent (role, model, who it reports to, delegates to, hands off to, what it uses), with links to its page and its runs. Names in the panel select that agent. For a live run, pass `activity` and `activePath`, or derive them from the run's spans with `agentActivityFromSpans`.",
      },
    },
  },
  args: {
    agents: teamAgents,
    edges: teamEdges,
    teams: agentTeams,
    href: (id: string) => `#agents/${id}`,
    runsHref: (id: string) => `#agents/${id}/runs`,
  },
} satisfies Meta<typeof AgentTeams>
export default meta
type Story = StoryObj<typeof meta>

/** Select an agent in the graph, then follow the names in the panel. */
export const Default: Story = { args: { defaultSelectedId: 'triage' } }

/** Nothing selected yet. */
export const NoSelection: Story = {}

/** One team: its members and the tools they use. */
export const OneTeam: Story = { args: { defaultTeam: 'research', defaultSelectedId: 'writer' } }

/** A run in progress, read from its trace spans with `agentActivityFromSpans`. */
export const LiveRun: Story = {
  render: (args) => {
    const { activity, path } = agentActivityFromSpans(liveSpans, args.agents)
    return <AgentTeams {...args} activity={activity} activePath={path} defaultSelectedId="tech" />
  },
}

export const ListView: Story = { args: { defaultView: 'list', defaultSelectedId: 'billing' } }

export const Empty: Story = { args: { agents: [], edges: [] } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultSelectedId: 'tech' },
}
