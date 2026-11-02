import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import type { NodeRun } from '@/components/ui/node-editor'
import { WorkflowBuilder } from '@/components/workflow-builder'

import { automationKinds, signupWorkflow, unfinishedWorkflow } from './workflow-data'

const meta = {
  title: 'Blocks/Workflow/Workflow builder',
  component: WorkflowBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "An automation's page: its name, Save and Run, and the node editor with your app's node kinds. `onSave` stores the graph; `onRun` hands it to your app, which reports each node's state through `runs`. Run waits until no node needs attention.",
      },
    },
  },
  args: {
    kinds: automationKinds,
    defaultValue: signupWorkflow,
    defaultName: 'Route new signups',
  },
} satisfies Meta<typeof WorkflowBuilder>
export default meta
type Story = StoryObj<typeof meta>

const ORDER = ['webhook', 'if', 'http', 'chat'] as const

/** Save and Run work: the run is simulated one node at a time. */
export const Default: Story = {
  render: function Render(args) {
    const [runs, setRuns] = React.useState<Partial<Record<string, NodeRun>>>({})
    const [running, setRunning] = React.useState(false)
    return (
      <WorkflowBuilder
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
          setRuns({ email: { status: 'skipped' } })
          ORDER.forEach((id, i) => {
            setTimeout(() => {
              setRuns((r) => ({
                ...r,
                [id]: { status: 'running' },
                ...(i > 0 ? { [ORDER[i - 1] ?? '']: { status: 'success' } } : {}),
              }))
            }, i * 700)
          })
          setTimeout(() => {
            setRuns((r) => ({ ...r, chat: { status: 'success', message: 'Posted' } }))
            setRunning(false)
          }, ORDER.length * 700)
        }}
      />
    )
  },
}

/** Mid-run, frozen for the screenshot. */
export const Running: Story = {
  args: {
    onRun: () => undefined,
    running: true,
    runs: {
      webhook: { status: 'success', message: '1 item' },
      if: { status: 'success', message: 'true' },
      http: { status: 'running' },
      chat: { status: 'waiting' },
      email: { status: 'skipped' },
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

/** Run waits until the flagged nodes are fixed. */
export const NeedsAttention: Story = {
  args: { defaultValue: unfinishedWorkflow, onRun: () => undefined, onSave: () => undefined },
}

/** Saving failed: the header says so, and Save can be pressed again. */
export const SaveFailed: Story = {
  args: {
    onSave: () => Promise.reject(new Error('offline')),
  },
}

export const Empty: Story = {
  args: { defaultValue: { nodes: [], edges: [] }, defaultName: '', onRun: () => undefined },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultName: 'Trier les inscriptions', onRun: () => undefined, onSave: () => undefined },
}
