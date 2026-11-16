---
'@coreloom/ui': minor
---

### Added

- `DiagramWorkspace`: each view takes `annotations` (statuses on its elements, such as the
  findings of a review against the code), shown on the open view's drawing, and
  `onAnnotationSelect(element, viewId)` turns their badges into buttons, as in `DiagramViewer`.

### Upgrading

- `diagram-workspace` now needs `@coreloom/uml-diagram` (already installed with
  `diagram-editor`): run `pnpm dlx shadcn@latest add @coreloom/diagram-workspace --overwrite`.
