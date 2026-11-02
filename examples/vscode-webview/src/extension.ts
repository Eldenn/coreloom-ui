// The extension side: one command opens a webview panel that runs the React app in dist/. The
// panel finds files in the workspace and opens them; the app keeps its own UI state.
import * as crypto from 'node:crypto'
import * as fs from 'node:fs'

import * as vscode from 'vscode'

import { webviewHtml } from './html'
import { type ExtensionMessage, isWebviewMessage } from './messages'

const MAX_FILES = 200

function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined

  context.subscriptions.push(
    vscode.commands.registerCommand('coreloomExample.open', () => {
      if (panel) {
        panel.reveal()
        return
      }
      panel = openPanel(context)
      panel.onDidDispose(() => {
        panel = undefined
      })
    }),
  )
}

function openPanel(context: vscode.ExtensionContext) {
  const dist = vscode.Uri.joinPath(context.extensionUri, 'dist')
  const panel = vscode.window.createWebviewPanel(
    'coreloomExample',
    'Coreloom UI example',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      // The page may load files from dist/ only.
      localResourceRoots: [dist],
      // No retainContextWhenHidden: the page is rebuilt when its tab comes back, and keeps its
      // state through useVsCodeState (cheaper than keeping a hidden page alive).
    },
  )
  const { webview } = panel
  const asset = (name: string) => webview.asWebviewUri(vscode.Uri.joinPath(dist, name)).toString()
  // esbuild writes webview.css only when a component imports a stylesheet (React Flow does).
  const styles = ['styles.css', 'webview.css'].filter((name) =>
    fs.existsSync(vscode.Uri.joinPath(dist, name).fsPath),
  )
  webview.html = webviewHtml({
    cspSource: webview.cspSource,
    nonce: crypto.randomBytes(16).toString('base64'),
    script: asset('webview.js'),
    styles: styles.map(asset),
    title: 'Coreloom UI example',
    lang: vscode.env.language,
  })

  const post = (message: ExtensionMessage) => void webview.postMessage(message)
  const postActiveFile = () => {
    const uri = vscode.window.activeTextEditor?.document.uri
    post({ type: 'active-file', path: uri ? vscode.workspace.asRelativePath(uri, false) : null })
  }

  const disposables = [
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      // Focusing the panel itself clears the active editor: keep the last file shown.
      if (editor) postActiveFile()
    }),
    webview.onDidReceiveMessage(async (data: unknown) => {
      // The page runs third-party code (the npm packages it bundles): check what it sends.
      if (!isWebviewMessage(data)) return
      switch (data.type) {
        case 'ready':
          postActiveFile()
          break
        case 'find': {
          const exclude = data.skipNodeModules ? '**/node_modules/**' : null
          const found = await vscode.workspace.findFiles(data.pattern, exclude, MAX_FILES + 1)
          post({
            type: 'found',
            pattern: data.pattern,
            files: found
              .slice(0, MAX_FILES)
              .map((uri) => vscode.workspace.asRelativePath(uri, false))
              .sort(),
            truncated: found.length > MAX_FILES,
          })
          break
        }
        case 'open-file': {
          const folder = vscode.workspace.workspaceFolders?.[0]
          if (!folder) return
          const uri = vscode.Uri.joinPath(folder.uri, data.path)
          // Only files inside the workspace: the path comes from the page.
          if (!uri.fsPath.startsWith(folder.uri.fsPath)) return
          await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.One })
          break
        }
      }
    }),
  ]
  panel.onDidDispose(() => {
    for (const d of disposables) d.dispose()
  })
  return panel
}

function deactivate() {
  // Nothing to clean up: the panel's listeners go with it.
}

export { activate, deactivate }
