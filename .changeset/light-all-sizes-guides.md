---
'@coreloom/ui': minor
---

### Added

- `@coreloom/charts` (Chart, RadarChart, ScatterChart, TreemapChart and SankeyChart, the charts drawn with Recharts), `@coreloom/editors` (RichTextEditor and CodeEditor) and `@coreloom/everything` (`all`, `charts`, `editors` and `node-editor`).
- What each item costs an app, gzipped and without React, published at `r/sizes.json` with its npm packages.

### Changed

- `@coreloom/all` no longer installs the components built on Recharts, Tiptap, CodeMirror and React Flow: it now adds about 460 KB of gzipped JavaScript instead of about 1 MB. The light charts (Sparkline, DonutChart, BarList, Gauge, Heatmap, FunnelChart) stay in it.
- Guides now name every prop their component takes: Sidebar `side` and `variant`, AppShell's sidebar shape, QuotaBar's number options, Popconfirm `onCancel` and `defaultOpen`, FormRenderer's `renderField` / `renderSection` / `showHidden`, RichTextEditor `suggestion` and `onReviewEnd`, and a dozen more.

### Fixed

- The Checkbox, Radio, Switch story links the checkbox to its description (`aria-describedby`), as an app should.

### Upgrading

- To keep installing everything with one command, use `pnpm dlx shadcn@latest add @coreloom/everything` instead of `@coreloom/all`, or add `@coreloom/charts`, `@coreloom/editors` or `@coreloom/node-editor` next to `all` for the parts you use. Files already installed are not touched.
