# @coreloom/terminal-console

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/terminal-console.tsx

```ts
function TerminalConsole
TerminalConsole.defaultSessions?: TerminalConsoleSession[] | undefined
TerminalConsole.createSession: (profile: TerminalConsoleProfile | undefined) => Omit<TerminalConsoleSession, 'id'> & { id?: string; }
TerminalConsole.profiles?: TerminalConsoleProfile[] | undefined
TerminalConsole.onCloseSession?: ((session: TerminalConsoleSession) => void) | undefined
TerminalConsole.defaultSplit?: boolean | undefined
TerminalConsole.actions?: React.ReactNode
TerminalConsole.className?: string | undefined
TerminalConsole.aria-label?: string | undefined
type TerminalConsoleProfile = {}
TerminalConsoleProfile.id: string
TerminalConsoleProfile.label: string
type TerminalConsoleSession = {}
TerminalConsoleSession.id: string
TerminalConsoleSession.title: string
TerminalConsoleSession.terminal: TerminalController
```
