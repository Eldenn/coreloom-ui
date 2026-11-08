import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  cursorPosition,
  PresenceActivity,
  PresenceAvatars,
  type PresenceUser,
  type RemoteCursor,
  RemoteCursors,
} from '@/components/ui/presence'

const meta = {
  title: 'Components/Presence',
  component: PresenceAvatars,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Who else is here. `PresenceAvatars` stacks the people on the page (`users`, `max`, `size`) with their name and activity on hover and focus; `PresenceActivity` says who is editing now; `RemoteCursors` draws other people’s pointers over an area from `cursors` (0 to 1 positions). Your app moves the data (websocket, Liveblocks, Yjs awareness); `cursorPosition(event, element)` gives the position to send.',
      },
    },
  },
  args: { users: [] },
} satisfies Meta<typeof PresenceAvatars>
export default meta
type Story = StoryObj<typeof meta>

const people: PresenceUser[] = [
  { id: 'ada', name: 'Ada Lovelace', activity: 'editing' },
  { id: 'grace', name: 'Grace Hopper', activity: 'viewing Pricing' },
  { id: 'alan', name: 'Alan Turing', status: 'idle' },
  { id: 'katherine', name: 'Katherine Johnson', activity: 'commenting' },
  { id: 'margaret', name: 'Margaret Hamilton' },
  { id: 'edsger', name: 'Edsger Dijkstra', activity: 'viewing' },
  { id: 'barbara', name: 'Barbara Liskov' },
]

/** Four avatars, the rest counted: hover or focus one for the name and what they’re doing. */
export const Avatars: Story = { args: { users: people } }

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <PresenceAvatars users={people.slice(0, 3)} size="sm" />
      <PresenceAvatars users={people.slice(0, 3)} size="default" />
      <PresenceAvatars users={people.slice(0, 3)} size="lg" max={2} />
    </div>
  ),
}

/** A line under an editor: one, two, then many people editing. */
export const Activity: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PresenceActivity users={people.slice(0, 1)} announce={false} />
      <PresenceActivity users={people.slice(0, 2)} announce={false} />
      <PresenceActivity users={people.slice(0, 5)} announce={false} />
      <PresenceActivity
        users={people.slice(1, 2)}
        verb={(names) => `${names} is commenting…`}
        announce={false}
      />
    </div>
  ),
}

const cursors: RemoteCursor[] = [
  { id: 'ada', x: 0.22, y: 0.3 },
  { id: 'grace', x: 0.64, y: 0.55 },
  { id: 'alan', x: 0.42, y: 0.78 },
]

function Canvas() {
  return (
    <div className="grid h-72 grid-cols-3 gap-3 rounded-lg border border-border bg-inset p-4">
      {['Backlog', 'In progress', 'Done'].map((column) => (
        <div key={column} className="flex flex-col gap-2 rounded-md bg-card p-3">
          <p className="m-0 text-[12.5px] font-medium text-fg-secondary">{column}</p>
          <div className="h-10 rounded-sm border border-border-subtle bg-background" />
          <div className="h-10 rounded-sm border border-border-subtle bg-background" />
        </div>
      ))}
    </div>
  )
}

/** Three people’s pointers over a board, with who is here above it. */
export const Cursors: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="m-0 text-[14px] font-medium text-foreground">Sprint board</p>
        <PresenceAvatars users={people.slice(0, 3)} />
      </div>
      <RemoteCursors users={people} cursors={cursors}>
        <Canvas />
      </RemoteCursors>
    </div>
  ),
}

/** Move your pointer over the board: Ada’s cursor follows it, as if your position came back from the server. */
export const FollowThePointer: Story = {
  render: function Render() {
    const [ada, setAda] = React.useState<RemoteCursor>({ id: 'ada', x: 0.5, y: 0.5 })
    return (
      <div
        className="max-w-2xl"
        onPointerMove={(e) => {
          const p = cursorPosition(e, e.currentTarget)
          setAda({ id: 'ada', x: Math.min(1, p.x + 0.04), y: Math.min(1, p.y + 0.06) })
        }}
      >
        <RemoteCursors users={people} cursors={[ada]}>
          <Canvas />
        </RemoteCursors>
      </div>
    )
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => (
    <div className="flex flex-col gap-3">
      <PresenceAvatars users={people} />
      <PresenceActivity users={people.slice(0, 2)} announce={false} />
    </div>
  ),
}
