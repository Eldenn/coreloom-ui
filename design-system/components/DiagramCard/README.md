# Diagram Card

A card in a gallery of diagram documents: a thumbnail (the diagram drawn with UmlDiagram's `preview`, or an image the app made), the title, who can see it, how many diagrams it holds and when it changed, and a "…" menu.

**`DiagramCard` takes** `title`, `href` (through `AppLink`, so the app's router), `visibility` (`private`, `public` or `protected`, shown as a badge with an icon and a word), `updatedAt`, and optionally `diagram` (a `UmlSpec`) or `image` (a thumbnail URL), `diagramCount`, `actions` (`{ label, icon?, onSelect, destructive?, disabled? }[]` for the menu: open, duplicate, share, delete) and `className`.

- The whole card opens the document; the "…" menu is its own button, named "Actions for <title>".
- Without a diagram or an image, a neutral drawing stands in.
- The thumbnail is decoration: the title names the card for screen readers.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-card`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
