# UML Diagram

Software diagrams from one typed model: class, state, entity–relationship, C4, use case, activity and deployment diagrams on a canvas laid out automatically (UML markers, crow's feet, frames, multiplicities), and sequence diagrams as an SVG. `parseMermaid` and `parsePlantUml` read Mermaid or PlantUML text into the model and `toMermaid` / `toPlantUml` write it back; `parseUmlJson` checks JSON from outside.

**`UmlDiagram` takes** `diagram` (a `UmlSpec`), plus optionally `editable` (drag elements; "Arrange" lays them out again), `onLayoutChange` (positions to keep in `layout`), `height` (480), `controls` (zoom, fit, full screen, arrange, select an area), `preview` (a still thumbnail fitted to its box, one image named by `label`) and `label`; for apps that edit, `selection` / `onSelectionChange`, `onConnect`, `onDelete`, `onRename`, `onElementDrop`, and a `ref` whose `toImage('svg' | 'png')` gives the drawing as an image.

- Full screen from the controls; Escape leaves and focus goes back to the button.
- With several elements selected, a bar lines them up or spaces them evenly.
- Tab moves through elements, then relations; each says what it is ("Duck inherits from Animal").
- External C4 elements are grey and say "External"; never colour alone.
- Sequence diagrams scroll inside a focusable region and give their steps as a list to screen readers.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/uml-diagram`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
