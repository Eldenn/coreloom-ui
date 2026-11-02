// The webview's HTML page, with a strict Content Security Policy: scripts run only with this
// page's nonce, files load only from the extension (cspSource), nothing reaches the network.
//
// style-src needs 'unsafe-inline': Sonner (toasts) and Vaul (drawers) add a <style> tag at runtime
// and take no nonce. Radix, React Flow and Recharts only set style attributes from JavaScript,
// which a CSP never blocks.

interface WebviewPage {
  /** `webview.cspSource` (or the preview server's origin). */
  cspSource: string
  /** A fresh random value for each page load. */
  nonce: string
  /** URLs of the bundled script and stylesheets, from `webview.asWebviewUri`. */
  script: string
  styles: string[]
  title: string
  /** VS Code's display language (`vscode.env.language`): the components' built-in text follows it. */
  lang: string
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function webviewHtml({ cspSource, nonce, script, styles, title, lang }: WebviewPage) {
  const csp = [
    "default-src 'none'",
    `img-src ${cspSource} https: data:`,
    `font-src ${cspSource}`,
    `style-src ${cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
  ].join('; ')
  const links = styles
    .map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}" />`)
    .join('\n    ')
  return `<!doctype html>
<html lang="${escapeAttribute(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${links}
    <title>${escapeAttribute(title)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${escapeAttribute(script)}"></script>
  </body>
</html>
`
}

export { webviewHtml, type WebviewPage }
