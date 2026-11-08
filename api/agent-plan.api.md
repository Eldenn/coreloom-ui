# @coreloom/agent-plan

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/agent-plan.tsx

```ts
function AgentPlan
AgentPlan.plan: AiPlan
AgentPlan.label?: React.ReactNode
AgentPlan.active?: boolean | undefined
AgentPlan.announce?: boolean | undefined
AgentPlan.defaultOpen?: boolean | undefined
AgentPlan.avatar?: Pick<{ name?: string; state?: import("@/components/ui/agent-avatar").AgentAvatarState; variant?: import("@/components/ui/agent-avatar").AgentAvatarVariant; shape?: import("@/components/ui/agent-avatar").AgentAvatarShape | 'seed'; seed?: string; tone?: import("@/components/ui/agent-avatar").AgentAvatarTone; eyes?: import("@/components/ui/agent-avatar").AgentAvatarEyes; size?: import("@/components/ui/agent-avatar").AgentAvatarSize; animated?: boolean; decorative?: boolean; } & Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'>, 'shape' | 'variant' | 'tone' | 'seed' | 'eyes'> | undefined
AgentPlan.className?: string | undefined
```
