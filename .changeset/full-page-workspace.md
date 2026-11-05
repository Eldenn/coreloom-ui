---
'@coreloom/ui': minor
---

### Added

- **AppShell** (`@coreloom/app-shell`): `fullWidth` (default `false`) lets the page use the whole width next to the sidebar instead of stopping at `--container-app`, for editors, canvases and wide tables. The gutters stay.
- **Diagram workspace** (`@coreloom/diagram-workspace`): `height` sets the whole workspace's height on wide screens; the editor takes what's left under the top bar and a long list of views scrolls on its own. In `<AppShell fullWidth>`, `height="calc(100svh - 7.5rem)"` makes the editor fill the window. Without it nothing changes (560px panes).
- **Diagram editor** (`@coreloom/diagram-editor`): `height="fill"` makes the panes share the height the editor is given (stretched in a grid or a flex column, or set with a class) instead of a fixed one. They keep 560px where they stack.
