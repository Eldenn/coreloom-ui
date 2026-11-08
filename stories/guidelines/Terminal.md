# Terminal

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

A command line in the page: a prompt, an input with history and Tab completion, and the output with its ANSI colours. Use it for a project's console, a CLI in the browser, an admin shell, a deploy that asks before it runs. It runs nothing itself: every command goes to your app, which answers with text, a promise or a stream, so the commands can be a pretend shell, calls to your API, or a real process behind a WebSocket.

**The consumer provides** either `onCommand(command, context)` or a `session`, and optionally `prompt` (`"$ "`, ANSI allowed), `welcome`, `onComplete(input)` (candidates for the last word), `title`, `actions`, `toolbar` (true: title, Stop, Clear, Copy) and `autoFocus` (false). For the output to outlive the component (a panel that closes, a tab), create the terminal with `useTerminal(options)` or `createTerminal(options)` and pass it as `terminal`.

- **Commands.** `onCommand` returns a string, a promise, or an async iterable whose chunks print as they arrive. A thrown error prints in red. `context.signal` aborts on Ctrl+C or Stop (pass it to `fetch`); later output from that command is dropped. `context.read({ prompt, secret })` asks a question and resolves with the answer (a password input when `secret`). `context.write`, `writeln` and `clear` print mid-command; `context.columns` says how many columns fit.
- **Sessions.** A `TerminalSession` (`onData`, `write`, `resize`, `interrupt`, `onExit`) is a process that prints its own prompt, like a shell on a PTY. Enter sends the line and `"\r"`, Ctrl+C sends `"\x03"` (or calls `interrupt`), and `resize(columns, rows)` follows the box. It is the shape xterm.js uses, so a full-screen program (vim, htop) can move to xterm.js later with the same backend. This terminal is line based and doesn't draw full-screen programs.
- **Keyboard.** Enter runs, ↑ and ↓ go through the history, Tab completes (after Escape, Tab leaves the terminal), Ctrl+C stops (or copies when text is selected in the input), Ctrl+L clears, Ctrl+U empties the line. Clicking the output puts the cursor in the input unless the click selected text to copy.
- **Output.** 16 colours from the theme's tokens, 256 and true colours as sent (they may lack contrast: prefer the 16), bold, dim, italic, underline, inverse, strike, OSC 8 links and plain http(s) URLs as links. Carriage return and erase-line rewrite the line, so progress bars end as their last state. `maxLines` (5,000) caps the scrollback.
- **Screen readers.** The output is a log: new lines are announced. The input is named "Command", or by the question while `read()` waits; "Command running" is announced while a command runs. Echoed commands are stripped of control characters, so typed text can't recolour or move the output.
- No command runs in the page, and no HTML is ever rendered from output. Don't `eval` what people type.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/terminal` and import from `@/components/ui/terminal`.
