---
'@coreloom/ui': minor
---

### Added

- **UmlDiagram**, **DiagramEditor**, **DiagramWorkspace**, **SequenceDiagramView**: the context menu on one of several selected elements, relations or steps is about all of them. The selection stays, Duplicate and Delete take the whole of it (Rename is left out), and `contextActions` gets `{ type: 'selection', selection, targets, label }`: `targets` lists each selected part as a single target would be (elements, then relations) and `label` counts them (`3 selected`). A right-click on something outside the selection still selects it alone. `UmlContextPart` is the type of one part.
