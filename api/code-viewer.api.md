# @coreloom/code-viewer

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/code-viewer.tsx

```ts
function CodeViewer
CodeViewer.code: string
CodeViewer.language?: string | undefined
CodeViewer.title?: React.ReactNode
CodeViewer.lineNumbers?: boolean | undefined
CodeViewer.startLine?: number | undefined
CodeViewer.highlight?: string | readonly number[] | undefined
CodeViewer.wrap?: boolean | undefined
CodeViewer.defaultWrap?: boolean | undefined
CodeViewer.onWrapChange?: ((wrap: boolean) => void) | undefined
CodeViewer.copyable?: boolean | undefined
CodeViewer.renderLine?: ((line: string, number: number) => React.ReactNode) | undefined
CodeViewer.maxHeight?: string | undefined
CodeViewer.className?: string | undefined
CodeViewer.aria-label?: string | undefined
function parseLineRanges(ranges: string | readonly number[] | undefined) => Set<number>
```
