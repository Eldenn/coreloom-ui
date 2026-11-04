// What each registry item costs an app: its JavaScript, with its @coreloom dependencies and npm
// packages bundled and minified (React left out, as the app has it already), in gzip bytes.
//   node build/registry-size.mjs           print the report and write public/r/sizes.json
//   node build/registry-size.mjs --check   also fail when an item outgrew build/registry-sizes.json
//                                          or `all` reached a heavy package (CI)
//   node build/registry-size.mjs --write   record the current sizes as the new budget
// The budget is the committed sizes plus a margin: a change that adds weight on purpose runs --write
// and the diff shows the new numbers in review.
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

import * as esbuild from 'esbuild'

const root = path.resolve(import.meta.dirname, '..')
const BUDGET_FILE = path.join(root, 'build/registry-sizes.json')

// Packages too heavy for `all`: they come with the `charts` and `editors` groups, or their own item.
const HEAVY = ['recharts', '@codemirror/', '@lezer/', '@tiptap/', '@xyflow/react']
// The budget's margin: 10 % and 1 KB, so a bundler update or a small fix doesn't fail the check.
const MARGIN = { ratio: 0.1, bytes: 1024 }
const CONCURRENCY = 4
const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client']

/** The item and every @coreloom item it pulls, by name. */
function closure(byName, name, seen = new Set()) {
  if (seen.has(name)) return seen
  const item = byName.get(name)
  if (!item) throw new Error(`registry.json: no item "${name}".`)
  seen.add(name)
  for (const dep of item.registryDependencies ?? [])
    if (dep.startsWith('@coreloom/')) closure(byName, dep.slice('@coreloom/'.length), seen)
  return seen
}

/** "recharts@^3" → "recharts", "@scope/pkg@1.2" → "@scope/pkg". */
function packageName(dependency) {
  return dependency.replace(/(?<=.)@[^/]*$/, '')
}

/** The npm packages an install of `name` adds, sorted. */
function npmPackages(byName, name) {
  const packages = new Set()
  for (const item of closure(byName, name))
    for (const dep of byName.get(item).dependencies ?? []) packages.add(packageName(dep))
  return [...packages].sort()
}

/** The heavy packages an install of `name` adds. */
function heavyPackages(byName, name) {
  return npmPackages(byName, name).filter((pkg) => HEAVY.some((heavy) => pkg.startsWith(heavy)))
}

/** Items whose size went over their budget, or that have none yet. */
function overBudget(budget, sizes) {
  const problems = []
  for (const [name, size] of Object.entries(sizes)) {
    const allowed = budget[name]
    if (allowed === undefined) problems.push(`${name}: no budget yet (${size} B)`)
    else if (size > allowed * (1 + MARGIN.ratio) + MARGIN.bytes)
      problems.push(
        `${name}: ${size} B, budget ${allowed} B (+${Math.round(MARGIN.ratio * 100)} %)`,
      )
  }
  return problems
}

/** The JavaScript files an item ships (styles and Markdown are left out of the measure). */
function scriptFiles(item) {
  return (item.files ?? []).map((file) => file.path).filter((file) => /\.tsx?$/.test(file))
}

async function measure(byName, name) {
  const files = [...closure(byName, name)].flatMap((item) => scriptFiles(byName.get(item)))
  if (!files.length) return undefined
  const result = await esbuild.build({
    stdin: {
      contents: files.map((file) => `export * from ${JSON.stringify(`./${file}`)}`).join('\n'),
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    tsconfig: path.join(root, 'tsconfig.app.json'),
    external: EXTERNAL,
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  })
  return gzipSync(result.outputFiles[0].contents, { level: 9 }).length
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
  const byName = new Map(registry.items.map((item) => [item.name, item]))
  // A few builds at a time: all of them at once exhaust esbuild's service.
  const measured = []
  for (let i = 0; i < registry.items.length; i += CONCURRENCY) {
    const batch = registry.items.slice(i, i + CONCURRENCY)
    measured.push(
      ...(await Promise.all(
        batch.map(async (item) => [item.name, await measure(byName, item.name)]),
      )),
    )
  }
  const sizes = Object.fromEntries(measured.filter(([, size]) => size !== undefined))

  const largest = Object.entries(sizes).sort((a, b) => b[1] - a[1])
  console.log('Largest items (gzip, React excluded):')
  for (const [name, size] of largest.slice(0, 15)) console.log(`  ${kb(size).padStart(9)}  ${name}`)

  const out = path.join(root, 'public/r')
  fs.mkdirSync(out, { recursive: true })
  const report = Object.fromEntries(
    largest.map(([name, size]) => [name, { gzip: size, npm: npmPackages(byName, name) }]),
  )
  fs.writeFileSync(path.join(out, 'sizes.json'), `${JSON.stringify(report, null, 2)}\n`)

  if (process.argv.includes('--write')) {
    const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)))
    fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(sorted, null, 2)}\n`)
    console.log(
      `Wrote the budget of ${Object.keys(sizes).length} items to build/registry-sizes.json.`,
    )
    return
  }
  if (!process.argv.includes('--check')) return

  const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'))
  const problems = overBudget(budget, sizes)
  const heavy = heavyPackages(byName, 'all')
  if (heavy.length) problems.push(`all: pulls heavy packages (${heavy.join(', ')})`)
  if (problems.length) {
    console.error(
      `Registry sizes:\n  ${problems.join('\n  ')}\n` +
        'If the weight is intended, run: node build/registry-size.mjs --write',
    )
    process.exit(1)
  }
  console.log(`Checked ${Object.keys(sizes).length} items against their budget.`)
}

if (process.argv[1] === import.meta.filename) await main()

export { closure, heavyPackages, npmPackages, overBudget, packageName }
