// Points every built registry item at its guide, so assistants that only read the registry (shadcn's
// MCP server lists and shows `description`, nothing else in prose) still find when to use an item,
// its props and its accessibility rules. Runs after `shadcn build` (see `registry:build`) and edits
// public/r/<name>.json and public/r/registry.json in place:
//   description  "<description> Guide: <url>" (or "Guides: <url>, <url>")
//   docs         the same links, which shadcn keeps with the item
// registry.json at the root stays as written. Usage: node build/registry-guides.mjs [dir]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { guidesFor, guideUrl } from './gen-llms.mjs'

const root = path.resolve(import.meta.dirname, '..')

/** The item with links to its guides, or the item unchanged when it has none. */
export function withGuides(item) {
  const urls = guidesFor(item).map(guideUrl)
  if (!urls.length) return item
  const links = `${urls.length > 1 ? 'Guides' : 'Guide'}: ${urls.join(', ')}`
  const description = (item.description ?? '').trim().replace(/\s*Guides?: \S.*$/, '')
  return {
    ...item,
    description: description ? `${description} ${links}` : links,
    docs: links,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = path.resolve(process.argv[2] ?? path.join(root, 'public/r'))
  const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  let linked = 0
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const full = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(full, 'utf8'))
    if (file === 'registry.json') write(full, { ...data, items: data.items.map(withGuides) })
    else {
      const item = withGuides(data)
      if (item !== data) linked++
      write(full, item)
    }
  }
  console.log(`linked ${linked} registry items to their guides in ${path.relative(root, dir)}`)
}
