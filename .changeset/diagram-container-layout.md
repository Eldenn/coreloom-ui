---
'@coreloom/ui': patch
---

### Fixed

- **DiagramWorkspace**, **DiagramEditor**: the layout follows the width the component is given instead of the screen's (container queries). Beside a side panel, the list of views moves into its sheet (below 56rem), the text goes above the drawing (below 64rem) and the properties under the drawing (below 28rem), instead of squeezing the drawing to a sliver.
- **UmlDiagram**: the drawing is fitted again when its box changes size, until the reader pans or zooms, so it no longer ends up off to the side after the box shrinks.
