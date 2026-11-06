---
'@coreloom/ui': minor
---

### Added

- **DiagramWorkspace**: diagram files can be dropped on the workspace. With `onImport`, files dragged over it show a dashed hint ("Drop diagram files to add them as views"), and each dropped file is read like "Import a file…" and handed to `onImport`, one call per file, in order. A file dropped on the editor also becomes a new view: the editor no longer pastes its text. The files that can't be read are named in the status under the list of views. Without `onImport`, dropped files are left alone.
- **diagram-import**: `useFileDrop({ enabled, onFiles })`, the drop handling behind it, for an area that takes files.
- The hint's string in English, French, Spanish and German.

### Upgrading

- An app whose `onImport` adds a view with a plain state update (`setViews([...views, view])`) should build on the previous state (`setViews((all) => [...all, view])`): several dropped files call it in the same event.
