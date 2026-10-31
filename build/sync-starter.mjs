// Copies the registry items the starter uses into starter/, at the paths `shadcn add` would write
// them, and checks starter/package.json lists their npm dependencies.
//   node build/sync-starter.mjs          copy (after changing a component)
//   node build/sync-starter.mjs --check  fail if starter/ is out of date (CI)
// The items are listed in starter/coreloom.json; their @coreloom dependencies come along.
import fs from 'node:fs'
import path from 'node:path'

const check = process.argv.includes('--check')
const root = path.resolve(import.meta.dirname, '..')
const starter = path.join(root, 'starter')
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
const { items: wanted } = JSON.parse(fs.readFileSync(path.join(starter, 'coreloom.json'), 'utf8'))
const byName = new Map(registry.items.map((item) => [item.name, item]))

// Every item the starter needs, dependencies included.
const needed = new Set()
const visit = (name) => {
  if (needed.has(name)) return
  const item = byName.get(name)
  if (!item) throw new Error(`starter/coreloom.json: no registry item "${name}".`)
  needed.add(name)
  for (const dep of item.registryDependencies ?? [])
    if (dep.startsWith('@coreloom/')) visit(dep.slice('@coreloom/'.length))
}
wanted.forEach(visit)

const problems = []
const files = new Map()
const npm = new Set()
for (const name of needed) {
  const item = byName.get(name)
  for (const file of item.files ?? []) files.set(file.target ?? file.path, file.path)
  // "recharts@^3" → "recharts", "@scope/pkg@^1" → "@scope/pkg"
  for (const dep of item.dependencies ?? []) npm.add(dep.replace(/(?<=.)@[^/]*$/, ''))
}

for (const [target, source] of files) {
  const from = path.join(root, source)
  const to = path.join(starter, target)
  const content = fs.readFileSync(from)
  if (check) {
    if (!fs.existsSync(to) || !fs.readFileSync(to).equals(content))
      problems.push(`${target} differs from ${source}`)
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    fs.writeFileSync(to, content)
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(starter, 'package.json'), 'utf8'))
const declared = { ...pkg.dependencies, ...pkg.devDependencies }
for (const dep of npm)
  if (!declared[dep])
    problems.push(`package.json is missing "${dep}" (needed by the registry items)`)

if (problems.length) {
  console.error(
    `starter/ is out of date:\n  ${problems.join('\n  ')}\n${check ? 'Run: node build/sync-starter.mjs' : ''}`,
  )
  process.exit(1)
}
console.log(
  `${check ? 'Checked' : 'Copied'} ${files.size} files from ${needed.size} registry items into starter/.`,
)
