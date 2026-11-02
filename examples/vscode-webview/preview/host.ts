// Browser preview only: plays VS Code's part around the webview page, so the example can be
// opened (and tested) in a plain browser. It sets a built-in theme's --vscode-* variables and body
// class, adds the default styles VS Code injects into every webview, and answers the page's
// messages with demo data. ?theme=dark | light | high-contrast picks the theme.
import { VSCODE_THEMES } from '../../../stories/foundations/vscode-themes'
import type { ExtensionMessage, WebviewMessage } from '../src/messages'

type PreviewTheme = keyof typeof VSCODE_THEMES

const BODY_CLASS: Record<PreviewTheme, string> = {
  dark: 'vscode-dark',
  light: 'vscode-light',
  'high-contrast': 'vscode-high-contrast',
}

// A close copy of VS Code's webview defaults (unlayered, injected before the page's own CSS).
const DEFAULT_STYLES = `
html { scrollbar-color: var(--vscode-scrollbarSlider-background) var(--vscode-editor-background); }
body { background-color: transparent; color: var(--vscode-editor-foreground, var(--vscode-foreground)); font-family: var(--vscode-font-family); font-weight: var(--vscode-font-weight); font-size: var(--vscode-font-size, 13px); margin: 0; padding: 0 20px; }
img, video { max-width: 100%; max-height: 100%; }
a, a code { color: var(--vscode-textLink-foreground); }
p > a { text-decoration: var(--text-link-decoration); }
a:hover { color: var(--vscode-textLink-activeForeground); }
a:focus, input:focus, select:focus, textarea:focus { outline: 1px solid -webkit-focus-ring-color; outline-offset: -1px; }
code { font-family: var(--monaco-monospace-font); color: var(--vscode-textPreformat-foreground); background-color: var(--vscode-textPreformat-background); padding: 1px 3px; border-radius: 4px; }
pre code { padding: 0; }
blockquote { background: var(--vscode-textBlockQuote-background); border-color: var(--vscode-textBlockQuote-border); }
kbd { background-color: var(--vscode-keybindingLabel-background); color: var(--vscode-keybindingLabel-foreground); border-style: solid; border-width: 1px; border-radius: 3px; border-color: var(--vscode-keybindingLabel-border); border-bottom-color: var(--vscode-keybindingLabel-bottomBorder); box-shadow: inset 0 -1px 0 var(--vscode-widget-shadow); vertical-align: middle; padding: 1px 3px; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background-color: var(--vscode-scrollbarSlider-background, #79797966); }
`

const FILES = [
  'README.md',
  'package.json',
  'src/extension.ts',
  'src/html.ts',
  'src/messages.ts',
  'src/webview/app.tsx',
  'src/webview/main.tsx',
  'src/webview/styles.css',
  'node_modules/react/index.js',
]

function setTheme(theme: PreviewTheme) {
  const html = document.documentElement
  html.removeAttribute('style')
  for (const [name, value] of Object.entries(VSCODE_THEMES[theme]))
    html.style.setProperty(name, value)
  document.body.className = BODY_CLASS[theme]
  document.body.dataset.vscodeThemeKind = BODY_CLASS[theme]
}

/** `**`, `*`, `?` and `{a,b}`, as VS Code's findFiles reads them. */
function globToRegExp(glob: string) {
  let source = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob.charAt(i)
    if (c === '*' && glob[i + 1] === '*') {
      source += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'
      i += glob[i + 2] === '/' ? 2 : 1
    } else if (c === '*') source += '[^/]*'
    else if (c === '?') source += '[^/]'
    else if (c === '{') source += '(?:'
    else if (c === '}') source += ')'
    else if (c === ',') source += '|'
    else source += c.replace(/[.+^$()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${source}$`)
}

function reply(message: ExtensionMessage) {
  // VS Code delivers extension messages asynchronously, as a window message event.
  setTimeout(() => {
    window.postMessage(message, '*')
  }, 150)
}

function handle(message: WebviewMessage) {
  switch (message.type) {
    case 'ready':
      reply({ type: 'active-file', path: 'src/webview/app.tsx' })
      break
    case 'find': {
      const match = globToRegExp(message.pattern)
      const files = FILES.filter(
        (f) => match.test(f) && !(message.skipNodeModules && f.startsWith('node_modules/')),
      )
      reply({ type: 'found', pattern: message.pattern, files, truncated: false })
      break
    }
    case 'open-file':
      reply({ type: 'active-file', path: message.path })
      break
  }
}

const KEY = 'coreloom-preview-state'
const params = new URLSearchParams(location.search)
const requested = params.get('theme')
setTheme(requested && requested in VSCODE_THEMES ? (requested as PreviewTheme) : 'dark')

const style = document.createElement('style')
style.id = '_defaultStyles'
style.textContent = DEFAULT_STYLES
document.head.prepend(style)

Object.assign(window, {
  acquireVsCodeApi: () => ({
    postMessage: (message: WebviewMessage) => {
      handle(message)
    },
    getState: () => {
      const saved = sessionStorage.getItem(KEY)
      return saved ? (JSON.parse(saved) as unknown) : undefined
    },
    setState: <T>(state: T) => {
      sessionStorage.setItem(KEY, JSON.stringify(state))
      return state
    },
  }),
  /** For tests: switch theme live, as VS Code does. */
  setPreviewTheme: setTheme,
})
