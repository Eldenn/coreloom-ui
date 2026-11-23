---
'@coreloom/ui': minor
---

### Added

- **DiagramWorkspace**, **DiagramEditor**, **UmlDiagram**, **SequenceDiagramView**: `contextActions(target)`, the app's entries in a context menu. A right-click, a long press, or the context-menu key or Shift+F10 on a focused target opens it on a view of the workspace's list, or on an element, a member (a class attribute or method, an ER attribute), a relation or a sequence step of a drawing. The component's own entries come first while it can be edited (a view: Rename, and Delete asked first as with its button; an element: Rename, Duplicate, Delete; a relation, a step or a member: Delete), then a separator and the app's. A right-click on something not selected selects it alone. Without `contextActions`, or with nothing to show, no menu opens and the browser's own stays.
- Each target carries a `label`, one line made from the diagram for a chip or a prompt: `Payment`, `Payment.total: number`, `Order → Payment: pays`, `Client -> API: login()`. The types are `DiagramContextTarget` and `DiagramContextAction` (DiagramWorkspace), `UmlContextTarget`, `UmlContextActions` and `DiagramContextAction` (UmlDiagram).
- **UmlDiagram**: `onDuplicate(selection)` and `onMemberDelete(element, index)`, the context menu's Duplicate on an element and Delete on a member.
- **UmlDiagram** now installs `@coreloom/context-menu`.
