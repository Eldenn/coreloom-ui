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
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt',
}

/** The bytes a `Range: bytes=a-b` header asks for, or null for the whole file. */
function rangeOf(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? '')
  if (!match || (!match[1] && !match[2])) return null
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  return start <= end ? { start, end } : null
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
      const type = types[path.extname(file)] ?? 'application/octet-stream'
      // Media elements seek with byte ranges: without them a video can't jump to a time.
      const range = rangeOf(req.headers.range, data.length)
      if (!range)
        return res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes' }).end(data)
      res
        .writeHead(206, {
          'content-type': type,
          'accept-ranges': 'bytes',
          'content-range': `bytes ${range.start}-${range.end}/${data.length}`,
        })
        .end(data.subarray(range.start, range.end + 1))
    })
  })
  .listen(port, '127.0.0.1', () => console.log(`Storybook on http://127.0.0.1:${port}`))
