// Exports the tokens in the Design Tokens Community Group format (DTCG, 2025.10), for Figma
// (Tokens Studio, Variables importers), Style Dictionary, Terrazzo and native apps.
// Source: src/styles/tokens.json (the design system's tokens). Output, in public/tokens/:
//   coreloom.tokens.json         palette, type, spacing, radius, z-index… (shared by both themes)
//   coreloom.dark.tokens.json    semantic colours and shadows of the dark theme (aliases into the palette)
//   coreloom.light.tokens.json   the same names for the light theme
//   coreloom.resolver.json       how they combine: base + one theme (DTCG resolver module)
// Usage: node build/gen-dtcg.mjs [outDir]     (default public/tokens; CI publishes it to Pages)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EXT = 'dev.coreloom'

/** "#1ce0d3" or "rgba(28, 224, 211, 0.16)" → a DTCG colour value. */
export function color(css) {
  const s = css.trim()
  let m = /^#([0-9a-f]{6})$/i.exec(s)
  if (m) {
    const n = parseInt(m[1], 16)
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    return {
      colorSpace: 'srgb',
      components: rgb.map((v) => round(v / 255)),
      hex: `#${m[1].toLowerCase()}`,
    }
  }
  m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(s)
  if (m) {
    const rgb = m.slice(1, 4).map(Number)
    const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')
    const value = { colorSpace: 'srgb', components: rgb.map((v) => round(v / 255)), hex }
    if (m[4] !== undefined && Number(m[4]) !== 1) value.alpha = Number(m[4])
    return value
  }
  throw new Error(`Unreadable colour: ${css}`)
}

/** "16px" → { value: 16, unit: "px" }. Only px and rem are DTCG dimensions. */
export function dimension(css) {
  const m = /^(-?[\d.]+)(px|rem)$/.exec(String(css).trim())
  if (!m) throw new Error(`Not a px/rem dimension: ${css}`)
  return { value: Number(m[1]), unit: m[2] }
}

/** "0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 …" → DTCG shadow layers. */
export function shadow(css) {
  const layers = css.split(/,(?![^(]*\))/).map((l) => l.trim())
  const out = layers.map((layer) => {
    const inset = layer.startsWith('inset ')
    const rest = inset ? layer.slice(6) : layer
    const colorPart = /(rgba?\([^)]*\)|#[0-9a-f]{6})/i.exec(rest)
    if (!colorPart) throw new Error(`Shadow without a colour: ${css}`)
    const lengths = rest
      .replace(colorPart[0], '')
      .trim()
      .split(/\s+/)
      .map((v) => (v === '0' ? '0px' : v))
    const [offsetX, offsetY, blur = '0px', spread = '0px'] = lengths.map(dimension)
    return {
      color: color(colorPart[0]),
      offsetX,
      offsetY,
      blur,
      spread,
      ...(inset ? { inset: true } : {}),
    }
  })
  return out.length === 1 ? out[0] : out
}

/** Raw palette (cl-*, gph-*, cyan-*); everything else is a semantic, per-theme token. */
const PALETTE = /^(cl|gph|cyan)-/
const round = (n) => Math.round(n * 10000) / 10000
/** "{gph-950}" in tokens.json → "{color.gph-950}" (DTCG references use the full path). */
const alias = (v, group) =>
  typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? `{${group}.${v.slice(1, -1)}}` : null

