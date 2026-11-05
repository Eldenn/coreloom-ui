---
'@coreloom/ui': patch
---

### Fixed

- **UML diagram** (`@coreloom/uml-diagram`, and the diagram editor, viewer and workspace that use it): leaving full screen (Escape or the button) puts back the view from before. The diagram used to keep the screen-sized pan and zoom and end up off to the side, out of sight.
