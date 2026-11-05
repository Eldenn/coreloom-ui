---
'@coreloom/ui': minor
---

### Added

- **Diagram viewer** block (`@coreloom/diagram-viewer`): a document of several diagrams to read, as a shared link opens it.
  - Title, description and "Updated …" on top, and an optional `banner` above them.
  - Up to six views are tabs; past six they are a list at the side; on a phone, a menu. `activeId` / `defaultActiveId` / `onActiveChange` set the view.
  - The diagram keeps zoom, fit and full screen. Download makes an SVG or a PNG, named from `fileName` and the view.
  - Left and right arrows, or Page Up and Page Down, change the view. No editing tools.
- **Diagram workspace** block (`@coreloom/diagram-workspace`): the editor of a document with several diagrams.
  - The document's name is edited in place (EditableText), and SaveStatus shows `saveState`, `savedAt` and Retry (`onRetrySave`).
  - The list of views adds a view of a chosen kind (`onAdd(kind)`), renames (`onRename`), reorders with SortableList (`onReorder`) and deletes after a Popconfirm (`onDelete`). The last view can't be deleted.
  - The open view is a controlled DiagramEditor; `onDiagramChange(id, value, result, format)` reports each change.
  - On a phone, the list is in a side sheet.
