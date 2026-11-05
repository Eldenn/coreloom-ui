---
'@coreloom/ui': patch
---

### Fixed

- **UML diagram** (`@coreloom/uml-diagram`, and the diagram editor, viewer and workspace that use it): leaving full screen (Escape or the button) puts back the view from before. The diagram used to keep the screen-sized pan and zoom and end up off to the side, out of sight.
- **Diagram editor** and **Diagram workspace** (`@coreloom/uml`): elements dragged in a Mermaid or PlantUML diagram keep their place. Their positions used to live only in the open editor, so opening another view, reloading or saving lost them; they now travel in the text, in one comment line the renderers skip (`%% coreloom-layout {…}` in Mermaid, `' coreloom-layout {…}` before `@enduml` in PlantUML). `toMermaid` / `toPlantUml` write it and `parseMermaid` / `parsePlantUml` read it back, keeping only positions of elements the text has.
- **UML diagram**: the Fit to view button (and the refit in full screen) works every time. It went through React Flow's `fitView`, which waits for the next change of the nodes; with the nodes kept by the app, after a drag that change could never come and Fit did nothing, leaving an element dragged out of view out of reach. It now fits the drawn elements at once (`useFitDiagram`).
