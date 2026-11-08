# @coreloom/tree-select

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/tree-select.tsx

```ts
function flattenTree(nodes: TreeNode[], level?: number, parent?: FlatNode) => FlatNode[]
type TreeNode = {}
TreeNode.value: string
TreeNode.label: string
TreeNode.children?: TreeNode[] | undefined
TreeNode.disabled?: boolean | undefined
function TreeSelect
TreeSelect.nodes: TreeNode[]
TreeSelect.placeholder?: string | undefined
TreeSelect.disabled?: boolean | undefined
TreeSelect.id?: string | undefined
TreeSelect.className?: string | undefined
TreeSelect.onBlur?: (() => void) | undefined
TreeSelect.aria-label?: string | undefined
TreeSelect.aria-describedby?: string | undefined
TreeSelect.aria-invalid?: boolean | 'true' | 'false' | undefined
TreeSelect.multiple?: boolean | undefined
TreeSelect.value?: string | string[] | undefined
TreeSelect.defaultValue?: string | string[] | undefined
TreeSelect.onValueChange?: ((value: string) => void) | ((value: string[]) => void) | undefined
```
