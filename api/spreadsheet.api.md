# @coreloom/spreadsheet

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/spreadsheet.tsx

```ts
function normalizeRange(a: SheetCell, b: SheetCell) => SheetRange
function parseSheetValue(raw: string, type?: SheetColumn['type']) => SheetValue
function parseTsv(text: string) => string[][]
function pasteIntoRows(rows: readonly SheetRow[], columns: readonly SheetColumn[], at: SheetCell, matrix: readonly (readonly string[])[], createRow?: (index: number) => SheetRow) => SheetRow[]
type SheetCell = {}
SheetCell.row: number
SheetCell.col: number
type SheetColumn = {}
SheetColumn.id: string
SheetColumn.title: string
SheetColumn.type?: 'number' | 'text' | undefined
SheetColumn.width?: number | undefined
SheetColumn.readOnly?: boolean | undefined
SheetColumn.format?: ((value: SheetValue, locale: string) => string) | undefined
type SheetRange = {}
SheetRange.top: number
SheetRange.left: number
SheetRange.bottom: number
SheetRange.right: number
type SheetRow = { id: string; } & Record<string, SheetValue>
type SheetValue = string | number | null
function Spreadsheet
Spreadsheet.columns: SheetColumn[]
Spreadsheet.rows: SheetRow[]
Spreadsheet.onRowsChange?: ((rows: SheetRow[]) => void) | undefined
Spreadsheet.createRow?: ((index: number) => SheetRow) | undefined
Spreadsheet.readOnly?: boolean | undefined
Spreadsheet.rowHeaders?: boolean | undefined
Spreadsheet.aria-label?: string | undefined
Spreadsheet.className?: string | undefined
function toTsv(cells: readonly (readonly string[])[]) => string
```
