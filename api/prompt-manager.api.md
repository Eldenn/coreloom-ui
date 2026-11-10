# @coreloom/prompt-manager

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/prompt-manager.tsx

```ts
function fillTemplate(text: string, values: Readonly<Record<string, string>>) => string
function PromptManager
PromptManager.name: React.ReactNode
PromptManager.versions: PromptVersion[]
PromptManager.defaultVersionId?: string | undefined
PromptManager.labels?: string[] | undefined
PromptManager.defaultValues?: Record<string, string> | undefined
PromptManager.onSave?: ((input: { text: string; message: string; baseVersionId: string; }) => PromptVersion | undefined | Promise<PromptVersion | undefined>) | undefined
PromptManager.onDeploy?: ((versionId: string, label: string) => unknown) | undefined
PromptManager.onTest?: ((input: PromptTestInput) => PromptTestResult) | undefined
PromptManager.className?: string | undefined
type PromptTestInput = {}
PromptTestInput.text: string
PromptTestInput.filled: string
PromptTestInput.variables: Record<string, string>
PromptTestInput.versionId: string
PromptTestInput.signal: AbortSignal
type PromptTestResult = string | Promise<string> | AsyncIterable<string>
type PromptVersion = {}
PromptVersion.id: string
PromptVersion.version: number
PromptVersion.text: string
PromptVersion.message?: string | undefined
PromptVersion.author?: string | undefined
PromptVersion.createdAt: Date
PromptVersion.labels?: string[] | undefined
function templateVariables(text: string) => string[]
```
