# @coreloom/diagram-workspace

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/diagram-workspace.tsx

```ts
type DiagramContextAction = {}
DiagramContextAction.label: string
DiagramContextAction.icon?: React.ReactNode
DiagramContextAction.destructive?: boolean | undefined
DiagramContextAction.disabled?: boolean | undefined
DiagramContextAction.onSelect: () => void
type DiagramContextTarget = { type: 'view'; viewId: string; label: string; } | (UmlContextTarget & { viewId: string; })
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
DiagramWorkspace.onAnnotationSelect?: ((element: string, viewId: string) => void) | undefined
DiagramWorkspace.height?: string | undefined
DiagramWorkspace.highlighted?: readonly string[] | undefined
DiagramWorkspace.contextActions?: WorkspaceContextActions | undefined
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
DiagramWorkspaceItem.annotations?: readonly UmlAnnotation[] | undefined
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
DiagramWorkspaceProps.onAnnotationSelect?: ((element: string, viewId: string) => void) | undefined
DiagramWorkspaceProps.height?: string | undefined
DiagramWorkspaceProps.highlighted?: readonly string[] | undefined
DiagramWorkspaceProps.contextActions?: WorkspaceContextActions | undefined
DiagramWorkspaceProps.className?: string | undefined
```

## src/components/diagram-workspace-menu.tsx

```ts
type DiagramContextTarget = { type: 'view'; viewId: string; label: string; } | (UmlContextTarget & { viewId: string; })
function forView(contextActions: WorkspaceContextActions | undefined, viewId: string) => { contextActions?: undefined; } | { contextActions: (target: UmlContextTarget) => readonly DiagramContextAction[]; }
function viewMenu(input: { diagrams: readonly { id: string; title: string; }[]; contextActions: WorkspaceContextActions | undefined; tools: Messages['diagramTools']; onRename: (id: string) => void; onDelete: (id: string) => void; }) => { enabled: boolean; resolve: (element: Element) => ViewTarget | null; lists: (target: ViewTarget) => { own: ({ label: string; icon: import("react").JSX.Element; onSelect: () => void; destructive?: undefined; disabled?: undefined; } | { label: string; icon: import("react").JSX.Element; destructive: boolean; disabled: boolean; onSelect: () => void; })[]; app: readonly DiagramContextAction[]; }; }
type WorkspaceContextActions = (target: DiagramContextTarget) => readonly DiagramContextAction[]
```
