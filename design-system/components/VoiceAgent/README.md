# Voice agent

The face of a spoken conversation with an AI: avatar, level meter, push-to-talk and live transcript. Experimental.

**Install** `pnpm dlx shadcn@latest add @coreloom/voice-agent`. It writes `voice-agent.tsx`.

**The consumer provides** `<VoiceAgent state transcript level onStart onStop>`: state `{ status }` (idle, connecting, listening, thinking, speaking, or error with `error`), turns `{ id, role, text, final? }`, level 0–1.

- Hold the button or Space to talk; hands-free mode toggles. One live region announces the state and finished turns.

_On `window.CoreloomUIDesignSystem_ff5f32` as `VoiceAgent`, `PushToTalkButton`, `LiveTranscript`, `VoiceLevel`._
