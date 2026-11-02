// Coreloom UI — VS Code webviews. Helpers for a React page running inside a VS Code extension's
// webview: follow the editor's theme (with vscode.css), keep UI state across the webview being
// hidden and shown again, and exchange typed messages with the extension. Outside VS Code
// (Storybook, a browser preview, tests) every helper degrades to a no-op, so the same page runs
// in both places.
import * as React from 'react'

/** The theme kinds VS Code reports, as written to `<html data-vscode>`. */
type VsCodeThemeKind = 'light' | 'dark' | 'high-contrast' | 'high-contrast-light'

/** What `acquireVsCodeApi()` returns inside a webview. */
interface VsCodeApi<State = unknown> {
  postMessage: (message: unknown) => void
  getState: () => State | undefined
  setState: <T extends State>(state: T) => T
}

/** A message between the webview and its extension: anything with a string `type`, so a union of
 *  them narrows with `switch (message.type)`. */
interface VsCodeMessage {
  type: string
}

const KINDS: Record<string, VsCodeThemeKind> = {
  'vscode-light': 'light',
  'vscode-dark': 'dark',
  'vscode-high-contrast': 'high-contrast',
  'vscode-high-contrast-light': 'high-contrast-light',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// acquireVsCodeApi() throws when called twice, so the page shares one instance.
let api: VsCodeApi | null | undefined

/** The webview's VS Code API, or null outside VS Code. Safe to call any number of times. */
function getVsCodeApi<State = unknown>(): VsCodeApi<State> | null {
  if (api === undefined) {
    const acquire = (globalThis as { acquireVsCodeApi?: () => VsCodeApi }).acquireVsCodeApi
    api = typeof acquire === 'function' ? acquire() : null
  }
  return api as VsCodeApi<State> | null
}

/** True inside a VS Code webview. */
function isVsCodeWebview() {
  return getVsCodeApi() !== null
}

/** The theme kind VS Code set on the webview's body, or null outside VS Code. */
function readVsCodeTheme(
  body: HTMLElement | null = typeof document === 'undefined' ? null : document.body,
) {
  if (!body) return null
  const kind = body.dataset.vscodeThemeKind
  if (kind && kind in KINDS) return KINDS[kind] ?? null
  // Older VS Code versions only set classes; the high-contrast-light body has both HC classes.
  if (body.classList.contains('vscode-high-contrast-light')) return 'high-contrast-light'
  if (body.classList.contains('vscode-high-contrast')) return 'high-contrast'
  if (body.classList.contains('vscode-light')) return 'light'
  if (body.classList.contains('vscode-dark')) return 'dark'
  return null
}

/** Writes a theme kind to `<html>`: data-vscode for vscode.css, and data-theme="light" for the light
 *  kinds so Coreloom's `dark:` / `light:` variants (and the Toaster) match. */
function applyVsCodeTheme(kind: VsCodeThemeKind, root: HTMLElement = document.documentElement) {
  root.dataset.vscode = kind
  if (kind === 'light' || kind === 'high-contrast-light') root.dataset.theme = 'light'
  else delete root.dataset.theme
}

function observeBody(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class', 'data-vscode-theme-kind'],
  })
  return () => {
    observer.disconnect()
  }
}

/** Follows VS Code's theme on `<html>` until the returned function is called. Call it once, before
 *  the first render, so the page never flashes the wrong colours. Does nothing outside VS Code. */
function syncVsCodeTheme() {
  const update = () => {
    const kind = readVsCodeTheme()
    if (kind) applyVsCodeTheme(kind)
  }
  update()
  return observeBody(update)
}

/** The current VS Code theme kind (null outside VS Code); re-renders when the user switches theme. */
function useVsCodeTheme() {
  return React.useSyncExternalStore(observeBody, readVsCodeTheme, () => null)
}

function readState(key: string): { found: boolean; value: unknown } {
  const state = getVsCodeApi()?.getState()
  return isRecord(state) && key in state
    ? { found: true, value: state[key] }
    : { found: false, value: undefined }
}

/** Like useState, but the value survives the webview being hidden and shown again (VS Code destroys
 *  the page when its tab is hidden). Values must be JSON-serialisable. Several hooks share the
 *  webview's state object, one key each. Outside VS Code it is plain useState. */
function useVsCodeState<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(() => {
    const saved = readState(key)
    return saved.found ? (saved.value as T) : initial
  })
  React.useEffect(() => {
    const vscode = getVsCodeApi()
    if (!vscode) return
    const state = vscode.getState()
    vscode.setState({ ...(isRecord(state) ? state : {}), [key]: value })
  }, [key, value])
  return [value, setValue] as const
}

/** Sends a message to the extension (`webview.onDidReceiveMessage`). Returns false outside VS Code. */
function postToExtension(message: VsCodeMessage) {
  const vscode = getVsCodeApi()
  if (!vscode) return false
  vscode.postMessage(message)
  return true
}

function isVsCodeMessage(data: unknown): data is VsCodeMessage {
  return isRecord(data) && typeof data.type === 'string'
}

/** Calls `onMessage` for each message the extension sends (`webview.postMessage`). Anything else
 *  posted to the window is ignored: data without a string `type`, or what `accept` rejects — pass
 *  a type guard (a zod `safeParse`, a switch on `type`) to check messages before they reach you. */
function useExtensionMessages<M extends VsCodeMessage>(
  onMessage: (message: M) => void,
  accept?: (data: unknown) => data is M,
) {
  const handle = React.useEffectEvent((data: unknown) => {
    if (accept ? accept(data) : isVsCodeMessage(data)) onMessage(data as M)
  })
  React.useEffect(() => {
    const listener = (event: MessageEvent) => {
      handle(event.data)
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])
}

export {
  applyVsCodeTheme,
  getVsCodeApi,
  isVsCodeWebview,
  postToExtension,
  readVsCodeTheme,
  syncVsCodeTheme,
  useExtensionMessages,
  useVsCodeState,
  useVsCodeTheme,
  type VsCodeApi,
  type VsCodeMessage,
  type VsCodeThemeKind,
}
