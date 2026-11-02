import type { Meta, StoryObj } from '@storybook/react-vite'

import { NodeEditor } from '@/components/ui/node-editor'

import {
  annotatedWorkflow,
  automationKinds,
  demoCredentials,
  fakeRunNode,
  signupRuns,
  signupWorkflow,
  unfinishedWorkflow,
} from '../blocks/workflow-data'

const meta = {
  title: 'Components/Workflow/Node editor',
  component: NodeEditor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A canvas of nodes joined by connections, n8n-style, on React Flow. The app declares its `kinds` of node (ports, settings, icon, a summary line); the editor lets people add them from a searchable list, drag them, draw connections from an output to an input, and configure the selected node in the side panel — which also lists and makes connections, so everything works from the keyboard. Undo and redo, tidy up, zoom. Pass `runs` to show what your app's run reports for each node — with each node's `input` and `output`, the panel shows them and offers their fields in `{{ }}` expressions, with a preview. `onRunNode` adds “Test node”; `credentials` feed credential fields. Nothing runs in the editor.",
      },
    },
  },
  args: { kinds: automationKinds, defaultValue: signupWorkflow, credentials: demoCredentials },
  argTypes: {
    readOnly: { control: 'boolean' },
    inspector: { control: 'boolean' },
    showIssues: { control: 'boolean' },
    minimap: { control: 'boolean' },
    height: { control: 'number' },
    kinds: { control: 'object' },
    defaultValue: { control: 'object' },
    runs: { control: 'object' },
    credentials: { control: 'object' },
    variables: { control: 'object' },
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

/**
 * After a run with data: the selected node's message uses `{{ company.name }}` from the node before
 * it, and the panel previews the result. Input and Output show what the node received and gave.
 */
export const WithData: Story = {
  args: { runs: signupRuns, defaultSelectedId: 'chat' },
}

/** “Test node” runs the selected node alone through `onRunNode`, then shows its output. */
export const TestNode: Story = {
  args: {
    runs: { webhook: signupRuns.webhook, if: signupRuns.if },
    defaultSelectedId: 'http',
    onRunNode: fakeRunNode,
  },
}

/** Richer settings: a credential, key/value rows and a JSON body. */
export const Fields: Story = {
  args: {
    defaultSelectedId: 'http',
    defaultValue: {
      ...signupWorkflow,
      nodes: signupWorkflow.nodes.map((n) =>
        n.id === 'http' ? { ...n, data: { ...n.data, method: 'POST', body: '{ "domain": ' } } : n,
      ),
    },
  },
}

/**
 * Sample data pinned to the trigger: the nodes after it can be set up — Input, `{{ }}` suggestions,
 * previews — without running anything. One step is disabled: it's dimmed and not checked.
 */
export const PinnedAndDisabled: Story = {
  args: {
    defaultSelectedId: 'email',
    defaultValue: {
      ...signupWorkflow,
      nodes: signupWorkflow.nodes.map((n) =>
        n.id === 'webhook'
          ? { ...n, pinned: signupRuns.webhook?.output }
          : n.id === 'chat'
            ? { ...n, disabled: true }
            : n,
      ),
    },
  },
}

/** Missing settings and loose ends are flagged on the cards and in the panel. */
export const NeedsAttention: Story = {
  args: { defaultValue: unfinishedWorkflow, defaultSelectedId: 'email' },
}

/** For showing a workflow: no dragging, connecting or editing. */
export const ReadOnly: Story = { args: { readOnly: true, defaultSelectedId: 'chat' } }

/**
 * A note for the team and a group framing the sales steps. Add them from the toolbar (or right-click
 * the canvas; Ctrl/⌘+G groups the selection); dragging a group's header moves what's inside.
 * Ctrl/⌘+F finds a node, a note or a group; the minimap in the corner pans and zooms.
 */
export const NotesAndGroups: Story = { args: { defaultValue: annotatedWorkflow } }

/** Notes and groups read-only: their text shows, nothing moves. */
export const NotesReadOnly: Story = { args: { defaultValue: annotatedWorkflow, readOnly: true } }

export const Empty: Story = { args: { defaultValue: { nodes: [], edges: [] } } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: { defaultSelectedId: 'if' },
}
