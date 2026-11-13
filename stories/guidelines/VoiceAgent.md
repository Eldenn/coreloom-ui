# Voice agent

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

The face of a spoken conversation with an AI: an animated avatar that shows whether it is listening, thinking or speaking, a level meter, a push-to-talk button and the live transcript, partial words included. The app owns the microphone and the model (a realtime speech API, a speech-to-text then text-to-speech chain); the block shows the state and turns the person's presses into `onStart` and `onStop`.

**The consumer provides** `<VoiceAgent state transcript level mode defaultMode onModeChange onStart onStop name seed>`: `state` is `{ status: "idle" | "connecting" | "listening" | "thinking" | "speaking" }` or `{ status: "error", error }`; `transcript` is `{ id, role, text, final? }[]`, oldest first, with `role` user or assistant and `final: false` while words are still coming in; `level` is 0 to 1 (the microphone while listening, the voice while speaking). `onStart` opens the microphone (also to talk over the agent), `onStop` closes it and sends what was said. `mode` is `hold` (default) or `toggle`; `onModeChange` shows a "Hands-free" switch. `name` and `seed` give the avatar its name and look.

**`PushToTalkButton` takes** `state`, `mode`, `onStart`, `onStop` and `disabled`. **`LiveTranscript` takes** `turns`, `assistantName` and `announce` (default true). **`VoiceLevel` takes** `level`, `active` and `bars`.

- Hold to talk: press and hold the button, or hold Space or Enter while it has focus; letting go (or leaving the button) stops. In hands-free mode a tap starts and another stops; the button says "Stop talking" and is `aria-pressed`.
- One polite live region announces the state ("Listening…") and each finished turn ("Ada: …"); partial words are shown, not read.
- The status is always written under the avatar; an error says what to do ("The microphone is blocked…"), the avatar turns red and the talk button loses its accent, though it still works.
- The level meter is decorative; it stops moving for reduced motion. Compute `level` from your audio (an `AnalyserNode`'s RMS), throttled to animation frames.
- Ask for the microphone only when the person first presses the button, and say why.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/voice-agent`.
