// Browser preview only: serves dist/ and the webview page, with the same Content Security Policy as
// in VS Code (the preview's origin stands in for webview.cspSource). PORT picks the port.
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

import { webviewHtml } from '../src/html'

const port = Number(process.env.PORT ?? 5199)
const origin = `http://localhost:${port}`
const dist = path.dirname(new URL(import.meta.url).pathname)
const TYPES: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css' }

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', origin)
  if (url.pathname === '/') {
    const nonce = crypto.randomBytes(16).toString('base64')
    const styles = ['styles.css', 'webview.css'].filter((f) => fs.existsSync(path.join(dist, f)))
    const html = webviewHtml({
      cspSource: origin,
      nonce,
      script: `${origin}/webview.js`,
      styles: styles.map((f) => `${origin}/${f}`),
      title: 'Coreloom UI example (preview)',
      lang: url.searchParams.get('lang') ?? 'en',
    }).replace(
      '<script nonce=',
      `<script nonce="${nonce}" src="${origin}/preview-host.js"></script>\n    <script nonce=`,
    )
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(html)
    return
  }
  const file = path.join(dist, path.normalize(url.pathname).replace(/^([/\\])+/, ''))
  if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404)
    response.end()
    return
  }
  response.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
  })
  fs.createReadStream(file).pipe(response)
})

server.listen(port, () => {
  console.log(`Preview on ${origin}/?theme=dark (or light, high-contrast)`)
})
