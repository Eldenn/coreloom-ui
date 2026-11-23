---
'@coreloom/ui': minor
---

### Added

- **DiagramViewer**, **DiagramEditor**: the Download menu has a PDF entry. It opens the browser's print dialog on the drawing alone, in the light theme, on a page of the drawing's size; the reader saves it as a PDF there.
- **UmlDiagram**: `toImage(format, { light: true })` draws the image in the light theme whatever the page's, and `printImage(url, title)` (`@/lib/uml-image`) hands an image to the print dialog.

### Fixed

- **UmlDiagram**: an SVG image has its background behind the whole picture. It was painted on the moved copy of the canvas, which left a strip without background along the top and the left.
