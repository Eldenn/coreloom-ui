---
'@coreloom/ui': minor
---

### Added

- **UmlDiagram** (`@coreloom/uml-diagram`): `preview` draws a still thumbnail for galleries. The drawing fits its box and fits again when the box is resized. It has no controls and nothing inside can be focused, dragged or zoomed. Screen readers get one image named by `label`.
- **UmlDiagram**: a full screen button in the controls, and in the top-right corner of sequence diagrams. It uses the Fullscreen API on the diagram's box. Escape leaves full screen and focus goes back to the button. Browsers without the Fullscreen API don't show the button.
- **Diagram editor** (`@coreloom/diagram-editor`): `view` / `defaultView` / `onViewChange` show the text beside the drawing (`split`, the default), the drawing alone, or the text alone. A switch at the end of the format bar changes the view.
- **Diagram editor**: `actions` puts the app's own buttons (Share, say) at the end of the top bar.
- **Diagram editor**: `readOnly` keeps the text as it is. The text field is read-only; the format switch, New diagram, the drawing tools and the properties are off; nothing can be dragged. Copy, Download, zoom and full screen still work, and the status line starts with "Read only".
