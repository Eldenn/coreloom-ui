---
'@coreloom/ui': patch
---

### Fixed

- `CodeEditor` and `RichTextEditor`, controlled: fast typing could lose or reorder characters
  when the app handed `value` back a keystroke late (seen in Firefox). The editors now recognise
  their own text coming back and leave what was typed since.
- `UmlDiagram`: deleting the focused element or line from the keyboard could leave focus on the
  page instead of the canvas, when the app handed the new diagram back after the next frame
  (seen in Safari). Focus now moves to the canvas before the element goes.
