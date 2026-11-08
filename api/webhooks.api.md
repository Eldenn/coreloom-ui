# @coreloom/webhooks

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/webhooks.tsx

```ts
function isHttpsUrl(value: string) => boolean
type WebhookDelivery = {}
WebhookDelivery.id: string
WebhookDelivery.endpointId: string
WebhookDelivery.event: string
WebhookDelivery.status: 'pending' | 'failed' | 'succeeded'
WebhookDelivery.statusCode?: number | undefined
WebhookDelivery.at: Date
WebhookDelivery.durationMs?: number | undefined
WebhookDelivery.attempt?: number | undefined
WebhookDelivery.payload?: unknown
WebhookDelivery.response?: string | undefined
type WebhookEndpoint = {}
WebhookEndpoint.id: string
WebhookEndpoint.url: string
WebhookEndpoint.description?: string | undefined
WebhookEndpoint.events: string[]
WebhookEndpoint.enabled: boolean
WebhookEndpoint.secret?: string | undefined
type WebhookEventType = {}
WebhookEventType.value: string
WebhookEventType.label: string
WebhookEventType.description?: string | undefined
type WebhookInput = {}
WebhookInput.url: string
WebhookInput.description: string
WebhookInput.events: string[]
function Webhooks
Webhooks.endpoints: WebhookEndpoint[]
Webhooks.deliveries?: WebhookDelivery[] | undefined
Webhooks.events: WebhookEventType[]
Webhooks.defaultOpenId?: string | undefined
Webhooks.onCreate?: ((input: WebhookInput) => unknown) | undefined
Webhooks.onToggle?: ((id: string, enabled: boolean) => unknown) | undefined
Webhooks.onDelete?: ((id: string) => unknown) | undefined
Webhooks.onRedeliver?: ((delivery: WebhookDelivery) => unknown) | undefined
Webhooks.onSendTest?: ((endpointId: string) => unknown) | undefined
Webhooks.onRevealSecret?: ((endpointId: string) => void) | undefined
Webhooks.title?: React.ReactNode
Webhooks.description?: React.ReactNode
Webhooks.className?: string | undefined
```
