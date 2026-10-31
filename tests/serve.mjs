// Minimal static server for the built Storybook. Usage: node tests/serve.mjs <dir> <port>
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? 'public/storybook')
const port = Number(process.argv[3] ?? 6106)
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

if (!fs.existsSync(path.join(root, 'index.json'))) {
  console.error(`No Storybook build in ${root}. Run pnpm storybook:build first.`)
  process.exit(1)
}

http
  .createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname))
    if (!file.startsWith(root)) return res.writeHead(403).end()
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end()
      res
        .writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
        .end(data)
    })
  })
  .listen(port, '127.0.0.1', () => console.log(`Storybook on http://127.0.0.1:${port}`))
