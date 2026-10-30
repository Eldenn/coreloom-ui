# Resizable

Panel groups the user can resize, built on react-resizable-panels 4.

**The consumer provides** `<ResizablePanelGroup orientation>` (`horizontal` default, `vertical`) holding `<ResizablePanel defaultSize minSize maxSize collapsible>`s separated by `<ResizableHandle withHandle />`. Sizes are strings in percent (`"30%"`) or numbers in pixels. Groups nest for split layouts. A group fills its parent (`height: 100%`, set inline by the library), so give the parent a height — a class on the group itself is overridden.

- The handle is a 1px `border` line that turns `accent` on hover, drag and focus; `withHandle` adds a small grip on `surface-1`.
- Handles are focusable separators: arrow keys resize, Home / End jump to the limits.
- For editors and tools where people tune the layout (file tree, editor, terminal). Give each panel a sensible `minSize`. Persist the layout with `onLayoutChanged` if it should survive a reload.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/resizable` and import from `@/components/ui/resizable`.
