---
'@coreloom/ui': minor
---

### Added

- **Sequence diagram editing** in `@coreloom/diagram-editor`: the side panel lists participants and steps (the keyboard path to what a click on the drawing selects), and the selected step's form changes a message (ends, text, arrow, activations), a note (text, place, participants), an activation, or a block (loop, alt, opt, par, critical, break: kind, condition, sections). Add holds notes and blocks (a block wraps the selected step), Connect adds a message after the selected step, Move up / Move down reorder steps, and a participant can be an actor. The functions are in `@coreloom/uml` (`uml-edit-sequence`): `insertMessage`, `insertNote`, `insertBlock`, `setStep`, `moveStep`, `addSection`, `removeSection`, `stepId`.
- **Editing on the drawing.** UmlDiagram: `onRename` (F2 or a double click opens a name field over the element), `onElementDrop` (an element type dragged onto the canvas, with `UML_DRAG_TYPE`), "Select an area" for box selection, and an align bar (left, centre, right, top, middle, bottom, space evenly) for two or more selected elements. In the diagram editor, the quick Add buttons can be dragged onto the drawing.
- **Copy, Paste, Duplicate** (Ctrl/⌘ with C, X, V, D) in the diagram editor: elements come with what they hold and the lines between them, under fresh names. `copyItems`, `pasteItems`, `duplicateItems` in `@coreloom/uml`.
- **Layout** menu in the diagram editor: arrange automatically, and turn the flow (top to bottom, left to right, bottom to top, right to left). Dragged positions can now be undone. `alignBoxes`, `setDirection`, `clearLayout` in `@coreloom/uml`.
- **SVG and PNG images.** UmlDiagram takes a `ref` whose `toImage('svg' | 'png')` gives the whole drawing as a data URL; the diagram editor's Download menu offers text, SVG and PNG. `@coreloom/uml-diagram` now depends on `html-to-image`.
- **Class members line by line** in the properties panel: one field per member, typed as in Mermaid, with a menu for visibility, static, abstract, moving and removing; Add attribute and Add method. `memberFromText` in `@coreloom/uml`.

### Changed

- `UmlElementFields.members` (in `uml-edit-fields`) is a `ClassMember[]` instead of a text with one member per line.

### Upgrading

- If you call `setElementFields` with `members`, pass the members as `ClassMember` objects (`parseMember(line)` from `@/lib/uml-mermaid-class` reads one line as Mermaid writes it).
