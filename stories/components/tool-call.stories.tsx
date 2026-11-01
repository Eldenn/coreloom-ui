import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { ToolCall } from '@/components/ui/tool-call'
import type { AiToolPart } from '@/lib/ai'

import { demoTools, docHits, lyon, meeting } from '../blocks/ai-tool-ui'

const meta = {
  title: 'Components/AI/Tool call',
  component: ToolCall,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One call an agent makes to a tool: its name and state, and — unfolded — the input and output, or the error. Calls that need approval open with Allow / Deny. Takes an AI SDK tool part as it is.',
      },
    },
  },
  args: {
    part: {
      type: 'tool-searchDocs',
      toolCallId: '1',
      state: 'output-available',
      input: { query: 'rollback' },
      output: { hits: 3 },
    },
  },
  decorators: [(Story) => <div className="flex max-w-2xl flex-col gap-2">{Story()}</div>],
} satisfies Meta<typeof ToolCall>
export default meta
type Story = StoryObj<typeof meta>

/** Every state a tool call goes through. Try it: Allow or Deny the rollback. */
export const States: Story = {
  render: () => {
    const [rollback, setRollback] = React.useState<AiToolPart>({
      type: 'tool-rollback',
      toolCallId: '3',
      state: 'approval-requested',
      input: { deployment: 'dpl_5t3q' },
      approval: { id: 'a1' },
    })
    return (
      <>
        <ToolCall
          part={{
            type: 'tool-searchDocs',
            toolCallId: '0',
            state: 'input-streaming',
            input: { query: 'roll' },
          }}
          label="Search the docs"
        />
        <ToolCall
          part={{
            type: 'tool-searchDocs',
            toolCallId: '1',
            state: 'input-available',
            input: { query: 'rollback' },
          }}
          label="Search the docs"
        />
        <ToolCall
          part={{
            type: 'tool-searchDeployments',
            toolCallId: '2',
            state: 'output-available',
            input: { project: 'coreloom-api' },
            output: { id: 'dpl_8f2k', status: 'failed' },
          }}
        />
        <ToolCall
          part={rollback}
          label="Roll back production"
          onApprovalResponse={({ approved }) => {
            setRollback((p) =>
              approved
                ? {
                    ...p,
                    state: 'output-available',
                    approval: { id: 'a1', approved },
                    output: { status: 'rolled back' },
                  }
                : {
                    ...p,
                    state: 'output-denied',
                    approval: { id: 'a1', approved },
                  },
            )
          }}
        />
        <ToolCall
          part={{
            type: 'dynamic-tool',
            toolName: 'sendEmail',
            toolCallId: '4',
            state: 'output-error',
            input: { to: 'ops@acme.dev' },
            errorText: 'SMTP timeout after 10 s.',
          }}
        />
        <ToolCall
          part={{
            type: 'tool-createTicket',
            toolCallId: '5',
            state: 'output-denied',
            input: { title: 'Rollback' },
            approval: { id: 'a2', approved: false },
          }}
        />
      </>
    )
  },
}

interface Deployment {
  id: string
  branch: string
  status: 'ready' | 'failed'
  age: string
}
const VARIANT = { ready: 'success', failed: 'destructive' } as const

/** `renderOutput` draws the result as UI instead of JSON — generative UI, from a tool's typed output. */
export const CustomOutput: Story = {
  args: {
    label: 'Latest deployments',
    defaultOpen: true,
    part: {
      type: 'tool-listDeployments',
      toolCallId: '6',
      state: 'output-available',
      input: { project: 'coreloom-api', limit: 3 },
      output: [
        { id: 'dpl_8f2k', branch: 'main', status: 'failed', age: '12 min' },
        { id: 'dpl_5t3q', branch: 'main', status: 'ready', age: '2 h' },
        { id: 'dpl_4m1x', branch: 'feature/auth', status: 'ready', age: '5 h' },
      ] satisfies Deployment[],
    },
    renderOutput: (output) => (
      <ul className="m-0 flex list-none flex-col divide-y divide-border-subtle rounded-md border border-border p-0">
        {(output as Deployment[]).map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-3 py-2">
            <span className="font-mono text-[12px] text-foreground">{d.id}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-muted-foreground">
              {d.branch}
            </span>
            <Badge variant={VARIANT[d.status]}>
              <BadgeDot />
              {d.status === 'ready' ? 'Ready' : 'Failed'}
            </Badge>
            <span className="w-14 text-right text-[12px] text-muted-foreground">{d.age}</span>
          </li>
        ))}
      </ul>
    ),
  },
}

/** Generative UI, inline: `tool.render` draws the call as the app's own component, in place of the card. */
export const GenerativeInline: Story = {
  args: {
    tool: demoTools.getWeather,
    part: {
      type: 'tool-getWeather',
      toolCallId: 'w1',
      state: 'output-available',
      input: { city: 'Lyon' },
      output: lyon,
    },
  },
}

/** The same component while the tool runs: a skeleton the size of the card, busy for screen readers. */
export const GenerativeLoading: Story = {
  args: GenerativeInline.args,
  render: (args) => (
    <div data-frozen className="flex flex-col gap-2">
      <ToolCall
        {...args}
        part={{
          type: 'tool-getWeather',
          toolCallId: 'w2',
          state: 'input-available',
          input: { city: 'Lyon' },
        }}
      />
    </div>
  ),
}

/** In the card (`display: 'card'`, the default): the results replace the JSON, the header stays. */
export const GenerativeInCard: Story = {
  args: {
    tool: demoTools.searchDocs,
    part: {
      type: 'tool-searchDocs',
      toolCallId: 'd1',
      state: 'output-available',
      input: { query: 'rollback' },
      output: docHits,
    },
  },
}

/** A component that asks: `respond(approved)` answers the approval from its own buttons. Try it. */
export const GenerativeApproval: Story = {
  render: function Booking() {
    const [part, setPart] = React.useState<AiToolPart>({
      type: 'tool-bookMeeting',
      toolCallId: 'b1',
      state: 'approval-requested',
      input: meeting,
      approval: { id: 'ap1' },
    })
    return (
      <ToolCall
        part={part}
        tool={demoTools.bookMeeting}
        onApprovalResponse={({ approved }) => {
          setPart((p) =>
            approved
              ? {
                  ...p,
                  state: 'output-available',
                  approval: { id: 'ap1', approved },
                  output: { id: 'mtg_1' },
                }
              : { ...p, state: 'output-denied', approval: { id: 'ap1', approved } },
          )
        }}
      />
    )
  },
}
