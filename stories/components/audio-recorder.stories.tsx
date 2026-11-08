import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  appendText,
  AudioRecorder,
  type AudioRecording,
  AudioWaveform,
  DictationButton,
} from '@/components/ui/audio-recorder'
import { PromptInput } from '@/components/ui/prompt-input'

import { installFakeMicrophone, sampleRecording } from './fake-microphone'

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

/** The app's speech-to-text, faked: always the same sentence after a short wait. */
async function transcribe(recording: AudioRecording) {
  await wait(700)
  // A real app sends recording.blob to its speech-to-text service here.
  if (recording.blob.size === 0 && recording.duration > 5) throw new Error('Empty recording')
  return 'Summarise the meeting notes and list the decisions.'
}

const meta = {
  title: 'Components/Media/Audio recorder',
  component: AudioRecorder,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Records a voice note from the microphone: a live waveform and a timer, pause, stop, then the recording to play back or delete. The recording (a `Blob`, its duration and its waveform) goes to the app through `onValueChange`; uploading or transcribing it is the app’s job. `DictationButton` is the compact form for a composer: it records, calls the app’s `onTranscribe` and hands the text back. These stories use a stand-in microphone, so they work without one.',
      },
    },
  },
  args: { maxDuration: 60, disabled: false },
  argTypes: {
    maxDuration: { control: { type: 'number', min: 5, max: 600 } },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => {
      installFakeMicrophone()
      return <div className="max-w-xl">{Story()}</div>
    },
  ],
} satisfies Meta<typeof AudioRecorder>
export default meta
type Story = StoryObj<typeof meta>

/** Record, pause, stop: the recording comes back to play or delete. */
export const Default: Story = {
  render: (args) => {
    const [recording, setRecording] = React.useState<AudioRecording | null>(null)
    return (
      <div className="flex flex-col gap-3">
        <AudioRecorder {...args} value={recording} onValueChange={setRecording} />
        <p className="m-0 text-[13px] text-muted-foreground">
          {recording
            ? `Ready to send: ${recording.mimeType}, ${(recording.blob.size / 1024).toFixed(1)} KB`
            : 'Nothing recorded yet.'}
        </p>
      </div>
    )
  },
}

/** A recording that is already there: play it back, or delete it to record again. */
export const WithRecording: Story = {
  render: (args) => <AudioRecorder {...args} defaultValue={sampleRecording()} />,
}

/** The person refused the microphone: the reason, and a way to try again. */
export const MicrophoneBlocked: Story = {
  render: (args) => <AudioRecorder {...args} constraints={{ deviceId: 'blocked-microphone' }} />,
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: (args) => <AudioRecorder {...args} defaultValue={sampleRecording()} />,
}

/** Dictation in PromptInput's toolbar: the transcript is added after what is already written. */
export const Dictation: Story = {
  render: () => {
    const [text, setText] = React.useState('')
    const [sent, setSent] = React.useState('')
    return (
      <div className="flex flex-col gap-3">
        <PromptInput
          value={text}
          onValueChange={setText}
          onSubmit={({ text: message }) => {
            setSent(message)
          }}
          toolbar={
            <DictationButton
              onTranscribe={transcribe}
              onText={(words) => {
                setText((current) => appendText(current, words))
              }}
            />
          }
        />
        {sent && <p className="m-0 text-[13px] text-muted-foreground">Sent: {sent}</p>}
      </div>
    )
  },
}

/** The waveform alone, for a voice message in a chat or a list. */
export const Waveform: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AudioWaveform levels={sampleRecording().levels} />
      <AudioWaveform levels={sampleRecording().levels} progress={0.4} bars={32} className="w-64" />
    </div>
  ),
}
