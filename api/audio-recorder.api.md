# @coreloom/audio-recorder

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/audio-recorder.tsx

```ts
function appendText(current: string, addition: string) => string
function AudioRecorder
AudioRecorder.value?: AudioRecording | null | undefined
AudioRecorder.defaultValue?: AudioRecording | null | undefined
AudioRecorder.onValueChange?: ((recording: AudioRecording | null) => void) | undefined
AudioRecorder.maxDuration?: number | undefined
AudioRecorder.constraints?: MediaTrackConstraints | undefined
AudioRecorder.disabled?: boolean | undefined
AudioRecorder.label?: string | undefined
AudioRecorder.className?: string | undefined
type AudioRecording = {}
AudioRecording.blob: Blob
AudioRecording.mimeType: string
AudioRecording.duration: number
AudioRecording.levels: number[]
function AudioWaveform
AudioWaveform.levels: readonly number[]
AudioWaveform.bars?: number | undefined
AudioWaveform.progress?: number | undefined
AudioWaveform.className?: string | undefined
function DictationButton
DictationButton.onTranscribe: (recording: AudioRecording) => Promise<string>
DictationButton.onText: (text: string) => void
DictationButton.maxDuration?: number | undefined
DictationButton.constraints?: MediaTrackConstraints | undefined
DictationButton.disabled?: boolean | undefined
DictationButton.className?: string | undefined
```

## src/components/ui/use-audio-recorder.ts

```ts
type AudioRecorderError = 'failed' | 'denied' | 'unsupported'
type AudioRecorderState = { status: 'idle'; } | { status: 'requesting'; } | { status: 'recording'; paused: boolean; elapsed: number; levels: number[]; } | { status: 'error'; error: AudioRecorderError; }
type AudioRecording = {}
AudioRecording.blob: Blob
AudioRecording.mimeType: string
AudioRecording.duration: number
AudioRecording.levels: number[]
function formatClock(seconds: number) => string
function levelFromRms(rms: number) => number
function pickMimeType(isSupported: (type: string) => boolean) => string
function recorderErrorOf(error: unknown) => AudioRecorderError
function resampleLevels(levels: readonly number[], count: number) => number[]
function rmsOf(samples: Float32Array | readonly number[]) => number
function useAudioRecorder({ onComplete, maxDuration, constraints, }: { onComplete: (recording: AudioRecording) => void; maxDuration?: number; constraints?: MediaTrackConstraints; }) => { state: AudioRecorderState; start: () => Promise<void>; stop: () => void; pause: () => void; resume: () => void; cancel: () => void; reset: () => void; }
```
