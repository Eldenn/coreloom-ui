# @coreloom/voice-agent

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/voice-agent.tsx

```ts
function levelBars(level: number, count: number) => number[]
function LiveTranscript
LiveTranscript.turns: VoiceTurn[]
LiveTranscript.assistantName?: string | undefined
LiveTranscript.announce?: boolean | undefined
LiveTranscript.className?: string | undefined
function PushToTalkButton
PushToTalkButton.state: VoiceState
PushToTalkButton.mode?: TalkMode | undefined
PushToTalkButton.onStart: () => void
PushToTalkButton.onStop: () => void
PushToTalkButton.disabled?: boolean | undefined
PushToTalkButton.className?: string | undefined
type TalkMode = 'hold' | 'toggle'
function VoiceAgent
VoiceAgent.state: VoiceState
VoiceAgent.transcript?: VoiceTurn[] | undefined
VoiceAgent.level?: number | undefined
VoiceAgent.mode?: TalkMode | undefined
VoiceAgent.defaultMode?: TalkMode | undefined
VoiceAgent.onModeChange?: ((mode: TalkMode) => void) | undefined
VoiceAgent.onStart: () => void
VoiceAgent.onStop: () => void
VoiceAgent.name?: string | undefined
VoiceAgent.seed?: string | undefined
VoiceAgent.className?: string | undefined
function VoiceLevel
VoiceLevel.level: number
VoiceLevel.active?: boolean | undefined
VoiceLevel.bars?: number | undefined
VoiceLevel.className?: string | undefined
type VoiceState = { status: 'idle'; } | { status: 'connecting'; } | { status: 'listening'; } | { status: 'thinking'; } | { status: 'speaking'; } | { status: 'error'; error: string; }
type VoiceStatus = 'idle' | 'thinking' | 'listening' | 'error' | 'speaking' | 'connecting'
type VoiceTurn = {}
VoiceTurn.id: string
VoiceTurn.role: 'user' | 'assistant'
VoiceTurn.text: string
VoiceTurn.final?: boolean | undefined
```
