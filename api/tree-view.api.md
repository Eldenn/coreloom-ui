# @coreloom/tree-view

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/tree-view.tsx

```ts
function branchIds(nodes: TreeViewNode[]) => string[]
function TreeView
TreeView.nodes: TreeViewNode[]
TreeView.expanded?: string[] | undefined
TreeView.defaultExpanded?: string[] | undefined
TreeView.onExpandedChange?: ((expanded: string[]) => void) | undefined
TreeView.onAction?: ((node: TreeViewNode) => void) | undefined
TreeView.className?: string | undefined
TreeView.aria-label?: string | undefined
TreeView.aria-labelledby?: string | undefined
TreeView.selectionMode?: 'multiple' | 'single' | 'none' | undefined
type TreeViewNode = {}
TreeViewNode.id: string
TreeViewNode.label: string
TreeViewNode.icon?: React.ReactNode | ((open: boolean) => React.ReactNode)
TreeViewNode.meta?: React.ReactNode
TreeViewNode.children?: TreeViewNode[] | undefined
TreeViewNode.disabled?: boolean | undefined
```
