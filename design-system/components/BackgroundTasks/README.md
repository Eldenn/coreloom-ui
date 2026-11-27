# Background tasks

An icon button for the app header that shows the long jobs someone launched while they run and right after they end, and a popover listing them.

**Install** `pnpm dlx shadcn@latest add @coreloom/background-tasks`. It writes `background-tasks.tsx`; put `<BackgroundTasks>` in the app shell's `headerActions`.

**The consumer provides** `tasks` (`[{ id, label, status, detail?, startedAt?, finishedAt?, progress?, error? }]`, `status` one of `queued`, `running`, `done`, `failed`), and optionally `open` / `defaultOpen` / `onOpenChange` and `onDismiss(id)`. `BackgroundTaskList` is the list without the popover.

- The trigger spins and shows a count while tasks are queued or running; its name says it ("Background tasks, 2 running").
- Rows: running, queued, then finished (most recent first), each with a status icon and the status in words, detail, relative time, progress when given, and the error of a failed task.
- A task that finishes or fails is announced by one polite live region, popover open or not.

_On `window.CoreloomUIDesignSystem_ff5f32` as `BackgroundTasks` and `BackgroundTaskList`._
