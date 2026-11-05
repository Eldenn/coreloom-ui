import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type SaveState, SaveStatus } from '@/components/ui/save-status'

// The screenshots freeze the clock at this moment.
const NOW = new Date('2026-10-14T10:00:00+02:00')
const twoMinutesAgo = new Date(NOW.getTime() - 2 * 60_000)

const meta = {
  title: 'Components/Feedback/Save status',
  component: SaveStatus,
  tags: ['autodocs'],
  args: { state: 'saved', savedAt: twoMinutesAgo },
  argTypes: {
    state: { control: 'inline-radio', options: ['saved', 'saving', 'unsaved', 'error'] },
    savedAt: { control: 'date' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Where an autosaving document stands. The app passes `state` (`saved`, `saving`, `unsaved`, `error`), `savedAt` for "Saved · 2 minutes ago" and `onRetry` for the Retry button after a failed save. Screen readers hear one polite message when it settles, not each "Saving…".',
      },
    },
  },
} satisfies Meta<typeof SaveStatus>
export default meta
type Story = StoryObj<typeof meta>

/** Saved, with when. */
export const Saved: Story = {}

/** A save is running. */
export const Saving: Story = { args: { state: 'saving' } }

/** Changes not saved yet. */
export const Unsaved: Story = { args: { state: 'unsaved' } }

/** The save failed: Retry calls `onRetry`. */
export const Error: Story = {
  args: {
    state: 'error',
    onRetry: () => {
      // The app saves again here.
    },
  },
}

/** Every state, one per line. */
export const AllStates: Story = {
  render: () => (
    <div className="grid gap-3">
      <SaveStatus state="saved" savedAt={twoMinutesAgo} />
      <SaveStatus state="saving" />
      <SaveStatus state="unsaved" />
      <SaveStatus
        state="error"
        onRetry={() => {
          // The app saves again here.
        }}
      />
    </div>
  ),
}

/**
 * Wired to a fake autosave: type, and the status goes to unsaved, saving, then saved. The
 * "Fail next save" box makes the next save fail so Retry shows.
 */
export const Autosave: Story = {
  render: function Render() {
    const [text, setText] = React.useState('Order service')
    const [state, setState] = React.useState<SaveState>('saved')
    const [savedAt, setSavedAt] = React.useState(twoMinutesAgo)
    const [fail, setFail] = React.useState(false)
    const timer = React.useRef<number>(undefined)
    const id = React.useId()
    const save = () => {
      setState('saving')
      window.setTimeout(() => {
        if (fail) {
          setFail(false)
          setState('error')
          return
        }
        setSavedAt(new Date())
        setState('saved')
      }, 600)
    }
    return (
      <div className="grid max-w-sm gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-name`}>Name</Label>
          <Input
            id={`${id}-name`}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setState('unsaved')
              window.clearTimeout(timer.current)
              timer.current = window.setTimeout(save, 800)
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${id}-fail`}
            checked={fail}
            onCheckedChange={(v) => {
              setFail(v === true)
            }}
          />
          <Label htmlFor={`${id}-fail`}>Fail next save</Label>
        </div>
        <SaveStatus state={state} savedAt={savedAt} onRetry={save} />
      </div>
    )
  },
}

export const French: Story = { render: AllStates.render, globals: { locale: 'fr' } }

export const German: Story = { render: AllStates.render, globals: { locale: 'de' } }
