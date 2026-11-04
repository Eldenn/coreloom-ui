---
'@coreloom/ui': minor
---

### Added

- **Diagram editor tools.** The drawing in `@coreloom/diagram-editor` has its own toolbar: **Add** (the elements this kind of diagram holds: classes, interfaces, notes, states, entities, participants, C4 people, systems, containers, databases, boundaries…), **Connect** (a form for the kind, both ends and a label, filled from the selection), **Delete**, **Undo** and **Redo**. A **Properties** panel changes what's selected: name, stereotype, members, attributes, description, technology; a relation's kind, label, multiplicities or ER ends, and its direction. Each change is made on the model and the Mermaid or JSON text is written again. The tools are off while the text has problems.
- **UML editing functions** in `@coreloom/uml`: `addElement`, `addRelation`, `deleteItems`, `renameElement`, `setElementFields`, `setRelationFields`, `reverseRelation` (and `elementTypes`, `relationTypes` to list what a diagram can hold). Plain functions that return a new diagram, for your own forms or an assistant's tool calls.
- **UmlDiagram**: `selection` / `onSelectionChange`, `onConnect` (with `editable`, drag the dot under an element onto another) and `onDelete` (the Delete key). Selected elements show a ring.
- **ToolbarMenu** in `@coreloom/toolbar`: a menu named by its text ("Add ▾"), one of the toolbar's arrow-key stops.

### Changed

- The diagram editor's top bar is a Toolbar (one Tab stop, arrow keys between the format, New diagram, Copy and Download); on phones Copy and Download show their icon only.

### Fixed

- **Toolbar**: a tool with an icon and text no longer shrinks to an icon's width and overlaps the next one.
