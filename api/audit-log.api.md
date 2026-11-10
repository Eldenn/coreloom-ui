# @coreloom/audit-log

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/audit-log.tsx

```ts
type AuditAction = {}
AuditAction.value: string
AuditAction.label: string
type AuditActor = {}
AuditActor.name: string
AuditActor.email?: string | undefined
AuditActor.avatar?: string | undefined
AuditActor.type?: 'system' | 'user' | 'api' | undefined
type AuditEvent = {}
AuditEvent.id: string
AuditEvent.actor: AuditActor
AuditEvent.action: string
AuditEvent.target?: string | undefined
AuditEvent.at: Date
AuditEvent.ip?: string | undefined
AuditEvent.location?: string | undefined
AuditEvent.metadata?: unknown
function AuditLog
AuditLog.events: AuditEvent[]
AuditLog.actions?: AuditAction[] | undefined
AuditLog.hasMore?: boolean | undefined
AuditLog.loading?: boolean | undefined
AuditLog.onLoadMore?: (() => unknown) | undefined
AuditLog.onExport?: ((events: AuditEvent[]) => unknown) | undefined
AuditLog.title?: React.ReactNode
AuditLog.className?: string | undefined
function filterAuditEvents(events: readonly AuditEvent[], { query, actor, action, actionLabel, }: { query?: string; actor?: string; action?: string; actionLabel?: (v: string) => string; }) => AuditEvent[]
```
