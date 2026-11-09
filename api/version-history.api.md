# @coreloom/version-history

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/version-history.tsx

```ts
function comparedVersion(versions: readonly DocumentVersion[], selected: DocumentVersion, target: CompareTarget) => DocumentVersion | undefined
type CompareTarget = 'none' | 'current' | 'previous'
type DocumentVersion = {}
DocumentVersion.id: string
DocumentVersion.createdAt: Date
DocumentVersion.name?: string | undefined
DocumentVersion.author?: string | undefined
DocumentVersion.summary?: string | undefined
DocumentVersion.content?: string | undefined
function groupVersionsByDay(versions: readonly DocumentVersion[]) => { day: Date; versions: DocumentVersion[]; }[]
function VersionHistory
VersionHistory.versions: DocumentVersion[]
VersionHistory.currentId?: string | undefined
VersionHistory.defaultSelectedId?: string | undefined
VersionHistory.defaultCompare?: 'none' | 'current' | 'previous' | undefined
VersionHistory.onRestore?: ((id: string) => unknown) | undefined
VersionHistory.onRename?: ((id: string, name: string) => unknown) | undefined
VersionHistory.renderPreview?: ((version: DocumentVersion) => React.ReactNode) | undefined
VersionHistory.className?: string | undefined
```
