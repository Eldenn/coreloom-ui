# Spreadsheet

An editable grid that behaves like a spreadsheet: arrows, type to replace or Enter to edit, ranges with Shift or by dragging, copy, cut and paste as tab-separated text (with Excel, Google Sheets, Numbers), Delete to clear, Ctrl/⌘+Z to undo, and the sum and average of the numbers selected.

**Install** `pnpm dlx shadcn@latest add @coreloom/spreadsheet`.

**The consumer provides** `<Spreadsheet columns rows onRowsChange>`: columns `{ id, title, type?: 'text' | 'number', width?, readOnly?, format? }`, rows `{ id, [columnId]: string | number | null }`. Controlled. Optional: `createRow(index)` (a paste can add rows), `readOnly`, `rowHeaders`.

- An ARIA grid with one tab stop; copies, pastes and undos are announced. Number columns read both "1 234,5" and "1,234.5".
- No formulas; for a few hundred rows.

_On `window.CoreloomUIDesignSystem_ff5f32` as `Spreadsheet`._
