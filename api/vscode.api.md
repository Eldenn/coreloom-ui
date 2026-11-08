# @coreloom/vscode

Stability: stable. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/lib/vscode.ts

```ts
function applyVsCodeTheme(kind: VsCodeThemeKind, root?: HTMLElement) => void
function getVsCodeApi<State = unknown>() => VsCodeApi<State> | null
function isVsCodeWebview() => boolean
function postToExtension(message: VsCodeMessage) => boolean
function readVsCodeTheme(body?: HTMLElement | null) => VsCodeThemeKind | null
function syncVsCodeTheme() => () => void
function useExtensionMessages<M extends VsCodeMessage>(onMessage: (message: M) => void, accept?: (data: unknown) => data is M) => void
function useVsCodeState<T>(key: string, initial: T) => readonly [T, React.Dispatch<React.SetStateAction<T>>]
function useVsCodeTheme() => VsCodeThemeKind | null
type VsCodeApi<State = unknown> = {}
VsCodeApi.postMessage: (message: unknown) => void
VsCodeApi.getState: () => State | undefined
VsCodeApi.setState: <T extends State>(state: T) => T
type VsCodeMessage = {}
VsCodeMessage.type: string
type VsCodeThemeKind = 'dark' | 'light' | 'high-contrast' | 'high-contrast-light'
```
