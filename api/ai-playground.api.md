# @coreloom/ai-playground

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ai-playground.tsx

```ts
function Playground
Playground.models: AiModel[]
Playground.defaultVariants: PlaygroundVariant[]
Playground.defaultSystem?: string | undefined
Playground.defaultPrompt?: string | undefined
Playground.results?: Record<string, PlaygroundResult | undefined> | undefined
Playground.onRun: (request: { system: string; prompt: string; variants: PlaygroundVariant[]; }) => void
Playground.maxVariants?: number | undefined
Playground.className?: string | undefined
type PlaygroundResult = {}
PlaygroundResult.status: 'done' | 'idle' | 'error' | 'running'
PlaygroundResult.text?: string | undefined
PlaygroundResult.latencyMs?: number | undefined
PlaygroundResult.tokens?: number | undefined
PlaygroundResult.cost?: number | undefined
PlaygroundResult.error?: string | undefined
type PlaygroundVariant = {}
PlaygroundVariant.id: string
PlaygroundVariant.model: string
PlaygroundVariant.temperature: number
```
