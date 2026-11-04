# Diagram Editor

Software diagrams as text: Mermaid (class, sequence, state, ER, C4) or UML JSON beside the drawing. The drawing has its own toolbar (Add or drag in elements, Connect, Delete, Copy, Paste, Duplicate, Layout direction, Undo, Redo) and a Properties panel for what's selected (class members one row each; for sequence diagrams, the participants and steps as a list and a form per message, note, activation or block); each change is made on the model and the text is written again. Problems are marked on their line and the rest still draws (the tools wait until they're fixed); dragged positions travel in the JSON; switch formats, start from a template, copy, or download as text, SVG or PNG.

**`DiagramEditor` takes** the text (`value` / `onChange` or `defaultValue`), the format (`format` / `onFormatChange` or `defaultFormat`, `mermaid` or `json`), and optionally `onDiagramChange`, `templates`, `height` (560px), `fileName` and `autoFocus`.

- The status line is the one polite status message ("Class diagram, 7 elements", "3 problems", "1 item deleted · Class diagram, 6 elements").
- Dragging the dot under an element onto another connects them; F2 or a double click renames; the Delete key removes the selection; Ctrl/⌘ with Z, Y, C, X, V and D undo, redo, copy, cut, paste and duplicate on the drawing.
- The panes stack on narrow screens.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-editor`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
