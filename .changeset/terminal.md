---
'@coreloom/ui': minor
---

### Added

- `Terminal` (`@coreloom/terminal`): a command line in the page, with a prompt, history (↑ ↓), Tab
  completion (`onComplete`), ANSI output, Ctrl+C, Ctrl+L, Stop, Clear and Copy. It runs nothing
  itself. `onCommand(command, context)` returns text, a promise or an async iterable (a stream).
  `context.signal` aborts on Ctrl+C, and `context.read({ prompt, secret })` asks a question
  mid-command. You can also connect a `session` (`onData`, `write`, `resize`, `interrupt`, `onExit`):
  a process that prints its own prompt, the shape xterm.js uses. `useTerminal` and `createTerminal`
  keep the output outside the component; `useTerminalState` reads it.
- `AnsiOutput` (`@coreloom/ansi-output`): program output with ANSI colours (16 from the theme's
  tokens, 256, true colour), styles, OSC 8 links and progress-bar rewrites (carriage return, erase
  line, cursor up). The incremental parser is exported as `writeAnsi`, `parseAnsi` and `stripAnsi`.
- `LogViewer` (`@coreloom/log-viewer`): a long, virtualized log with ANSI colours. It has search
  (marked words), level filters with counts, wrap, follow the end and copy. Levels and ISO
  timestamps are read from raw `text` (`parseLogText`), or you pass `entries`.
- `TerminalConsole` (`@coreloom/terminal-console`, block): several terminals in tabs, with New
  terminal (a menu of `profiles`), a side by side split and Close.
- `PipelineRun` (`@coreloom/pipeline-run`, block): one CI or deploy run, with its status, jobs,
  steps and each step's searchable log. The failed step opens by itself; Re-run, Cancel and Re-run
  job are callbacks.
- `Ide`: the bottom panel can be controlled (`panelOpen` / `onPanelOpenChange`, `panel` /
  `onPanelChange`), so Run can open a Terminal panel.
- `terminal`, `logViewer`, `terminalConsole` and `pipelineRun` message groups in en, fr, es and de.

### Upgrading

- New strings: re-install `@coreloom/i18n` (and `@coreloom/i18n-es` / `@coreloom/i18n-de` if you
  use them) with `--overwrite` before adding these items.
