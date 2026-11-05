# Diagram Viewer

A document of several UML diagrams to read: title, description and date, the views in tabs (a side list past six, a menu on a phone), the diagram with zoom and full screen, and SVG or PNG downloads. Arrows or Page Up / Page Down change the view. No editing tools.

**`DiagramViewer` takes** `title`, `diagrams` (`{ id, title, diagram, layout? }[]`), and optionally `description`, `updatedAt`, `activeId` / `defaultActiveId` / `onActiveChange`, `banner`, `fileName` and `className`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-viewer`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
