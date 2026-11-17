---
'@coreloom/ui': patch
---

### Fixed

- `Gantt`: a task that starts before the one it waits for ends now says so in its name ("starts
  before Checkout screens ends") and its arrow is dashed as well as red. Today no longer scrolls
  smoothly when the system asks for reduced motion. The ends of a bar can be grabbed from 24 px.
- `Spreadsheet`: a cell that isn't a number in a number column has a mark in its corner, not only
  red text. The help read with the grid says that Tab moves along the row and leaves at either end.
- `Ide`: a tab whose file has errors shows their count and is announced with it ("format.ts,
  1 error, 0 warnings"). The close mark of a tab shows on keyboard focus and on touch screens, is
  24 px wide, and the tab exposes Delete as its shortcut.
- `EventCalendar`: the button that collapses a busy day is named "Show less" (it was "−"); the
  month is announced through a status message instead of a live heading; in the phone agenda,
  today's card says "Today" and day labels are no longer headings.
- `StatusPage`: on phones, the uptime slider counts and steps through the 30 days shown, not the
  hidden ones.
- `DiagramEditor`: each problem under the text starts with "Error" or "Warning", and long ones wrap
  instead of being cut.
- `AgentBuilder`: a tool parameter's description shows under its field and is read with it; it was
  a tooltip that the keyboard and touch couldn't reach.

### Added

- `Gantt`: Alt + Left / Right move a task's start alone, as Shift does for its end.
