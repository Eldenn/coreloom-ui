# UML Diagram

Software diagrams from one typed model: class, state, entity–relationship and C4 diagrams on a canvas laid out automatically (UML markers, crow's feet, frames, multiplicities), and sequence diagrams as an SVG. `parseMermaid` reads Mermaid text into the model and `toMermaid` writes it back; `parseUmlJson` checks JSON from outside.

**`UmlDiagram` takes** `diagram` (a `UmlSpec`), plus optionally `editable` (drag elements; "Arrange" lays them out again), `onLayoutChange` (positions to keep in `layout`), `height` (480), `controls` (zoom, fit, arrange) and `label`.

- Tab moves through elements, then relations; each says what it is ("Duck inherits from Animal").
- External C4 elements are grey and say "External"; never colour alone.
- Sequence diagrams scroll inside a focusable region and give their steps as a list to screen readers.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/uml-diagram`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
