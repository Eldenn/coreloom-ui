# @coreloom/integrations

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/integrations.tsx

```ts
type Integration = {}
Integration.id: string
Integration.name: string
Integration.description: string
Integration.logo?: React.ReactNode
Integration.category?: string | undefined
Integration.connected?: boolean | undefined
Integration.account?: string | undefined
Integration.unavailable?: string | undefined
function Integrations
Integrations.integrations: Integration[]
Integrations.onConnect?: ((id: string) => unknown) | undefined
Integrations.onConfigure?: ((id: string) => unknown) | undefined
Integrations.onDisconnect?: ((id: string) => unknown) | undefined
Integrations.className?: string | undefined
```
