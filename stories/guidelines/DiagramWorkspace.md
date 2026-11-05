# Diagram Workspace

Where a document of several diagrams is written: its name, whether it's saved, the list of its views, and the diagram editor for the view that's open. The app keeps the document and saves it; every change comes back through a callback.

**The consumer provides** `title` and `onTitleChange` (the name, edited in place with EditableText), `diagrams` (`{ id, title, value, format }[]`: each view's text in `mermaid`, `plantuml` or `json`), `activeId` and `onActiveChange`, `onDiagramChange(id, value, result, format)` (the open view's new text, what could be read from it, and its format), `onAdd(kind)` (a diagram kind from "Add a diagram"; add the view and usually open it), `onRename(id, title)`, `onReorder(ids)`, `onDelete(id)`, `saveState` (`saved`, `saving`, `unsaved` or `error`), and optionally `savedAt`, `onRetrySave` (shown with SaveStatus), `actions` (the app's buttons, such as Share, at the end of the top bar), `height` (the whole workspace's height on wide screens, the editor taking what's left under the top bar; default: none, the editor's panes are 560px) and `className`.

- The list of views is a navigation landmark. The open view is marked as current. Each view has Rename (a field in place: Enter or leaving saves, Escape cancels) and Delete.
- Delete asks first, in a Popconfirm. The last view can't be deleted: its button is off and says why. After a delete, focus goes to the open view in the list.
- Reorder switches the list to a SortableList: drag by the handle or use the up and down buttons, then Done.
- The editor is DiagramEditor, controlled: the text, the format switch, the drawing tools, Copy and Download all work, and each change calls `onDiagramChange`. Switching views opens that view's text with its own undo history.
- To give the editor the whole window, put the workspace in `<AppShell fullWidth>` and set `height="calc(100svh - 7.5rem)"` (the window minus AppShell's header and gutters). A long list of views scrolls on its own. Below 1024px `height` is ignored: the panes stack at their own heights and the page scrolls.
- On a phone the list moves into a side sheet opened by "Views (3)"; picking a view closes it.
- The save state is announced politely when it settles, not each time it passes through Saving…

**In an app:** `pnpm dlx shadcn@latest add @coreloom/diagram-workspace`.
