# LogViewer

A long log to read and search: a build, a deploy, a server's or a job's output. Only the visible lines are in the page (TanStack Virtual), so tens of thousands of lines stay smooth, and each line keeps its ANSI colours.

**The consumer provides** `entries` (`{ id?, time?, level?, source?, message }`, `level` one of `error`, `warn`, `info`, `debug`) or raw `text`, and optionally `height` (360), `defaultLevels` (all), `defaultQuery`, `defaultWrap` (false), `follow` (true), `lineNumbers` (true), `timeZone` (the reader's), `toolbar` (true), `actions` and `empty`. `parseLogText(text)` is what reads raw text: one entry per line, a leading ISO timestamp becomes `time`, words like ERROR, WARN or DEBUG set the level.

- Search keeps the lines that contain every word (any case) and marks them; "12 of 240 lines shown" is announced. The level buttons, with their counts, show or hide each level; lines without a level count as info.
- Follow keeps the newest line in view while the log grows. Scrolling up to read stops it; scrolling back to the end, or the button, resumes it.
- Each level has a word, not only a colour: a short tag (ERR, WRN) and the full word for screen readers. Errors and warnings get a tinted row.
- Copy copies the lines shown, as plain text. Wrap lines breaks long lines instead of scrolling sideways; line numbers stay put either way.
- For a short output without search, AnsiOutput is lighter; for a CI run with jobs and steps, use the PipelineRun block.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/log-viewer` and import from `@/components/ui/log-viewer`.
