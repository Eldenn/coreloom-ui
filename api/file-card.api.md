# @coreloom/file-card

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/file-card.tsx

```ts
function FileCard
FileCard.name: string
FileCard.size?: number | undefined
FileCard.type?: string | undefined
FileCard.preview?: string | undefined
FileCard.href?: string | undefined
FileCard.progress?: number | undefined
FileCard.error?: React.ReactNode
FileCard.onRemove?: (() => void) | undefined
FileCard.onRetry?: (() => void) | undefined
FileCard.action?: React.ReactNode
FileCard.*: react
function FileCardList
FileCardList.layout?: 'grid' | 'list' | undefined
FileCardList.*: react
type FileKind = 'image' | 'audio' | 'code' | 'video' | 'document' | 'presentation' | 'pdf' | 'archive' | 'spreadsheet' | 'other'
function fileKind(name: string, type?: string) => FileKind
```
