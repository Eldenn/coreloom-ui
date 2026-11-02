---
'@coreloom/ui': minor
---

### Added

- `Timeline` and `TimelineItem` (`@coreloom/timeline`): events in order on a line, with icon or dot
  markers tinted by tone, a title, a time, a description and any content below.
- `RelativeTime` (`@coreloom/relative-time`): "5 minutes ago", "yesterday", "in 3 days", kept up to
  date, with the full date in its tooltip; `formatRelative` is exported.
- `TreeView` (`@coreloom/tree-view`): a hierarchy to browse (files, pages, an organisation) with the
  APG tree keyboard and type-ahead, icons and trailing meta, read only or with single or multiple
  selection; `branchIds` is exported.
- `CodeViewer` (`@coreloom/code-viewer`): code with line numbers, highlighted lines ("3, 7-9"), a
  wrap toggle and Copy; `renderLine` plugs in a highlighter, `parseLineRanges` is exported.
- `DiffViewer` (`@coreloom/diff-viewer`): a line diff of two texts, unified or split, with unchanged
  runs folded; `diffLines` and `pairLines` are exported.
- `JsonViewer` (`@coreloom/json-viewer`): JSON to explore, objects and arrays folding, values
  coloured by type, Expand all, Collapse all and Copy.

### Changed

- AI artifact: the Changes tab uses `DiffViewer`; `diffLines` now lives in `@coreloom/diff-viewer`
  (still re-exported from the block). The diff strings moved from `ai.artifact` to `display.diff`
  in the messages (`ai.artifact.noChanges` stays).
