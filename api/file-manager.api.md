# @coreloom/file-manager

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/file-manager.tsx

```ts
function canMoveTo(items: readonly FileManagerItem[], ids: readonly string[], targetId: string | null) => boolean
function FileManager
FileManager.items: FileManagerItem[]
FileManager.folderId?: string | null | undefined
FileManager.defaultFolderId?: string | null | undefined
FileManager.onFolderChange?: ((folderId: string | null) => void) | undefined
FileManager.view?: FileManagerView | undefined
FileManager.defaultView?: FileManagerView | undefined
FileManager.onViewChange?: ((view: FileManagerView) => void) | undefined
FileManager.selectedIds?: string[] | undefined
FileManager.defaultSelectedIds?: string[] | undefined
FileManager.onSelectionChange?: ((ids: string[]) => void) | undefined
FileManager.onOpen?: ((item: FileManagerItem) => void) | undefined
FileManager.onMove?: ((ids: string[], folderId: string | null) => void) | undefined
FileManager.onDelete?: ((ids: string[]) => void) | undefined
FileManager.onUpload?: ((files: File[], folderId: string | null) => void) | undefined
FileManager.rootLabel?: string | undefined
FileManager.actions?: React.ReactNode
FileManager.preview?: boolean | undefined
FileManager.renderPreview?: ((item: FileManagerItem) => React.ReactNode) | undefined
FileManager.className?: string | undefined
type FileManagerItem = {}
FileManagerItem.id: string
FileManagerItem.name: string
FileManagerItem.kind: 'file' | 'folder'
FileManagerItem.parentId: string | null
FileManagerItem.size?: number | undefined
FileManagerItem.modifiedAt?: string | Date | undefined
FileManagerItem.mimeType?: string | undefined
FileManagerItem.thumbnailUrl?: string | undefined
FileManagerItem.owner?: string | undefined
function fileManagerPath(items: readonly FileManagerItem[], folderId: string | null) => FileManagerItem[]
type FileManagerView = 'grid' | 'list'
type FileSortKey = 'modified' | 'name' | 'size'
type FileType = 'text' | 'image' | 'file' | 'audio' | 'code' | 'video' | 'folder' | 'pdf' | 'archive' | 'spreadsheet'
function fileTypeOf(item: Pick<FileManagerItem, 'kind' | 'name' | 'mimeType'>) => FileType
function selectRange(order: readonly string[], anchor: string | undefined, to: string) => string[]
function sortFileItems(items: readonly FileManagerItem[], key: FileSortKey, direction: 'asc' | 'desc', locale?: string) => FileManagerItem[]
```
