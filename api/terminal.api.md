# @coreloom/terminal

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/terminal.tsx

```ts
function completeInput(input: string, candidates: readonly string[]) => { input: string; candidates: string[]; }
function createTerminal(options?: TerminalOptions) => TerminalController
function Terminal
Terminal.onComplete?: ((input: string) => readonly string[] | Promise<readonly string[]>) | undefined
Terminal.onCommand?: ((command: string, context: TerminalCommandContext) => TerminalCommandResult) | undefined
Terminal.session?: TerminalSession | undefined
Terminal.prompt?: string | undefined
Terminal.welcome?: string | undefined
Terminal.terminal?: TerminalController | undefined
Terminal.title?: React.ReactNode
Terminal.actions?: React.ReactNode
Terminal.toolbar?: boolean | undefined
Terminal.autoFocus?: boolean | undefined
Terminal.className?: string | undefined
Terminal.aria-label?: string | undefined
type TerminalCommandContext = {}
TerminalCommandContext.signal: AbortSignal
TerminalCommandContext.write: (text: string) => void
TerminalCommandContext.writeln: (text?: string) => void
TerminalCommandContext.clear: () => void
TerminalCommandContext.read: (options?: { prompt?: string; secret?: boolean; }) => Promise<string>
TerminalCommandContext.columns: number
type TerminalCommandResult = string | void | Promise<string | void> | AsyncIterable<string>
type TerminalController = {}
TerminalController.getState: () => TerminalState
TerminalController.subscribe: (listener: () => void) => () => void
TerminalController.write: (text: string) => void
TerminalController.writeln: (text?: string) => void
TerminalController.clear: () => void
TerminalController.run: (command: string) => Promise<void>
TerminalController.submit: (line: string) => Promise<void>
TerminalController.interrupt: () => void
TerminalController.complete: (input: string) => Promise<{ input: string; candidates: string[]; }>
TerminalController.setPrompt: (prompt: string) => void
TerminalController.resize: (columns: number, rows: number) => void
TerminalController.connect: (session: TerminalSession) => () => void
TerminalController.getText: () => string
TerminalController.setOptions: (options: TerminalOptions) => void
type TerminalOptions = {}
TerminalOptions.onCommand?: ((command: string, context: TerminalCommandContext) => TerminalCommandResult) | undefined
TerminalOptions.onComplete?: ((input: string) => readonly string[] | Promise<readonly string[]>) | undefined
TerminalOptions.session?: TerminalSession | undefined
TerminalOptions.prompt?: string | undefined
TerminalOptions.welcome?: string | undefined
TerminalOptions.history?: readonly string[] | undefined
TerminalOptions.onHistoryChange?: ((history: readonly string[]) => void) | undefined
TerminalOptions.maxLines?: number | undefined
TerminalOptions.maxHistory?: number | undefined
TerminalOptions.localEcho?: boolean | undefined
type TerminalSession = {}
TerminalSession.onData: (listener: (data: string) => void) => () => void
TerminalSession.write: (data: string) => void
TerminalSession.resize?: ((columns: number, rows: number) => void) | undefined
TerminalSession.interrupt?: (() => void) | undefined
TerminalSession.onExit?: ((listener: (code: number) => void) => () => void) | undefined
type TerminalState = {}
TerminalState.screen: AnsiScreen
TerminalState.prompt: string
TerminalState.running: boolean
TerminalState.reading: {}
TerminalState.reading.prompt: string
TerminalState.reading.secret: boolean
TerminalState.history: readonly string[]
TerminalState.exitCode?: number | undefined
TerminalState.connected: boolean
function useTerminal(options?: TerminalOptions) => TerminalController
function useTerminalState(terminal: TerminalController) => TerminalState
```
