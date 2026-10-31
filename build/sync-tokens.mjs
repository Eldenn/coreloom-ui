// Copies the design system's compiled tokens.css into the registry (src/styles/tokens.css).
// The @font-face rules are dropped: in an app the fonts come from src/styles/fonts.css.
// Usage: pnpm tokens:sync path/to/design-system/tokens.css
import fs from 'node:fs'
import path from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error("Usage: pnpm tokens:sync <path to the design system's tokens.css>")
  process.exit(1)
}
const HEADER = '/* Coreloom UI Design System — generated from tokens.json */'
const NOTE = `/* Registry copy: the @font-face rules are left out. The fonts come from fonts.css
   (Fontsource packages), registered as "Geist Variable", "Space Grotesk Variable" and
   "JetBrains Mono Variable" — the font stacks below list those names after the brand names. */`

let css = fs.readFileSync(src, 'utf8')
if (!css.startsWith(HEADER)) throw new Error(`${src} is not a compiled Coreloom tokens.css`)
css =
  css
    .split('\n')
    .filter((l) => !l.startsWith('@font-face'))
    .join('\n')
    .trimEnd() + '\n'
css = css.replace(HEADER, `${HEADER}\n${NOTE}`)
for (const name of ['Geist Variable', 'Space Grotesk Variable', 'JetBrains Mono Variable'])
  if (!css.includes(`'${name}'`))
    console.warn(`warning: no '${name}' in the font stacks — set them in tokens.json`)

const out = path.resolve(import.meta.dirname, '../src/styles/tokens.css')
fs.writeFileSync(out, css)
console.log(`wrote ${path.relative(process.cwd(), out)}`)
