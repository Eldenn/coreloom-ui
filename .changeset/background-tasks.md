---
'@coreloom/ui': minor
---

### Added

- **BackgroundTasks** (new block `background-tasks`, experimental): an icon button for the app header that spins while long jobs are queued or running, with their count, and a popover listing them (running, queued, then finished, most recent first), each with its status in words, detail, relative time, progress and error. `open` / `defaultOpen` / `onOpenChange` control the popover; `onDismiss` adds a dismiss button to finished tasks. One polite live region announces a task that finishes or fails, popover open or not. `BackgroundTaskList` is the list on its own. The helpers `sortBackgroundTasks`, `countActiveTasks` and `endedTasks` are exported too. New strings in the `backgroundTasks` group of every locale.
