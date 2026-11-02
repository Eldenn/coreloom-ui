# File manager

Folders and files in a grid or a list, with a breadcrumb, multi-selection, drag and drop onto a folder or a crumb (or **Move to** from the keyboard), files dropped from the computer to upload, and a details panel.

**Install** `pnpm dlx shadcn@latest add @coreloom/file-manager`.

**The consumer provides** `<FileManager items>`: every item flat, `{ id, name, kind: 'folder' | 'file', parentId, size?, modifiedAt?, mimeType?, thumbnailUrl?, owner? }`. Optional: `onMove(ids, folderId)`, `onDelete(ids)`, `onUpload(files, folderId)`, `onOpen(item)`, `actions`, `renderPreview(item)`; folder, view and selection controlled or not.

- One listbox: click, Ctrl/⌘-click, Shift-click; arrows, Space, Shift+arrows, Ctrl/⌘+A, Enter opens, Backspace goes up, Delete deletes. Announced politely.
- A folder can't move into itself or its subfolders. Folders first; names sort naturally.

_On `window.CoreloomUIDesignSystem_ff5f32` as `FileManager`._
