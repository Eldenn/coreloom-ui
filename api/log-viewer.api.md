# @coreloom/log-viewer

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/log-viewer.tsx

```ts
function detectLevel(line: string) => LogLevel | undefined
function filterLogEntries(entries: readonly LogEntry[], { query, levels }: { query?: string; levels?: ReadonlySet<LogLevel>; }) => { entry: LogEntry; index: number; }[]
type LogEntry = {}
LogEntry.id?: React.Key | undefined
LogEntry.time?: string | number | Date | undefined
LogEntry.level?: LogLevel | undefined
LogEntry.source?: string | undefined
LogEntry.message: string
type LogLevel = 'error' | 'info' | 'debug' | 'warn'
function LogViewer
LogViewer.entries?: readonly LogEntry[] | undefined
LogViewer.text?: string | undefined
LogViewer.height?: string | number | undefined
LogViewer.defaultLevels?: readonly LogLevel[] | undefined
LogViewer.defaultQuery?: string | undefined
LogViewer.defaultWrap?: boolean | undefined
LogViewer.follow?: boolean | undefined
LogViewer.lineNumbers?: boolean | undefined
LogViewer.timeZone?: string | undefined
LogViewer.toolbar?: boolean | undefined
LogViewer.actions?: React.ReactNode
LogViewer.empty?: React.ReactNode
LogViewer.className?: string | undefined
LogViewer.aria-label?: string | undefined
function parseLogText(text: string) => LogEntry[]
```
