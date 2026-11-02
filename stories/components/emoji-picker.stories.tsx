import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { EmojiPicker, EmojiPickerPanel } from '@/components/ui/emoji-picker'

const meta = {
  title: 'Components/Forms/Emoji picker',
  component: EmojiPicker,
  tags: ['autodocs'],
  args: { onSelect: () => undefined },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A built-in set of common emoji by category, searchable by English name. The consumer provides `onSelect` (it gets `{ emoji, name }`) and optionally `emojis` for its own set, `label` for the button, or a trigger as `children`. `EmojiPickerPanel` is the panel alone.',
      },
    },
  },
} satisfies Meta<typeof EmojiPicker>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [text, setText] = React.useState('Ship it ')
    return (
      <div className="flex max-w-md items-center gap-2">
        <input
          aria-label="Message"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
          }}
          className="h-9 flex-1 rounded-md border border-input bg-inset px-2.5 text-[14px] text-foreground"
        />
        <EmojiPicker
          onSelect={(e) => {
            setText((t) => t + e.emoji)
          }}
        />
      </div>
    )
  },
}

export const Panel: Story = {
  render: () => {
    const [picked, setPicked] = React.useState('')
    return (
      <div className="flex flex-col gap-3">
        <div className="w-fit rounded-lg border border-border bg-popover p-2">
          <EmojiPickerPanel
            onSelect={(e) => {
              setPicked(`${e.emoji} ${e.name}`)
            }}
          />
        </div>
        <p className="m-0 text-[13px] text-muted-foreground">Picked: {picked || 'nothing yet'}</p>
      </div>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <div className="w-fit rounded-lg border border-border bg-popover p-2">
      <EmojiPickerPanel onSelect={() => undefined} />
    </div>
  ),
}
