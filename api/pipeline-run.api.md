# @coreloom/pipeline-run

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/pipeline-run.tsx

```ts
function formatRunDuration(ms: number, locale: string) => string
type PipelineJob = {}
PipelineJob.id: string
PipelineJob.name: string
PipelineJob.status: PipelineStatus
PipelineJob.durationMs?: number | undefined
PipelineJob.steps: readonly PipelineStep[]
function PipelineRun
PipelineRun.title: React.ReactNode
PipelineRun.status: PipelineStatus
PipelineRun.jobs: readonly PipelineJob[]
PipelineRun.meta?: React.ReactNode
PipelineRun.durationMs?: number | undefined
PipelineRun.onRerun?: (() => void) | undefined
PipelineRun.onCancel?: (() => void) | undefined
PipelineRun.onRerunJob?: ((job: PipelineJob) => void) | undefined
PipelineRun.defaultJob?: string | undefined
PipelineRun.logHeight?: string | number | undefined
PipelineRun.timeZone?: string | undefined
PipelineRun.actions?: React.ReactNode
PipelineRun.className?: string | undefined
type PipelineStatus = 'running' | 'failed' | 'skipped' | 'success' | 'queued' | 'cancelled'
function PipelineStatusIcon
PipelineStatusIcon.status: PipelineStatus
PipelineStatusIcon.className?: string | undefined
type PipelineStep = {}
PipelineStep.id: string
PipelineStep.name: string
PipelineStep.status: PipelineStatus
PipelineStep.durationMs?: number | undefined
PipelineStep.log?: string | readonly LogEntry[] | undefined
```
