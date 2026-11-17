# Spreadsheet

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A grid people edit like a spreadsheet: price lists, budgets, bulk edits of records, data to clean before an import. Cells, ranges, copy and paste with Excel or Google Sheets, undo.

**Install** `pnpm dlx shadcn@latest add @coreloom/spreadsheet`.

**The consumer provides** `<Spreadsheet columns rows onRowsChange>`: columns are `{ id, title, type?: 'text' | 'number', width?, readOnly?, format?(value, locale) }`, rows `{ id, [columnId]: string | number | null }`. It is controlled: every edit, paste, cut, clear, undo and redo calls `onRowsChange` with the new rows. Optional: `createRow(index)` lets a paste add rows past the end, `readOnly`, `rowHeaders` (row numbers, default true), `aria-label`.

- Keyboard: arrows move (Ctrl/⌘ to the edge), Shift extends the range, Home/End, Page Up/Down; type to replace a cell, Enter or F2 to edit it, Enter/Tab to save and move, Escape to cancel; Delete clears the range; Ctrl/⌘+A selects all; Ctrl/⌘+Z undoes, Ctrl/⌘+Shift+Z or Ctrl+Y redoes. Tab moves along the row and leaves the grid at either end.
- Mouse: click, Shift-click or drag to select a range; double-click edits.
- Copy and paste use tab-separated text, what spreadsheets put on the clipboard (quoted cells with tabs or line breaks included). A single value pasted over a range fills it. Read-only columns are skipped.
- Number columns read "1 234,5", "1.234,5" and "1,234.5"; something that isn't a number is kept as typed, shown in red with a mark in the cell's corner, and left out of the sum. `format` changes only the display (a currency, a unit).
- The grid is an ARIA grid: one tab stop, cells say whether they're selected; copies, pastes and undos are announced. The status bar shows the active cell, the count, and the sum and average of the numbers selected.
- No formulas. Meant for a few hundred rows; for more, page them, or show them in DataTable.
