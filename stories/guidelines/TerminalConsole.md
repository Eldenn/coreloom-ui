# TerminalConsole

Several terminals in one place, as in an IDE's panel: a tab per terminal, New terminal, a side by side split and Close. Use it for a project's consoles (a shell, a dev server, a remote machine), or under an IDE.

**The consumer provides** `createSession(profile)` (returns `{ title, terminal, id? }`, the terminal from `createTerminal`), and optionally `defaultSessions`, `profiles` (`{ id, label }`: with more than one, New terminal opens a menu of them), `onCloseSession(session)` (stop its process), `defaultSplit` and `actions`.

- Each terminal is a controller the app creates, so its output and history stay when you switch tabs or close the split.
- Tabs follow the APG tabs pattern: arrows, Home and End move between them. A running command shows a spinner on its tab and "running" for screen readers.
- Split shows two terminals side by side, stacked when the console is narrow (below 672 px of its own width). Choosing the other terminal's tab swaps them.
- Each terminal's bar has Stop, Clear, Copy and Close. Closing moves focus to the neighbour tab, or to New terminal when none is left, where the empty state offers to open one.
- The console runs nothing: commands and sessions are your app's, through each terminal's `onCommand` or `session`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/terminal-console` and import from `@/components/terminal-console`.
