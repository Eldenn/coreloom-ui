# Gantt

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A roadmap on a timeline: each task is a bar (with its progress), milestones are diamonds, arrows join a task to the ones it waits for, tasks sit under their group, and a line marks today. The zoom switches between days, weeks and months; Today scrolls back to it.

**The consumer provides** `<Gantt tasks today zoom defaultZoom onZoomChange selectedId onTaskClick onTaskChange title toolbar>`: `tasks` are `{ id, name, start, end, progress?, group?, dependsOn?, milestone?, tone? }` (`end` is the last day, included; `progress` 0 to 100; `tone` one of primary, success, warning, danger, info, neutral). `defaultZoom` is `"week"`; `today` is the current date by default (pass it for stable screenshots). `onTaskChange(id, { start, end })` makes bars movable and receives the new dates once a move ends.

- With `onTaskChange`, drag a bar to move it, or its ends to change its start or end. Keyboard: focus a bar, Left / Right move it by a day, Alt + Left / Right move its start, Shift + Left / Right move its end. The new dates are announced. The ends are 8 px wide and can be grabbed from 24 px.
- Each bar is a button named with the task, its dates, its progress and what it waits for ("Write the spec, 5 Oct 2026 to 16 Oct 2026, 70% done, after User research"); colour and arrows are never the only signal.
- An arrow turns red and dashed when a task starts before the one it waits for has ended, and the bar's name says so ("starts before Checkout screens ends").
- `onTaskClick` and `selectedId` let you open your own task panel or dialog.
- The task names stay visible while the timeline scrolls sideways; on phones the name column narrows.
- Not for hour-level schedules (use the event calendar) or for hundreds of rows (it doesn't virtualize).

**In an app:** `pnpm dlx shadcn@latest add @coreloom/gantt`.
