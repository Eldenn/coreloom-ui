import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowLeftIcon } from 'lucide-react'
import * as React from 'react'

import {
  AgentBuilder,
  agentTeamToWorkflow,
  workflowToAgentTeam,
} from '@/components/ai-agent-builder'
import { agentActivityFromSpans, AgentTeams } from '@/components/ai-agent-teams'
import { Button } from '@/components/ui/button'
import type { Workflow } from '@/components/ui/node-editor'

import { agentTeams, liveSpans, teamAgents, teamEdges } from './ai-agent-data'
import { demoTools, researchGraph } from './workflow-data'

const meta = {
  title: 'Blocks/AI/Agent teams',
  component: AgentTeams,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A multi-agent system at a glance: the agent graph, a team filter and a panel on the selected agent (role, model, who it reports to, delegates to, hands off to, what it uses), with links to its page and its runs. Names in the panel select that agent, with the word on their link. `onEdit` adds an Edit graph button for your agent builder: `agentTeamToWorkflow` turns the team into a LangGraph-style graph (a delegation is a supervisor, a handoff a swarm move) and `workflowToAgentTeam` reads one back. For a live run, pass `activity` and `activePath`, or derive them from the run's spans with `agentActivityFromSpans`.",
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

/**
 * Edit graph opens the agent builder on the team: each supervisor routes to its workers, who come
 * back when done; a handoff is a route to the next agent. Back shows the edited graph as a team.
 */
export const EditInBuilder: Story = {
  render: function Render(args) {
    const tools = args.agents
      .filter((a) => a.kind === 'tool' || a.kind === 'knowledge')
      .map((a) => ({ id: a.id, name: a.name }))
    const [team, setTeam] = React.useState({
      agents: args.agents,
      edges: args.edges,
      teams: args.teams ?? [],
    })
    const [editing, setEditing] = React.useState<{
      workflow: Workflow
      selectedId: string | null
    } | null>(null)
    const draft = React.useRef<Workflow | null>(null)
    if (!editing)
      return (
        <AgentTeams
          {...args}
          {...team}
          onEdit={(selectedId) => {
            const workflow = agentTeamToWorkflow(team)
            draft.current = workflow
            setEditing({ workflow, selectedId })
          }}
        />
      )
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            const next = workflowToAgentTeam(draft.current ?? editing.workflow, { tools })
            // Keep each agent's fields the builder doesn't show.
            setTeam({
              ...next,
              agents: next.agents.map((a) => ({
                ...team.agents.find((b) => b.id === a.id),
                ...a,
              })),
            })
            setEditing(null)
          }}
        >
          <ArrowLeftIcon aria-hidden />
          Back to the teams
        </Button>
        <AgentBuilder
          tools={tools}
          defaultValue={editing.workflow}
          defaultName="Customer support"
          defaultSelectedId={editing.selectedId ?? undefined}
          onValueChange={(wf) => {
            draft.current = wf
          }}
        />
      </div>
    )
  },
  args: { defaultSelectedId: 'billing' },
}

/** A graph made in the agent builder (or read from LangGraph JSON), shown as a team. */
export const FromAgentBuilder: Story = {
  render: function Render(args) {
    const team = React.useMemo(() => workflowToAgentTeam(researchGraph, { tools: demoTools }), [])
    return <AgentTeams {...args} {...team} href={undefined} runsHref={undefined} />
  },
  args: { defaultSelectedId: 'supervisor' },
}
