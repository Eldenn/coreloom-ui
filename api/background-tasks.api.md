# @coreloom/background-tasks

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/background-tasks.tsx

```ts
type BackgroundTask = {}
BackgroundTask.id: string
BackgroundTask.label: string
BackgroundTask.status: BackgroundTaskStatus
BackgroundTask.detail?: string | undefined
BackgroundTask.startedAt?: string | Date | undefined
BackgroundTask.finishedAt?: string | Date | undefined
BackgroundTask.progress?: number | undefined
BackgroundTask.error?: string | undefined
function BackgroundTaskList
BackgroundTaskList.className?: string | undefined
BackgroundTaskList.onDismiss?: ((id: string) => void) | undefined
BackgroundTaskList.tasks: BackgroundTask[]
function BackgroundTasks
BackgroundTasks.tasks: BackgroundTask[]
BackgroundTasks.open?: boolean | undefined
BackgroundTasks.defaultOpen?: boolean | undefined
BackgroundTasks.onOpenChange?: ((open: boolean) => void) | undefined
BackgroundTasks.onDismiss?: ((id: string) => void) | undefined
BackgroundTasks.className?: string | undefined
type BackgroundTasksProps = {}
BackgroundTasksProps.tasks: BackgroundTask[]
BackgroundTasksProps.open?: boolean | undefined
BackgroundTasksProps.defaultOpen?: boolean | undefined
BackgroundTasksProps.onOpenChange?: ((open: boolean) => void) | undefined
BackgroundTasksProps.onDismiss?: ((id: string) => void) | undefined
BackgroundTasksProps.className?: string | undefined
type BackgroundTaskStatus = 'done' | 'running' | 'failed' | 'queued'
function countActiveTasks(tasks: readonly BackgroundTask[]) => number
function endedTasks(previous: readonly BackgroundTask[], next: readonly BackgroundTask[]) => BackgroundTask[]
function sortBackgroundTasks(tasks: readonly BackgroundTask[]) => BackgroundTask[]
```
