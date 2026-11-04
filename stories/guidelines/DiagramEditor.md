# Diagram Editor

Software diagrams as text: Mermaid or Coreloom's UML JSON on the left, the drawing on the right. Problems are underlined on their line and listed under the text, and what can be read still draws. Elements can be dragged; their positions travel in the JSON. Everything happens in the browser: the app keeps the text.

**The consumer provides** the text (`value` / `onChange` or `defaultValue`; default: a small class diagram) and optionally the format (`format` / `onFormatChange` or `defaultFormat`, `mermaid` or `json`; default `mermaid`), `onDiagramChange(result)` (each reading: the diagram, or null, and its problems), `templates` (the "New diagram" menu, as Mermaid; default: one per diagram type), `height` (560px, both panes on wide screens), `fileName` (`diagram`, for Download), `autoFocus` (false) and `className`.

- Switching format converts what could be read (Mermaid ↔ JSON); text that couldn't be read stays as it is. Mermaid has no positions, so they're kept in JSON only.
- Copy and Download give the current diagram in the current format (`.mmd` or `.json`), with dragged positions in JSON.
- The status line ("Class diagram, 7 elements", "3 problems") is the one polite status message; problems are also marks in the code with their message.
- On narrow screens the text and the drawing stack.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-editor`.
