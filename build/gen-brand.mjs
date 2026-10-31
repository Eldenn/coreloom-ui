// Makes a brand accent from one colour: the whole accent family for the dark and light themes,
// contrast-checked, as a brand.css to import after accents.css. Same logic as the Storybook page
// (Foundations/Theme generator): both run src/lib/accent.ts.
// Usage: node build/gen-brand.mjs "#ff5a1f" --name orange [--light-text dark] > brand.css
// The CSS goes to stdout; what was adjusted and the checks go to stderr. Exits 1 (and writes no
// CSS) when a check can't pass or the input isn't a hex colour.
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const LIB = fileURLToPath(new URL('../src/lib/accent.ts', import.meta.url))

/** Node 22.18+ runs erasable TypeScript as it is; older Node gets it through esbuild (a devDependency). */
async function loadLib() {
  if (process.features.typescript) return import(LIB)
  const { build } = await import('esbuild')
  const out = await build({ entryPoints: [LIB], bundle: true, format: 'esm', write: false })
  const code = out.outputFiles[0].text
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

function usage(message) {
  if (message) process.stderr.write(`gen-brand: ${message}\n`)
  process.stderr.write(
    'Usage: node build/gen-brand.mjs "#rrggbb" [--name brand] [--light-text white|dark] > brand.css\n',
  )
  process.exit(1)
}

let parsed
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string', short: 'n', default: 'brand' },
      'light-text': { type: 'string', default: 'white' },
      help: { type: 'boolean', short: 'h' },
    },
  })
} catch (error) {
  usage(error instanceof Error ? error.message : String(error))
}
const { values, positionals } = parsed
if (values.help) usage()
if (positionals.length !== 1) usage('give exactly one colour')
const lightText = values['light-text']
if (lightText !== 'white' && lightText !== 'dark') usage('--light-text is "white" or "dark"')

const { generateAccent, parseHex } = await loadLib()
if (!parseHex(positionals[0])) usage(`not a hex colour: ${positionals[0]}`)

const result = generateAccent(positionals[0], { name: values.name, lightText })
const log = (line) => process.stderr.write(line + '\n')
for (const a of result.adjustments) log(`adjusted  ${a.message}`)
for (const c of result.checks)
  log(
    `${c.pass ? 'pass' : 'FAIL'}      ${c.theme.padEnd(5)} ${c.pair.padEnd(34)} ${c.ratio.toFixed(2)}`,
  )
if (!result.pass) {
  log(`gen-brand: "${result.name}" from ${result.input} does not pass every check; no CSS written.`)
  process.exit(1)
}
log(`gen-brand: data-accent="${result.name}" — every check passes.`)
process.stdout.write(result.css)
