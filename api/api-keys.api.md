# @coreloom/api-keys

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/api-keys.tsx

```ts
type ApiKey = {}
ApiKey.id: string
ApiKey.name: string
ApiKey.prefix: string
ApiKey.last4: string
ApiKey.scopes?: string[] | undefined
ApiKey.createdAt: Date
ApiKey.lastUsedAt?: Date | undefined
ApiKey.expiresAt?: Date | undefined
ApiKey.createdBy?: string | undefined
type ApiKeyInput = {}
ApiKeyInput.name: string
ApiKeyInput.scopes: string[]
ApiKeyInput.expiresInDays: number | null
function ApiKeys
ApiKeys.keys: ApiKey[]
ApiKeys.scopes?: ApiKeyScope[] | undefined
ApiKeys.onCreate?: ((input: ApiKeyInput) => { secret: string; } | Promise<{ secret: string; }>) | undefined
ApiKeys.onRevoke?: ((id: string) => unknown) | undefined
ApiKeys.title?: React.ReactNode
ApiKeys.description?: React.ReactNode
ApiKeys.className?: string | undefined
type ApiKeyScope = {}
ApiKeyScope.value: string
ApiKeyScope.label: string
ApiKeyScope.description?: string | undefined
```
