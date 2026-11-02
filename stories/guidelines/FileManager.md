# File manager

Folders and files to browse and organise: a drive, a media library, a project's attachments, a knowledge base's sources. A grid or a list, a breadcrumb back up, several items selected at once, drag and drop to move, files dropped from the computer to upload, and a details panel.

**Install** `pnpm dlx shadcn@latest add @coreloom/file-manager`.

**The consumer provides** `<FileManager items>`: every item flat, `{ id, name, kind: 'folder' | 'file', parentId, size?, modifiedAt?, mimeType?, thumbnailUrl?, owner? }` (`parentId: null` at the root). Optional: `onMove(ids, folderId)` turns on drag and drop and **Move to**; `onDelete(ids)`, `onUpload(files, folderId)` (the Upload button and drops from the computer) and `onOpen(item)` for files. The folder (`folderId` / `defaultFolderId` / `onFolderChange`), the view (`view` / `defaultView`, grid by default) and the selection (`selectedIds` / `defaultSelectedIds` / `onSelectionChange`) can each be controlled. `actions` adds buttons to the toolbar ("New folder"), `rootLabel` names the root (default "All files"), `preview={false}` hides the details panel, `renderPreview(item)` replaces its picture (a PDF viewer, a video player).

- The items are one listbox with several selection: click selects one, Ctrl/⌘-click adds, Shift-click selects a range; the keyboard moves with the arrows (rows of the grid with Up and Down), Space selects, Shift+arrows extends, Ctrl/⌘+A selects all, Escape clears, Enter opens, Backspace or Alt+Up goes to the parent folder, Delete deletes.
- Drag selected items onto a folder or a crumb of the breadcrumb to move them. A folder can't go into itself or one of its subfolders. Everyone else uses **Move to** in the selection bar.
- Selecting, opening a folder and moving are announced politely, in the reader's language.
- Folders come first; names sort the way people count ("2" before "10"); sizes and dates follow the locale.
- Don't use it for a single upload field: that's FileUpload. For a read-only hierarchy without files, TreeView.