export function buildDtcg(src) {
  const base = {
    $description: `${src.name}: shared tokens. Combine with one theme file (see coreloom.resolver.json).`,
  }
  const theme = { dark: { color: {}, shadow: {} }, light: { color: {}, shadow: {} } }

  // Colours: plain values are the palette (base); per-theme values go to the theme files.
  base.color = { $type: 'color' }
  for (const t of src.color.tokens) {
    const desc = t.usage ? { $description: t.usage } : {}
    if (PALETTE.test(t.name)) {
      base.color[t.name] = { $value: color(t.value), ...desc }
    } else if (typeof t.value === 'string') {
      // A semantic token with one value for both themes (fg-on-accent, scrim) still lives in each theme file.
      for (const id of ['dark', 'light'])
        theme[id].color[t.name] = {
          $type: 'color',
          $value: alias(t.value, 'color') ?? color(t.value),
          ...desc,
        }
    } else {
      for (const id of ['dark', 'light']) {
        const v = t.value[id]
        theme[id].color[t.name] = { $type: 'color', $value: alias(v, 'color') ?? color(v), ...desc }
      }
    }
  }

  base.font = {
    $type: 'fontFamily',
    ...Object.fromEntries(
      Object.entries(src.type.families).map(([k, stack]) => [
        k,
        { $value: stack.split(',').map((f) => f.trim().replace(/^'|'$/g, '')) },
      ]),
    ),
  }

  const group = (key, type, map = (v) => v) => {
    const g = src[key]
    return {
      $type: type,
      ...(g.note ? { $description: g.note } : {}),
      ...Object.fromEntries(
        g.tokens.map((t) => [
          t.name,
          { $value: map(t.value), ...(t.usage ? { $description: t.usage } : {}) },
        ]),
      ),
    }
  }
  base.spacing = group('spacing', 'dimension', dimension)
  base.radius = group('radius', 'dimension', dimension)
  base.fontSize = group('fontSize', 'dimension', dimension)
  base.fontWeight = group('fontWeight', 'fontWeight', Number)
  base.lineHeight = group('lineHeight', 'number', Number)
  // DTCG dimensions are px or rem only; letter spacing is in em, so it travels as a number of em.
  base.letterSpacing = {
    ...group('letterSpacing', 'number', (v) => Number(String(v).replace('em', ''))),
    $extensions: { [EXT]: { unit: 'em' } },
  }
  base.zIndex = group('zIndex', 'number', Number)
  base.breakpoint = group('breakpoint', 'dimension', dimension)
  base.container = group('container', 'dimension', dimension)

  // Text styles as DTCG typography tokens.
  base.typography = { $type: 'typography' }
  for (const g of src.type.groups) {
    for (const s of g.styles) {
      // Font size in px except for cl-code (0.9em, relative to the surrounding text).
      const fontSize = /px$/.test(s.fontSize) ? dimension(s.fontSize) : null
      const em = s.letterSpacing ? Number(String(s.letterSpacing).replace('em', '')) : 0
      const value = {
        fontFamily: `{font.${g.family}}`,
        fontSize: fontSize ?? { value: 1, unit: 'rem' },
        fontWeight: s.fontWeight,
        // Tracking is in em: in px it is em × the style's own size.
        letterSpacing: { value: fontSize ? round(em * fontSize.value) : 0, unit: 'px' },
        lineHeight: s.lineHeight,
      }
      const ext = {}
      if (em) ext.letterSpacingEm = em
      if (!fontSize) ext.fontSizeEm = Number(s.fontSize.replace('em', ''))
      base.typography[s.name] = {
        $value: value,
        ...(s.usage ? { $description: s.usage } : {}),
        // The em values as written in CSS (DTCG dimensions are px or rem only).
        ...(Object.keys(ext).length ? { $extensions: { [EXT]: ext } } : {}),
      }
    }
  }

  for (const t of src.shadow.tokens) {
    for (const id of ['dark', 'light']) {
      const v = typeof t.value === 'string' ? t.value : t.value[id]
      theme[id].shadow[t.name] = {
        $type: 'shadow',
        $value: shadow(v),
        ...(t.usage ? { $description: t.usage } : {}),
      }
    }
  }

  const themeFile = (id) => ({
    $description: `${src.name}: ${id} theme. References point into coreloom.tokens.json.`,
    ...theme[id],
  })
  const resolver = {
    name: src.name,
    version: '2025.10',
    description: 'Base tokens plus one theme. Dark is the default, as in the CSS.',
    sets: { base: { sources: [{ $ref: 'coreloom.tokens.json' }] } },
    modifiers: {
      theme: {
        description: 'Colour scheme',
        contexts: {
          dark: [{ $ref: 'coreloom.dark.tokens.json' }],
          light: [{ $ref: 'coreloom.light.tokens.json' }],
        },
        default: 'dark',
      },
    },
    resolutionOrder: [{ $ref: '#/sets/base' }, { $ref: '#/modifiers/theme' }],
  }
  return {
    'coreloom.tokens.json': base,
    'coreloom.dark.tokens.json': themeFile('dark'),
    'coreloom.light.tokens.json': themeFile('light'),
    'coreloom.resolver.json': resolver,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, '..')
  const out = path.resolve(process.argv[2] ?? path.join(root, 'public/tokens'))
  const src = JSON.parse(fs.readFileSync(path.join(root, 'src/styles/tokens.json'), 'utf8'))
  fs.mkdirSync(out, { recursive: true })
  for (const [name, data] of Object.entries(buildDtcg(src)))
    fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2) + '\n')
  console.log(
    `wrote ${Object.keys(buildDtcg(src)).length} files to ${path.relative(process.cwd(), out) || '.'}`,
  )
}
