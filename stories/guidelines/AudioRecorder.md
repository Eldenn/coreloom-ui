# Audio Recorder

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Records a voice note from the microphone: a live waveform and a timer while it records, pause and stop, then the recording to play back or delete. Nothing leaves the browser: the recording goes to the app, which uploads it, attaches it to a message or sends it to a speech-to-text service. `DictationButton` is the compact form for a composer such as PromptInput: it records, hands the audio to the app's transcription and gives the text back.

**The consumer provides** `onValueChange(recording)` (a new `AudioRecording` when a recording ends, `null` when it's deleted), and optionally `value` / `defaultValue` (a recording to show), `maxDuration` (seconds; recording stops by itself there and the timer shows the limit), `constraints` (passed to `getUserMedia` as `audio`: a `deviceId`, `noiseSuppression`…), `label` (the group's accessible name, "Voice recording" by default), `disabled` and `className`. An `AudioRecording` has the `blob`, its `mimeType`, its `duration` in seconds (recorded files often carry none) and the `levels` (0–1) of its waveform.

**`DictationButton` takes** `onTranscribe(recording) => Promise<string>` (your speech-to-text call; reject to show an error), `onText(text)` (where the text goes; `appendText(current, text)` adds it after what is already written, with one space), and optionally `maxDuration` (120 seconds by default), `constraints`, `disabled` and `className`.

```tsx
const [text, setText] = React.useState('')
<PromptInput value={text} onValueChange={setText} onSubmit={send}
  toolbar={<DictationButton onTranscribe={transcribe} onText={(t) => setText((v) => appendText(v, t))} />} />
```

- The browser asks for the microphone the first time. A refusal shows the reason (allow it in the site settings) and **Try again**; no microphone, or a browser that can't record, says so too.
- While recording: a red dot and "Recording" (the word, not only the colour), the waveform of the last few seconds, the time, **Pause** / **Resume**, **Discard** (drops the audio) and **Stop**. Focus moves to Stop when recording starts, to Play when it ends, and back to Record after a delete, unless the person had moved elsewhere.
- One polite live region says what changed: recording, paused, "Recording ready, 0:12", or the error.
- The pulsing dot stops for reduced motion; the waveform only follows the sound.
- `useAudioRecorder({ onComplete, maxDuration, constraints })` gives the same recorder (`state`, `start`, `pause`, `resume`, `stop`, `cancel`, `reset`) for a UI of your own, and `AudioWaveform` draws `levels` (with `progress` for playback) in a voice message.
- The microphone needs a secure page (https or localhost). The format is the browser's: WebM/Opus in Chrome and Firefox, MP4/AAC in Safari; `mimeType` tells which.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/audio-recorder`.
