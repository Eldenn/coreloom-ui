import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { ToolCall } from '@/components/ui/tool-call'
import { ToolForm, type ToolFormField } from '@/components/ui/tool-form'
import type { AiToolPart } from '@/lib/ai'

import { agentTools, askUserInput } from '../blocks/ai-agent-ui'

const fields: ToolFormField[] = [
  { name: 'day', label: 'Day', type: 'date', required: true, min: '2026-10-15' },
  {
    name: 'time',
    label: 'Time',
    type: 'select',
    required: true,
    options: [
      { value: '09:30', label: '9:30 AM' },
      { value: '14:00', label: '2:00 PM' },
    ],
  },
  { name: 'guests', label: 'People from your team', type: 'number', min: 1, max: 8 },
  {
    name: 'notes',
    label: 'Anything to prepare?',
    type: 'textarea',
    description: 'Shared with everyone invited.',
  },
  { name: 'remind', label: 'Remind me 10 minutes before', type: 'checkbox', defaultValue: true },
]

const meta = {
  title: 'Components/AI/Tool form',
  component: ToolForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A tool that asks before it goes on: the agent needs a date, a name, a choice. `formTool()` turns it into a `tools` entry for `Chat` or `ToolCall`; wire `onToolOutput` to `addToolOutput` and the answer becomes the tool’s output. The fields can be the app’s, or written by the model as the tool’s input.',
      },
    },
  },
  args: {
    fields,
    title: 'When should we talk about the rollback?',
    onSubmit: () => {},
    onCancel: () => {},
  },
  decorators: [(Story) => <div className="flex max-w-xl flex-col gap-2">{Story()}</div>],
} satisfies Meta<typeof ToolForm>
export default meta
type Story = StoryObj<typeof meta>

/** Every kind of field. Send with a required field empty to see the errors. */
export const Default: Story = {}

/** After Send: the answer, read-only. */
export const Sent: Story = {
  args: {
    values: { day: '2026-10-16', time: '14:00', guests: 3, notes: null, remind: true },
  },
}

/** After Cancel. */
export const Cancelled: Story = { args: { cancelled: true } }

export const French: Story = {
  globals: { locale: 'fr' },
  args: {
    title: 'Quand parler du retour en arrière ?',
    fields: [
      { name: 'day', label: 'Jour', type: 'date', required: true },
      { name: 'notes', label: 'Quelque chose à préparer ?', type: 'textarea' },
      { name: 'remind', label: 'Me le rappeler 10 minutes avant', type: 'checkbox' },
    ],
  },
}

const waiting: AiToolPart = {
  type: 'tool-scheduleCall',
  toolCallId: 's1',
  state: 'input-available',
  input: { topic: 'Rollback review' },
}

/** In a tool call (`formTool`): Schedule sends the answer as the tool's output. Try it. */
export const InToolCall: Story = {
  render: function Scheduling() {
    const [part, setPart] = React.useState(waiting)
    return (
      <ToolCall
        part={part}
        tool={agentTools().scheduleCall}
        onOutput={(answer) => {
          setPart((p) =>
            answer.state === 'output-error'
              ? { ...p, state: 'output-error', errorText: answer.errorText }
              : { ...p, state: 'output-available', output: answer.output },
          )
        }}
      />
    )
  },
}

/** The model writes the form itself: `askUser`'s input is `{ title, description, fields }`. */
export const WrittenByTheModel: Story = {
  render: function Asking() {
    const [part, setPart] = React.useState<AiToolPart>({
      type: 'tool-askUser',
      toolCallId: 'q1',
      state: 'input-available',
      input: askUserInput,
    })
    return (
      <ToolCall
        part={part}
        tool={agentTools().askUser}
        onOutput={(answer) => {
          setPart((p) =>
            answer.state === 'output-error'
              ? { ...p, state: 'output-error', errorText: answer.errorText }
              : { ...p, state: 'output-available', output: answer.output },
          )
        }}
      />
    )
  },
}

/** In the card (`display: 'card'`): the header says "Waiting for you" until it's answered. */
export const InCard: Story = {
  render: function InCardForm() {
    const [part, setPart] = React.useState(waiting)
    return (
      <ToolCall
        part={part}
        tool={agentTools('en', 'card').scheduleCall}
        onOutput={(answer) => {
          setPart((p) =>
            answer.state === 'output-error'
              ? { ...p, state: 'output-error', errorText: answer.errorText }
              : { ...p, state: 'output-available', output: answer.output },
          )
        }}
      />
    )
  },
}
