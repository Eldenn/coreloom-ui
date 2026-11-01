import type { Meta, StoryObj } from '@storybook/react-vite'

import { NodeEditor } from '@/components/ui/node-editor'

import { automationKinds, signupWorkflow, unfinishedWorkflow } from '../blocks/workflow-data'

const meta = {
  title: 'Components/Workflow/Node editor',
  component: NodeEditor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A canvas of nodes joined by connections, n8n-style, on React Flow. The app declares its `kinds` of node (ports, settings, icon, a summary line); the editor lets people add them from a searchable list, drag them, draw connections from an output to an input, and configure the selected node in the side panel — which also lists and makes connections, so everything works from the keyboard. Undo and redo, tidy up, zoom. Pass `runs` to show what your app's run reports for each node. Nothing runs in the editor.",
      },
    },
  },
  args: { kinds: automationKinds, defaultValue: signupWorkflow },
  argTypes: {
    readOnly: { control: 'boolean' },
    inspector: { control: 'boolean' },
    showIssues: { control: 'boolean' },
    height: { control: 'number' },
    kinds: { control: 'object' },
    defaultValue: { control: 'object' },
    runs: { control: 'object' },
  },
} satisfies Meta<typeof NodeEditor>
export default meta
type Story = StoryObj<typeof meta>

/** A signup flow: a webhook, a branch, and an action on each side. */
export const Default: Story = {}

/** The If node selected: its condition and both outputs in the panel. */
export const Selected: Story = { args: { defaultSelectedId: 'if' } }

/** A run reported by the app: done, running, and one step skipped. */
export const Running: Story = {
  args: {
    runs: {
      webhook: { status: 'success', message: '1 item' },
      if: { status: 'success', message: 'true' },
      http: { status: 'running' },
      chat: { status: 'waiting' },
      email: { status: 'skipped' },
    },
  },
}

/** A step failed: its card turns red and says why. */
export const Failed: Story = {
  args: {
    defaultSelectedId: 'http',
    runs: {
      webhook: { status: 'success', message: '1 item' },
      if: { status: 'success', message: 'true' },
      http: { status: 'error', message: '404 Not found' },
    },
  },
}

/** Missing settings and loose ends are flagged on the cards and in the panel. */
export const NeedsAttention: Story = {
  args: { defaultValue: unfinishedWorkflow, defaultSelectedId: 'email' },
}

/** For showing a workflow: no dragging, connecting or editing. */
export const ReadOnly: Story = { args: { readOnly: true, defaultSelectedId: 'chat' } }

export const Empty: Story = { args: { defaultValue: { nodes: [], edges: [] } } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultSelectedId: 'if' },
}
