# @coreloom/diff-viewer

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/diff-viewer.tsx

```ts
type DiffLine = {}
DiffLine.type: 'equal' | 'add' | 'remove'
DiffLine.text: string
DiffLine.oldLine?: number | undefined
DiffLine.newLine?: number | undefined
function diffLines(before: string, after: string) => DiffLine[]
type DiffPair = {}
DiffPair.left?: DiffLine | undefined
DiffPair.right?: DiffLine | undefined
function DiffViewer
DiffViewer.before: string
DiffViewer.after: string
DiffViewer.view?: 'split' | 'unified' | undefined
DiffViewer.context?: number | undefined
DiffViewer.title?: React.ReactNode
DiffViewer.beforeLabel?: React.ReactNode
DiffViewer.afterLabel?: React.ReactNode
DiffViewer.emptyText?: React.ReactNode
DiffViewer.wrap?: boolean | undefined
DiffViewer.*: react
function pairLines(lines: readonly DiffLine[]) => DiffPair[]
```
