---
'@coreloom/ui': minor
---

### Added

- `@coreloom/ai-evals`: `EvalSuiteList` (suites with their last pass rate against a threshold, the
  trend and Run) and `EvalRunReport` (one eval run case by case with scores, the judge's verdict and
  reasoning, per-metric scores; with `baseline`, two runs side by side with regressions,
  improvements and a split diff of the outputs). `summarizeEvalRun` and `compareEvalRuns` are
  exported. It complements `ai-runs`.
- `@coreloom/file-manager`: `FileManager`, folders and files in a grid or a list with a breadcrumb,
  multi-selection, drag and drop onto folders and crumbs (or Move to), uploads dropped from the
  computer and a details panel. Helpers: `fileManagerPath`, `sortFileItems`, `canMoveTo`,
  `selectRange`, `fileTypeOf`.
- `@coreloom/inbox`: `Inbox`, shared conversations for a support or sales team: list with search
  and filters (status, unread, mine, unassigned), thread with internal notes and attachments, a
  composer for replies and notes, status and assignee. `filterConversations` is exported.
- `@coreloom/spreadsheet`: `Spreadsheet`, an editable grid like a spreadsheet: keyboard navigation,
  type or Enter to edit, range selection, copy, cut and paste as tab-separated text, undo and redo,
  and the sum and average of the selection. `parseTsv`, `toTsv`, `parseSheetValue` and
  `pasteIntoRows` are exported.
- New i18n groups `fileManager`, `inbox`, `spreadsheet` and `ai.evals` in all four languages.

### Fixed

- `DiffViewer` (split view): a short line no longer sits vertically centred next to a long wrapped
  one on the other side; both start at the top of the row.
