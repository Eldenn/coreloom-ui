---
'@coreloom/ui': minor
---

### Added

- `NodeEditor`: notes and groups on the canvas. `Workflow.notes` (`{ id, position, width, height,
text, color? }`) and `Workflow.groups` (`{ id, position, width, height, label, color? }`) sit behind
  the cards and are never run nor checked. Add them from the toolbar or the canvas menu; Ctrl/⌘+G
  groups the selection. Text and names are edited in place, both resize from handles and take a
  colour from their right-click menu; moving a group moves what's inside, and Tidy up refits groups.
- `NodeEditor`: "Find on the canvas" (Ctrl/⌘+F) lists nodes, notes and groups; picking one selects
  it, brings it into view and focuses it.
- `NodeEditor`: a minimap (React Flow's `MiniMap`, pannable and zoomable) with a toolbar toggle; the
  `minimap` prop (default true) removes both when false.
- Helpers in `node-editor-canvas`: `addNote`, `addGroup`, `updateNote`, `updateGroup`, `moveGroup`,
  `groupMembers`, `removeCanvasItems`, `refitGroups`.

### Fixed

- `removeNodes` kept only `nodes` and `edges`; it now keeps the rest of the workflow.

### Upgrading

- Re-install `@coreloom/i18n` (and `-es` / `-de`) with `--overwrite` (new `nodeCanvas` group), then
  `@coreloom/node-editor`, which adds `node-editor-canvas.tsx`.
- If your app stores or executes workflows, keep `notes` and `groups` when you save, and ignore them
  when you run.
