// The messages the webview and the extension exchange. Both sides import these types, so a renamed
// field fails the build instead of failing silently at runtime.

/** Webview → extension (`webview.onDidReceiveMessage`). */
type WebviewMessage =
  | { type: 'ready' }
  | { type: 'find'; pattern: string; skipNodeModules: boolean }
  | { type: 'open-file'; path: string }

/** Extension → webview (`webview.postMessage`). */
type ExtensionMessage =
  | { type: 'active-file'; path: string | null }
  | { type: 'found'; pattern: string; files: string[]; truncated: boolean }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Checks what arrives on the window before the app trusts it. */
function isExtensionMessage(data: unknown): data is ExtensionMessage {
  if (!isRecord(data)) return false
  switch (data.type) {
    case 'active-file':
      return data.path === null || typeof data.path === 'string'
    case 'found':
      return (
        typeof data.pattern === 'string' &&
        typeof data.truncated === 'boolean' &&
        Array.isArray(data.files) &&
        data.files.every((f) => typeof f === 'string')
      )
    default:
      return false
  }
}

/** Checks what the webview sends before the extension acts on it. */
function isWebviewMessage(data: unknown): data is WebviewMessage {
  if (!isRecord(data)) return false
  switch (data.type) {
    case 'ready':
      return true
    case 'find':
      return typeof data.pattern === 'string' && typeof data.skipNodeModules === 'boolean'
    case 'open-file':
      return typeof data.path === 'string'
    default:
      return false
  }
}

export { type ExtensionMessage, isExtensionMessage, isWebviewMessage, type WebviewMessage }
