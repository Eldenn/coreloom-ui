# @coreloom/diagram-viewer

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/diagram-viewer.tsx

```ts
function DiagramViewer
DiagramViewer.title: string
DiagramViewer.description?: string | undefined
DiagramViewer.updatedAt?: Date | undefined
DiagramViewer.diagrams: readonly DiagramViewerItem[]
DiagramViewer.activeId?: string | undefined
DiagramViewer.defaultActiveId?: string | undefined
DiagramViewer.onActiveChange?: ((id: string) => void) | undefined
DiagramViewer.banner?: React.ReactNode
DiagramViewer.fileName?: string | undefined
DiagramViewer.className?: string | undefined
type DiagramViewerItem = {}
DiagramViewerItem.id: string
DiagramViewerItem.title: string
DiagramViewerItem.diagram: UmlSpec
DiagramViewerItem.layout?: UmlLayout | undefined
type DiagramViewerProps = {}
DiagramViewerProps.title: string
DiagramViewerProps.description?: string | undefined
DiagramViewerProps.updatedAt?: Date | undefined
DiagramViewerProps.diagrams: readonly DiagramViewerItem[]
DiagramViewerProps.activeId?: string | undefined
DiagramViewerProps.defaultActiveId?: string | undefined
DiagramViewerProps.onActiveChange?: ((id: string) => void) | undefined
DiagramViewerProps.banner?: React.ReactNode
DiagramViewerProps.fileName?: string | undefined
DiagramViewerProps.className?: string | undefined
function fileSlug(text: string) => string
const MANY_VIEWS: 6
function stepView(ids: readonly string[], id: string, step: number) => string | null
```
