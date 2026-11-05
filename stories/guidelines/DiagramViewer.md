# Diagram Viewer

A document of several diagrams to read, not edit: what a shared link opens. Its title, description and date on top, the views in tabs, the diagram with zoom and full screen, and SVG or PNG downloads. There are no editing tools.

**The consumer provides** `title`, `diagrams` (`{ id, title, diagram, layout? }[]`: a `UmlSpec` per view, and the positions people placed for drawn diagrams), and optionally `description`, `updatedAt` (a Date: "Updated 2 hours ago"), `activeId` / `defaultActiveId` / `onActiveChange` (the view shown; the first one by default), `banner` (above the title: who shared it, a read-only notice), `fileName` (downloads are named `<fileName>-<view>.svg`; the view's name alone by default) and `className`.

- Up to six views, they are tabs above the diagram; past six, a list at the side on wide screens. On a phone (or narrower than the side list needs) a menu picks the view.
- Left and right arrows, or Page Up and Page Down, go to the previous or next view from anywhere in the viewer, except in the tab list (where the arrows move between tabs) and in menus. A polite status says "View 2 of 4: Checkout"; the shortcut is described to screen readers.
- The diagram keeps its zoom, fit and full screen buttons. Nothing can be dragged or changed.
- Download makes an SVG or a PNG of the view as it shows now. If it can't be made, the viewer says so.
- The title is the page's `h1`: the viewer is a page of its own.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-viewer`.
