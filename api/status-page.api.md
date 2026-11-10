# @coreloom/status-page

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/status-page.tsx

```ts
function averageUptime(days: readonly UptimeDay[]) => number | undefined
type ComponentStatus = 'partial' | 'operational' | 'degraded' | 'major' | 'maintenance'
function dayStatus(day: UptimeDay) => ComponentStatus | undefined
function formatIncidentDuration(ms: number, locale: string) => string
type Incident = {}
Incident.id: string
Incident.title: string
Incident.impact: IncidentImpact
Incident.updates: IncidentUpdate[]
Incident.components?: string[] | undefined
type IncidentImpact = 'none' | 'critical' | 'major' | 'maintenance' | 'minor'
type IncidentStage = 'completed' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled' | 'inProgress' | 'verifying'
function IncidentTimeline
IncidentTimeline.incident: Incident
IncidentTimeline.className?: string | undefined
type IncidentUpdate = {}
IncidentUpdate.stage: IncidentStage
IncidentUpdate.message: React.ReactNode
IncidentUpdate.at: Date
function isResolved(incident: Pick<Incident, 'updates'>) => boolean
function overallStatus(components: readonly Pick<StatusComponent, 'status'>[]) => ComponentStatus
type StatusComponent = {}
StatusComponent.id: string
StatusComponent.name: string
StatusComponent.description?: string | undefined
StatusComponent.status: ComponentStatus
StatusComponent.group?: string | undefined
StatusComponent.days?: UptimeDay[] | undefined
StatusComponent.uptime?: number | undefined
function StatusPage
StatusPage.components: StatusComponent[]
StatusPage.incidents?: Incident[] | undefined
StatusPage.title?: React.ReactNode
StatusPage.updatedAt?: Date | undefined
StatusPage.onSubscribe?: (() => void) | undefined
StatusPage.className?: string | undefined
function UptimeBar
UptimeBar.days: UptimeDay[]
UptimeBar.name: string
UptimeBar.uptime?: number | undefined
UptimeBar.className?: string | undefined
type UptimeDay = {}
UptimeDay.date: Date
UptimeDay.uptime?: number | undefined
UptimeDay.status?: ComponentStatus | undefined
UptimeDay.incidents?: string[] | undefined
```
