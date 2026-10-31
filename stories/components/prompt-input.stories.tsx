import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { PromptInput } from '@/components/ui/prompt-input'
import type { AiChatStatus } from '@/lib/ai'

const meta = {
  title: 'Components/AI/Prompt input',
  component: PromptInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "The composer at the bottom of a chat: a box that grows with its text, attachments, a toolbar slot and Send — which becomes Stop while a reply streams. `status` is `useChat()`'s status as it is.",
      },
    },
  },
  args: {
    onSubmit: () => {},
    status: 'ready',
    placeholder: 'Ask anything…',
    allowAttachments: false,
    disabled: false,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['ready', 'submitted', 'streaming', 'error'],
    },
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof PromptInput>
export default meta
type Story = StoryObj<typeof meta>

/** Enter sends, Shift + Enter breaks the line. While a reply streams, Send becomes Stop. */
export const Default: Story = {
  render: (args) => {
    const [status, setStatus] = React.useState<AiChatStatus>('ready')
    const [sent, setSent] = React.useState<string[]>([])
    return (
      <div className="flex flex-col gap-3">
        <PromptInput
          {...args}
          status={status}
          allowAttachments
          onStop={() => {
            setStatus('ready')
          }}
          onSubmit={({ text }) => {
            setSent((s) => [...s, text])
            setStatus('streaming')
          }}
          toolbar={<Badge variant="secondary">Claude Sonnet</Badge>}
        />
        <ul aria-label="Sent" className="m-0 list-none p-0 text-[13px] text-muted-foreground">
          {sent.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    )
  },
}

/** A reply is on its way: Stop replaces Send. */
export const Streaming: Story = {
  args: {
    status: 'streaming',
    onStop: () => {},
    defaultValue: 'And for the staging project?',
  },
}

/** Disabled, for instance while the chat is read-only. */
export const Disabled: Story = {
  args: { disabled: true, placeholder: 'This conversation is archived.' },
}
