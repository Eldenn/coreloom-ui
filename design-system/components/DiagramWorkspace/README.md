# Diagram Workspace

The editor of a document with several diagrams: its name in place, the save state, the list of views (add a chosen kind, or import files picked in the Add menu or dropped on the workspace; rename, reorder, delete with a confirmation, never the last one) and a controlled DiagramEditor for the open view. On a phone the list is in a side sheet.

**`DiagramWorkspace` takes** `title`, `onTitleChange`, `diagrams` (`{ id, title, value, format }[]`), `activeId`, `onActiveChange`, `onDiagramChange(id, value, result, format)`, `onAdd(kind)`, `onRename`, `onReorder`, `onDelete`, `saveState`, and optionally `onImport({ title, value, result, format })`, `savedAt`, `onRetrySave`, `actions` and `className`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-workspace`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
