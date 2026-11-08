import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  LiveTranscript,
  PushToTalkButton,
  VoiceAgent,
  type VoiceState,
  type VoiceTurn,
} from '@/components/voice-agent'

const conversation: VoiceTurn[] = [
  { id: 'u1', role: 'user', text: 'What’s on my calendar tomorrow morning?' },
  {
    id: 'a1',
    role: 'assistant',
    text: 'You have the design review at 9:30 and a call with Northwind at 11.',
  },
  { id: 'u2', role: 'user', text: 'Move the Northwind call to the afternoon', final: false },
]

const reply = 'Done. The Northwind call is now at 2 p.m. I’ve let them know.'

/**
 * A simulated model: hold to talk, words come in while you speak, then it thinks and answers.
 * A real app opens the microphone in `onStart` and streams to its speech model.
 */
function useDemoVoice() {
  const [state, setState] = React.useState<VoiceState>({ status: 'idle' })
  const [turns, setTurns] = React.useState<VoiceTurn[]>(conversation.slice(0, 2))
  const [level, setLevel] = React.useState(0)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const later = (ms: number, run: () => void) => {
    timers.current.push(setTimeout(run, ms))
  }
  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )
  const said = conversation[2].text.split(' ')
  return {
    state,
    transcript: turns,
    level,
    onStart: () => {
      setState({ status: 'listening' })
      setLevel(0.6)
      said.forEach((_, i) => {
        later(250 * (i + 1), () => {
          setLevel(0.35 + ((i * 37) % 60) / 100)
          setTurns((ts) => [
            ...ts.filter((t) => t.id !== 'u'),
            { id: 'u', role: 'user', text: said.slice(0, i + 1).join(' '), final: false },
          ])
        })
      })
    },
    onStop: () => {
      timers.current.forEach(clearTimeout)
      setLevel(0)
      setTurns((ts) =>
        ts.map((t) => (t.id === 'u' ? { ...t, id: `u${String(ts.length)}`, final: true } : t)),
      )
      setState({ status: 'thinking' })
      later(900, () => {
        setState({ status: 'speaking' })
        setLevel(0.5)
        setTurns((ts) => [...ts, { id: `a${String(ts.length)}`, role: 'assistant', text: reply }])
      })
      later(3200, () => {
        setState({ status: 'idle' })
        setLevel(0)
      })
    },
  }
}

const meta = {
  title: 'Blocks/AI/Voice agent',
  component: VoiceAgent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The face of a spoken conversation with an AI: an avatar that listens, thinks and speaks, a level meter, a push-to-talk button (hold it, or Space while it has focus; or hands-free, tap to start and stop) and the live transcript, partial words included. The consumer owns the microphone and the model: `onStart` / `onStop`, and feeds back `state`, `transcript` and `level`. Nothing is recorded or sent by the block.',
      },
    },
  },
  args: {
    state: { status: 'idle' },
    transcript: conversation.slice(0, 2),
    name: 'Ada',
    seed: 'ada',
    onStart: () => {},
    onStop: () => {},
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VoiceAgent>
export default meta
type Story = StoryObj<typeof meta>

/** Hold the button (or Space) and let go: the simulated agent thinks, then answers. */
export const Conversation: Story = {
  render: function Render(args) {
    const voice = useDemoVoice()
    const [mode, setMode] = React.useState<'hold' | 'toggle'>('hold')
    return <VoiceAgent {...args} {...voice} mode={mode} onModeChange={setMode} />
  },
}

export const Idle: Story = { args: { transcript: [] } }

/** Words come in while the person speaks (lighter, with a caret). */
export const Listening: Story = {
  args: { state: { status: 'listening' }, transcript: conversation, level: 0.7 },
}

export const Thinking: Story = {
  args: {
    state: { status: 'thinking' },
    transcript: conversation.map((t) => ({ ...t, final: true })),
  },
}

export const Speaking: Story = {
  args: {
    state: { status: 'speaking' },
    level: 0.5,
    transcript: [
      ...conversation.map((t) => ({ ...t, final: true })),
      { id: 'a2', role: 'assistant', text: reply },
    ],
  },
}

export const Connecting: Story = { args: { state: { status: 'connecting' }, transcript: [] } }

export const Failed: Story = {
  args: {
    state: {
      status: 'error',
      error: 'The microphone is blocked. Allow it in the browser’s address bar.',
    },
  },
}

/** Hands-free: tap to start, tap to stop. */
export const HandsFree: Story = {
  args: { mode: 'toggle', state: { status: 'listening' }, level: 0.4 },
}

/** The parts alone: a button and a transcript for your own layout. */
export const Parts: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6">
      <PushToTalkButton state={{ status: 'idle' }} onStart={() => {}} onStop={() => {}} />
      <LiveTranscript turns={conversation} assistantName="Ada" className="w-full" />
    </div>
  ),
}

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
