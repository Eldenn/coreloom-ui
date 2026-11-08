# @coreloom/ansi-output

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/ansi-output.tsx

```ts
type AnsiColor = string | number
type AnsiLine = readonly AnsiSpan[]
function AnsiLineView
AnsiLineView.line: AnsiLine
AnsiLineView.links?: boolean | undefined
function AnsiOutput
AnsiOutput.text: string
AnsiOutput.wrap?: boolean | undefined
AnsiOutput.follow?: boolean | undefined
AnsiOutput.links?: boolean | undefined
AnsiOutput.maxHeight?: string | undefined
AnsiOutput.className?: string | undefined
AnsiOutput.aria-label?: string | undefined
type AnsiScreen = {}
AnsiScreen.lines: readonly AnsiLine[]
AnsiScreen.row: number
AnsiScreen.col: number
AnsiScreen.style: AnsiStyle
AnsiScreen.href?: string | undefined
AnsiScreen.pending: string
AnsiScreen.dropped: number
type AnsiSpan = {}
AnsiSpan.text: string
AnsiSpan.style: AnsiStyle
AnsiSpan.href?: string | undefined
type AnsiStyle = {}
AnsiStyle.fg?: AnsiColor | undefined
AnsiStyle.bg?: AnsiColor | undefined
AnsiStyle.bold?: boolean | undefined
AnsiStyle.dim?: boolean | undefined
AnsiStyle.italic?: boolean | undefined
AnsiStyle.underline?: boolean | undefined
AnsiStyle.inverse?: boolean | undefined
AnsiStyle.hidden?: boolean | undefined
AnsiStyle.strike?: boolean | undefined
function ansiStyle(style: AnsiStyle) => React.CSSProperties | undefined
function AnsiText
AnsiText.text: string
AnsiText.links?: boolean | undefined
function createAnsiScreen() => AnsiScreen
function lineText(line: AnsiLine) => string
function parseAnsi(text: string) => AnsiLine[]
function stripAnsi(text: string) => string
function writeAnsi(screen: AnsiScreen, chunk: string, { maxLines }?: { maxLines?: number; }) => AnsiScreen
```
