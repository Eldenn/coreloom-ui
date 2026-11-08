# @coreloom/diagram-workspace

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/diagram-workspace.tsx

```ts
function DiagramWorkspace
DiagramWorkspace.title: string
DiagramWorkspace.onTitleChange: (title: string) => void
DiagramWorkspace.diagrams: readonly DiagramWorkspaceItem[]
DiagramWorkspace.activeId: string
DiagramWorkspace.onActiveChange: (id: string) => void
DiagramWorkspace.onDiagramChange: (id: string, value: string, result: UmlParseResult, format: DiagramFormat) => void
DiagramWorkspace.onAdd: (kind: UmlDiagramKind) => void
DiagramWorkspace.onImport?: ((view: DiagramWorkspaceImport) => void) | undefined
DiagramWorkspace.onRename: (id: string, title: string) => void
DiagramWorkspace.onReorder: (ids: string[]) => void
DiagramWorkspace.onDelete: (id: string) => void
DiagramWorkspace.saveState: SaveState
DiagramWorkspace.savedAt?: Date | undefined
DiagramWorkspace.onRetrySave?: (() => void) | undefined
DiagramWorkspace.actions?: React.ReactNode
DiagramWorkspace.height?: string | undefined
DiagramWorkspace.className?: string | undefined
type DiagramWorkspaceImport = {}
DiagramWorkspaceImport.title: string
DiagramWorkspaceImport.value: string
DiagramWorkspaceImport.result: UmlParseResult
DiagramWorkspaceImport.format: DiagramFormat
type DiagramWorkspaceItem = {}
DiagramWorkspaceItem.id: string
DiagramWorkspaceItem.title: string
DiagramWorkspaceItem.value: string
DiagramWorkspaceItem.format: DiagramFormat
type DiagramWorkspaceProps = {}
DiagramWorkspaceProps.title: string
DiagramWorkspaceProps.onTitleChange: (title: string) => void
DiagramWorkspaceProps.diagrams: readonly DiagramWorkspaceItem[]
DiagramWorkspaceProps.activeId: string
DiagramWorkspaceProps.onActiveChange: (id: string) => void
DiagramWorkspaceProps.onDiagramChange: (id: string, value: string, result: UmlParseResult, format: DiagramFormat) => void
DiagramWorkspaceProps.onAdd: (kind: UmlDiagramKind) => void
DiagramWorkspaceProps.onImport?: ((view: DiagramWorkspaceImport) => void) | undefined
DiagramWorkspaceProps.onRename: (id: string, title: string) => void
DiagramWorkspaceProps.onReorder: (ids: string[]) => void
DiagramWorkspaceProps.onDelete: (id: string) => void
DiagramWorkspaceProps.saveState: SaveState
DiagramWorkspaceProps.savedAt?: Date | undefined
DiagramWorkspaceProps.onRetrySave?: (() => void) | undefined
DiagramWorkspaceProps.actions?: React.ReactNode
DiagramWorkspaceProps.height?: string | undefined
DiagramWorkspaceProps.className?: string | undefined
```
