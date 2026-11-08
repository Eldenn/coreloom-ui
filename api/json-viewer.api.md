# @coreloom/json-viewer

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/json-viewer.tsx

```ts
function containerPaths(value: unknown, depth: number, path?: string, level?: number) => string[]
type JsonValue = string | number | boolean | JsonValue[] | { [key: string]: JsonValue; } | null
function JsonViewer
JsonViewer.value: unknown
JsonViewer.defaultExpandDepth?: number | undefined
JsonViewer.rootLabel?: React.ReactNode
JsonViewer.sortKeys?: boolean | undefined
JsonViewer.copyable?: boolean | undefined
JsonViewer.maxHeight?: string | undefined
JsonViewer.className?: string | undefined
JsonViewer.aria-label?: string | undefined
```
