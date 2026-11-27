# Background tasks

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

An icon button for the app header that shows the long jobs someone launched (a catalog refresh, scans, an import) while they run and right after they end, instead of only a toast. It is not a notification centre: nothing is read or unread, a task is there while it matters.

**Install** `pnpm dlx shadcn@latest add @coreloom/background-tasks`. It writes `background-tasks.tsx`; put `<BackgroundTasks>` in the app shell's `headerActions`, next to the notifications.

**The consumer provides** `tasks` (`[{ id, label, status, detail?, startedAt?, finishedAt?, progress?, error? }]`, `status` one of `queued`, `running`, `done`, `failed`, dates as `Date` or ISO strings), polled from its API, and optionally:

- `open` / `defaultOpen` / `onOpenChange`: control the popover, to open it when the person launches a task.
- `onDismiss(id)`: finished tasks get a dismiss button; remove the task from `tasks` in it.
- `className` on the trigger.

`BackgroundTaskList` (`tasks`, `onDismiss`, `className`) is the same list without the popover, for a page or a side panel.

- The trigger spins while a task is queued or running and carries their count; its name says it ("Background tasks, 2 running"). Otherwise it shows a still icon and is named "Background tasks".
- The popover lists running tasks, then queued ones (both in the order given), then finished ones, most recent first. Each row has a status icon **and** the status in words, the label, the detail, when it started or ended, a progress bar while running when `progress` (0 to 100) is set, and the error of a failed task as text.
- When a task goes from queued or running to done or failed, one polite live region outside the popover says it ("Import from GitHub: done."), so it is heard with the popover closed. A task first seen finished is not announced.
- Escape closes the popover and focus goes back to the trigger. After a dismiss, focus stays in the list.
- Name tasks for what they do to what — "Code map of coreloom-api", not "Job 42" — and drop finished ones after a while so the list stays short. For an error the person must act on, a toast or an alert is still the place.
