---
'@coreloom/ui': patch
---

### Fixed

- `UmlDiagram`: lines no longer blink or vanish while an element is dragged (or on any other
  re-render). Each box now hands React Flow its size, so React Flow keeps track of where its
  lines attach instead of dropping them until it measures the box again.
- PlantUML: a name in quotes no longer decides what kind of diagram the text is. A title, a
  class, a participant or a message holding brackets (`"Order (v2)"`, `alt refused (fraud)`)
  was read as a use case diagram and lost everything else.
- PlantUML: a `#` inside a quoted name or after a colon is kept (`node "Server #2"`,
  `Placed --> Paid : card #1`). Only colours on a declaration (`#pink`) are left out.
- PlantUML: an entity with no attributes (`entity Order`) reads, and so does an entity's name
  (`entity "Customer account" as Customer`). The editor's own entity–relationship template had a
  problem as soon as it was switched to PlantUML.
- Mermaid flowcharts: quoted text may hold brackets, braces and pipes (`A("Order (v2)")`,
  `B{"Paid {card}?"}`, `-->|"yes | partly"|`).
- Mermaid: `#quot;` turns back into `"` in class names, entity names and attribute comments, so a
  name with quotes shows as typed.
- `DiagramEditor`: a new note takes focus in its text box, as other new elements take it in their
  name field (focus went to the page). An activity diagram written in Mermaid no longer offers
  Note, which a Mermaid flowchart can't hold: it vanished as soon as it was added.
