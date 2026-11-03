# AnsiOutput

Text from a program with its ANSI colours and styles: a CLI's output, a build or test report, a stack trace from a tool. It reads what terminals read: SGR colours (16, 256 and true colour), bold, dim, italic, underline, inverse and strike, OSC 8 hyperlinks, and the cursor moves that progress bars use (carriage return, erase line, cursor up, clear screen).

**The consumer provides** `text` (it can grow while it streams), and optionally `wrap` (true), `follow` (true: stays at the end as text arrives, unless the reader scrolled up), `links` (true: http(s) URLs become links) and `maxHeight`.

- The 16 base colours come from the theme's tokens (red is the destructive colour, green success…), so they work in both themes. 256 and true colours are drawn as sent and may lack contrast.
- Only http, https and mailto links become links, opened in a new tab; anything else stays text. No HTML is ever rendered from the text.
- For a stream, keep the screen and feed it: `screen = writeAnsi(screen, chunk)` handles sequences cut between two chunks, and lines that didn't change keep their identity. `parseAnsi(text)` gives lines of styled spans, `stripAnsi(text)` the plain text a terminal would show. `AnsiText` draws a short string inline.
- The output takes focus so the keyboard can scroll it. For thousands of lines with search and levels, use LogViewer; to type commands, use Terminal.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/ansi-output` and import from `@/components/ui/ansi-output`.
