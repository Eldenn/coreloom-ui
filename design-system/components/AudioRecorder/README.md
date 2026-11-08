# Audio Recorder

Records a voice note from the microphone: a live waveform and a timer, pause and stop, then the recording to play back or delete. The recording goes to the app; nothing is uploaded. `DictationButton` is the compact form for PromptInput's toolbar: it records, calls the app's `onTranscribe` and gives the text back.

**`AudioRecorder` takes** `value` / `defaultValue`, `onValueChange(recording)`, and optionally `maxDuration`, `constraints`, `label`, `disabled` and `className`. **`DictationButton` takes** `onTranscribe(recording) => Promise<string>`, `onText(text)`, and optionally `maxDuration`, `constraints` and `disabled`.

- Focus moves to Stop when recording starts, to Play when it ends.
- A refused microphone says why and offers Try again.
- One polite live region announces each change.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/audio-recorder`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
