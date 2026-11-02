import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Hotkey,
  type ShortcutGroup,
  ShortcutsDialog,
  useHotkeys,
} from '@/components/ui/keyboard-shortcuts'

const meta = {
  title: 'Components/Actions/Keyboard shortcuts',
  component: ShortcutsDialog,
  tags: ['autodocs'],
  args: { open: true, onOpenChange: () => undefined, groups: [] },
  parameters: {
    layout: 'padded',
    docs: {
      story: { inline: false, height: '560px' },
      description: {
        component:
          '`useHotkeys(keys, handler, options)` runs a function on "mod+k", "shift+?" or a sequence such as "g i" ("mod" is ⌘ on a Mac, Ctrl elsewhere). `Hotkey` draws a combination as keys. `ShortcutsDialog` lists `groups` of `{ keys, description }` with a filter; the consumer opens it, usually with "?".',
      },
    },
  },
} satisfies Meta<typeof ShortcutsDialog>
export default meta
type Story = StoryObj<typeof meta>

const groups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: 'mod+k', description: 'Open the command palette' },
      { keys: 'shift+?', description: 'Show keyboard shortcuts' },
      { keys: 'mod+/', description: 'Search' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'g i', description: 'Go to the inbox' },
      { keys: 'g p', description: 'Go to projects' },
      { keys: 'j', description: 'Next item' },
      { keys: 'k', description: 'Previous item' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: 'mod+enter', description: 'Send' },
      { keys: 'mod+shift+z', description: 'Redo' },
      { keys: 'esc', description: 'Cancel' },
    ],
  },
]

function Demo() {
  const [open, setOpen] = React.useState(true)
  const [last, setLast] = React.useState('nothing yet')
  useHotkeys('shift+?', () => {
    setOpen(true)
  })
  useHotkeys(['mod+k', 'g i', 'g p'], (_e, combo) => {
    setLast(combo)
  })
  return (
    <div className="flex flex-col items-start gap-3 text-[14px] text-fg-secondary">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true)
        }}
      >
        Keyboard shortcuts <Hotkey keys="shift+?" />
      </Button>
      <p className="m-0">
        Last shortcut: <span className="font-mono text-foreground">{last}</span>
      </p>
      <ShortcutsDialog open={open} onOpenChange={setOpen} groups={groups} />
    </div>
  )
}

export const Default: Story = { render: () => <Demo /> }

export const Keys: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3 text-[14px] text-foreground">
      <Hotkey keys="mod+k" />
      <Hotkey keys="mod+shift+p" />
      <Hotkey keys="alt+arrowup" />
      <Hotkey keys="g i" />
      <Hotkey keys="esc" />
    </div>
  ),
}
