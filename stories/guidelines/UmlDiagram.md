# UML Diagram

Software diagrams drawn from one typed model: **class**, **state**, **entity–relationship** and **C4** (context, container, component) diagrams on a canvas laid out automatically, and **sequence** diagrams as an SVG. The model is plain JSON (`UmlSpec` in `@/lib/uml`); `parseMermaid` reads the matching Mermaid text into it and `toMermaid` writes it back, with no `mermaid` dependency and nothing rendered as HTML.

**The consumer provides** `diagram`: a `UmlSpec` from `parseMermaid(text).diagram`, from `parseUmlJson(text).diagram` (JSON from outside, checked field by field) or built in code. Optionally: `editable` (false; elements can be dragged, and "Arrange" lays them out again), `onLayoutChange(layout)` (the positions after a drag, to store in the diagram's `layout`), `height` (480; the sequence view scrolls past it), `controls` (true: zoom in, zoom out, fit, and arrange when editable) and `label` (the accessible name; default: the kind of diagram).

- Layout: layers along `direction` (TB by default; LR, BT, RL), parents and wholes first; namespaces, composite states and C4 boundaries are frames that grow around what they hold. Positions in `layout` win over the automatic ones.
- Notation: inheritance and realization end in a hollow triangle, composition in a filled diamond, aggregation in a hollow one, dependencies are dashed; ER relations use crow's feet; C4 relations are dashed arrows with their technology in brackets. External C4 elements are grey and say "External" in their label line, never by colour alone.
- Keyboard: Tab moves through elements and then relations; each says what it is ("Class: Order, 2 attributes, 2 methods"; "Duck inherits from Animal"). When editable, a selected element moves with the arrow keys.
- The sequence view is a focusable scrolling region; its steps are also an ordered list for screen readers (blocks as nested lists).
- `parseMermaid` reads `classDiagram`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`, `C4Context`, `C4Container` and `C4Component`. Lines it can't read come back as problems with their line number, and the rest still draws; styling lines (`style`, `classDef`…) are set aside with a warning.
- Not for flowcharts or free-form drawings: use the Node Editor for graphs people build by hand.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/uml-diagram`.
