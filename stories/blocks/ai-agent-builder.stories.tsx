import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { AgentBuilder, fromLangGraphJSON } from '@/components/ai-agent-builder'
import type { NodeRun } from '@/components/ui/node-editor'

import { catalog } from './ai-models'
import { demoTools, reactAgentJSON, researchGraph } from './workflow-data'

const meta = {
  title: 'Blocks/AI/Agent builder',
  component: AgentBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Design an agent graph the way LangGraph models it: a shared state, nodes (agents, tools, your functions, human review, subgraphs), plain and conditional edges — a Router has one output per route — between START and END. State opens the state's fields and their reducers; LangGraph JSON shows the graph in the shape of `get_graph().to_json()` and imports one. `onSave` and `onRun` get the graph and that JSON: your app runs it and reports through `runs`.",
      },
    },
  },
  args: {
    models: catalog,
    tools: demoTools,
    defaultValue: researchGraph,
    defaultName: 'Research brief',
    defaultState: [
      { name: 'messages', type: 'messages', reducer: 'append' },
      { name: 'topic', type: 'string', reducer: 'replace' },
      { name: 'sources', type: 'list', reducer: 'append' },
    ],
  },
} satisfies Meta<typeof AgentBuilder>
export default meta
type Story = StoryObj<typeof meta>

/** A supervisor routes to a researcher (with its tools loop) or a writer; a person approves. */
export const Default: Story = {
  render: function Render(args) {
    const [runs, setRuns] = React.useState<Partial<Record<string, NodeRun>>>({})
    const [running, setRunning] = React.useState(false)
    return (
      <AgentBuilder
        {...args}
        runs={runs}
        running={running}
        onSave={() =>
          new Promise((resolve) => {
            setTimeout(resolve, 600)
          })
        }
        onRun={() => {
          setRunning(true)
          setRuns({ __start__: { status: 'success' }, supervisor: { status: 'running' } })
          setTimeout(() => {
            setRuns((r) => ({
              ...r,
              supervisor: { status: 'success' },
              next: { status: 'success', message: 'research' },
              researcher: { status: 'running' },
            }))
          }, 900)
          setTimeout(() => {
            setRuns((r) => ({ ...r, researcher: { status: 'success', message: '4 sources' } }))
            setRunning(false)
          }, 1800)
        }}
      />
    )
  },
}

/** The Researcher selected: model, instructions with their {{variables}}, tools. */
export const AgentSelected: Story = { args: { defaultSelectedId: 'researcher' } }

/** A run in progress, frozen: the researcher is working, its tools wait. */
export const Running: Story = {
  args: {
    onRun: () => undefined,
    running: true,
    runs: {
      __start__: { status: 'success' },
      supervisor: { status: 'success' },
      next: { status: 'success', message: 'research' },
      researcher: { status: 'running' },
      tools: { status: 'waiting' },
    },
  },
  decorators: [
    (Story) => (
      <div data-frozen>
        <Story />
      </div>
    ),
  ],
}

/** LangGraph's prebuilt ReAct agent, imported from its `to_json()`: the conditional edges become a Router. */
export const ImportedFromLangGraph: Story = {
  args: {
    defaultValue: fromLangGraphJSON(reactAgentJSON)?.workflow,
    defaultName: 'ReAct agent',
  },
}

/** A new graph: START and END only. */
export const Empty: Story = {
  args: { defaultValue: undefined, defaultName: '', defaultState: undefined },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultName: 'Note de recherche', onRun: () => undefined },
}
