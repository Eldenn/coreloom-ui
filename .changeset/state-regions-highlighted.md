---
'@coreloom/ui': minor
---

### Added

- **UmlDiagram**, **DiagramEditor**, **DiagramWorkspace**: `highlighted`, a list of element ids to point out on the drawing without selecting them (the active states of a simulation, the element a side panel is about). Each gets an outline outside the selection and annotation rings and says so in its accessible name. Sequence diagrams and exported images leave it out.
- **UmlDiagram**: concurrent regions of a composite state. A state carries `region` (0 by default); each region is laid out on its own, with its own start, and a dashed line parts two regions. `regionLines` in `@/lib/uml-layout` gives those lines from the laid-out boxes.
- **DiagramEditor**: a **Region** field in the properties of a state inside a composite state (its regions, and **New region**); a state added beside a selected one joins its region. `stateRegionChoices` in `@/lib/uml-edit-fields` lists the choices.

### Changed

- **Mermaid and PlantUML state diagrams**: the `--` line between two concurrent regions of a composite state (also `||` in PlantUML) is read and written instead of being set aside with a warning. A diagram without regions writes the same text as before. `STATE_REGIONS_MAX` in `@/lib/uml` is the highest region a state can name.
