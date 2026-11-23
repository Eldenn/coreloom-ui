---
'@coreloom/ui': minor
---

### Changed

- **UmlDiagram**: lines go round the boxes instead of behind them. Each line takes straight runs
  and right angles past every box but its two ends (and the frames they sit in), lines that share
  a corridor or a side of a box are set side by side, and a label is put where it covers no box,
  no frame's name and no other label, above the lines it crosses. The paths come from the new
  `routeEdges` in `@/lib/uml-route` (pure: boxes and lines in, points out), installed with
  `@coreloom/uml`.

### Upgrading

- `flowEdges` takes the laid-out `boxes`, and an edge's `data` holds its `route` in place of
  `offset` and `flow`. Only an app that builds React Flow edges itself from `uml-diagram-flow` is
  concerned; `UmlDiagram`'s props don't change.
