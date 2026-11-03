# Gantt

A roadmap on a timeline: bars with progress, milestones, dependency arrows, groups, a today line, and a day / week / month zoom.

**Install** `pnpm dlx shadcn@latest add @coreloom/gantt`. It writes `gantt.tsx`.

**The consumer provides** `<Gantt tasks today defaultZoom onTaskChange onTaskClick selectedId title toolbar>`: tasks are `{ id, name, start, end, progress?, group?, dependsOn?, milestone?, tone? }`.

- With `onTaskChange`, bars move and resize with the mouse; Left / Right move a focused bar by a day, Shift moves its end.
- Each bar is a button named with its dates, progress and what it waits for. A late dependency turns its arrow red.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Gantt`._
