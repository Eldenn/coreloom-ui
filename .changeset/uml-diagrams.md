---
'@coreloom/ui': minor
---

### Added

- **UML diagrams.** `@coreloom/uml` is the typed model of class, sequence, state, entity–relationship and C4 diagrams, with `parseUmlJson` (checks JSON from outside), and `parseMermaid` / `toMermaid` for the matching Mermaid subset (`classDiagram`, `sequenceDiagram`, `stateDiagram-v2`, `erDiagram`, `C4Context`, `C4Container`, `C4Component`), tolerant: what can't be read comes back as a problem on its line. No `mermaid` dependency; nothing is rendered as HTML.
- **UmlDiagram** (`@coreloom/uml-diagram`): draws class, state, ER and C4 diagrams on React Flow, laid out automatically in layers with UML markers, crow's feet, frames (namespaces, composite states, C4 boundaries) and multiplicities; zoom and fit; `editable` lets people drag elements and `onLayoutChange` gives their positions. Sequence diagrams render as an SVG (activations, notes, loop/alt/opt/par blocks, autonumber) with the steps as a list for screen readers. Also in `@coreloom/all`.
- **Diagram editor** block (`@coreloom/diagram-editor`): Mermaid or UML JSON beside the drawing, problems marked on their line, format switch, templates, copy and download.
