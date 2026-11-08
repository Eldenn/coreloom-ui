# @coreloom/agent-avatar

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/agent-avatar.tsx

```ts
function AgentAvatar
AgentAvatar.name?: string | undefined
AgentAvatar.state?: AgentAvatarState | undefined
AgentAvatar.variant?: AgentAvatarVariant | undefined
AgentAvatar.shape?: AgentAvatarShape | 'seed' | undefined
AgentAvatar.seed?: string | undefined
AgentAvatar.tone?: AgentAvatarTone | undefined
AgentAvatar.eyes?: AgentAvatarEyes | undefined
AgentAvatar.size?: AgentAvatarSize | undefined
AgentAvatar.animated?: boolean | undefined
AgentAvatar.decorative?: boolean | undefined
AgentAvatar.*: react
type AgentAvatarEyes = 'square' | 'round' | 'tall'
function agentAvatarLook(seed: string) => { tone: AgentAvatarTone; eyes: AgentAvatarEyes; shape: AgentAvatarShape; phase: number; }
type AgentAvatarShape = 'square' | 'circle' | 'hexagon' | 'diamond' | 'shield' | 'blob'
type AgentAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type AgentAvatarState = 'done' | 'idle' | 'thinking' | 'listening' | 'error' | 'offline' | 'speaking'
type AgentAvatarTone = 'primary' | 'neutral' | 'teal' | 'violet' | 'orange' | 'blue' | 'pink'
type AgentAvatarVariant = 'face' | 'dots'
```
