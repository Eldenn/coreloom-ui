# Diagram Editor

Software diagrams as text: Mermaid (class, sequence, state, ER, C4) or UML JSON beside the drawing. Problems are marked on their line and the rest still draws; dragged positions travel in the JSON; switch formats, start from a template, copy or download.

**`DiagramEditor` takes** the text (`value` / `onChange` or `defaultValue`), the format (`format` / `onFormatChange` or `defaultFormat`, `mermaid` or `json`), and optionally `onDiagramChange`, `templates`, `height` (560px), `fileName` and `autoFocus`.

- The status line is the one polite status message ("Class diagram, 7 elements", "3 problems").
- The panes stack on narrow screens.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-editor`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
