---
'@coreloom/ui': minor
---

### Added

- `UmlDiagram`: `annotations` put a status (`ok`, `warning`, `error`, `unknown`) on elements, such
  as the findings of a review against the code: a ring in the status colour and a badge with an
  icon and a count on the element's corner, and the finding at the end of its accessible name. In
  a sequence diagram they go on participants and messages (`step:…` ids). With
  `onAnnotationSelect`, each badge is a button that hands the element's id back. Thumbnails keep
  them as marks; images made with `toImage` leave them out. `SequenceDiagramView` takes the same
  two props.
- `DiagramEditor` passes `annotations` and `onAnnotationSelect` to its drawing, and
  `DiagramViewer` takes `annotations` per view and `onAnnotationSelect(element, viewId)`.
- `FindingCard` (`@coreloom/finding-card`, experimental): one finding of a review, with its status
  and severity, a comment, `file:line` evidence that links out (http and https only), Show in
  diagram, and Mark as done / Ignore / Reopen with the resolution announced.

### Upgrading

- `uml-diagram` now also installs `uml-diagram-annotations.tsx` and needs `@coreloom/badge`:
  run `pnpm dlx shadcn@latest add @coreloom/uml-diagram --overwrite`.
