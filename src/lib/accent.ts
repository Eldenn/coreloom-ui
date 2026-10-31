// Coreloom UI — accent generator. Turns one brand colour into the whole accent family (fill, hover,
// press, text, text-on-accent, subtle, ring, border, glow) for the dark and the light theme, checks
// every pairing the theming guide requires (WCAG 2 contrast on every Coreloom surface), nudges
// lightness until they pass, and writes the CSS block an app drops in after accents.css.
// Pure TypeScript, no dependencies, no DOM: it runs in the browser, in Node and in tests.
// It follows build/gen-accents.py, which hand-picks the five presets and checks the same pairs.

type Theme = 'dark' | 'light'

/** The accent tokens of one theme, as hex colours (and the alpha of the focus ring). */
interface AccentFamily {
  /** --accent: the fill of primary buttons, switches, sliders, the selected tab. */
  accent: string
  /** --accent-hover */
  hover: string
  /** --accent-press */
  press: string
  /** --accent-fg: accent-coloured text (links, primary-text) on the page's surfaces. */
  fg: string
  /** --fg-on-accent: text and icons on an accent fill. */
  on: string
  /** --border-accent */
  border: string
  /** Alpha of --accent-ring (the accent in dark, accent-fg in light). */
  ringAlpha: number
}

/** One contrast requirement, measured on the worst surface. */
interface AccentCheck {
  theme: Theme
  /** What is measured, with the required ratio, as gen-accents.py names it. */
  pair: string
  /** The lowest WCAG 2 contrast ratio over the surfaces (two decimals). */
  ratio: number
  min: number
  pass: boolean
}

/** A token the generator moved away from the starting value to pass a check. */
interface AccentAdjustment {
  theme: Theme
  token: keyof Omit<AccentFamily, 'ringAlpha' | 'border'> | 'ringAlpha'
  from: string
  to: string
  /** One plain sentence: what was changed and why. */
  message: string
}

interface AccentOptions {
  /** The preset name: data-accent="<name>". Lowercase letters, digits and dashes. Default "brand". */
  name?: string
  /**
   * Text on the accent fill in the light theme. "white" (the default) darkens the fill until white
   * text reads; "dark" keeps the fill light and puts dark text on it (Coreloom's own cyan does this).
   */
  lightText?: 'white' | 'dark'
}

interface GeneratedAccent {
  name: string
  /** The input colour, normalised to #rrggbb. */
  input: string
  dark: AccentFamily
  light: AccentFamily
  checks: AccentCheck[]
  adjustments: AccentAdjustment[]
  /** Every check passed. When false, the CSS is still written but must not ship. */
  pass: boolean
  /** The brand.css content: one [data-accent] block per theme, structured like accents.css. */
  css: string
}

/** The surfaces accent colours sit on, in each theme: bg-1, surface-1/2, base, inset (tokens.css). */
const SURFACES: Record<Theme, readonly string[]> = {
  dark: ['#15171c', '#1a1d23', '#21242b', '#0d0f13', '#0a0b0e'],
  light: ['#ffffff', '#f7f8fa', '#f4f5f7', '#edeff2'],
}

const PAIRS = {
  on: { pair: 'on-accent text (4.5)', min: 4.5 },
  fill: { pair: 'accent fill vs surfaces (3)', min: 3 },
  fg: { pair: 'accent-fg text vs surfaces (4.5)', min: 4.5 },
  ring: { pair: 'ring vs surfaces (3)', min: 3 },
  subtle: { pair: 'accent-fg on accent-subtle (4.5)', min: 4.5 },
} as const

// Lightness steps in OKLCH, tuned on the five hand-picked presets (see unit/accent.test.ts).
const STEP = 0.005
/** Ratio the light fill aims for when it has to be derived: a little above 4.5, as the presets. */
const LIGHT_FILL_TARGET = 4.9
const DARK_TEXT_L = 0.2

// ---------------------------------------------------------------------------------------------
// Colour maths: sRGB hex ↔ OKLCH, WCAG 2 luminance and contrast, alpha blending.

type Rgb = readonly [number, number, number]
interface Oklch {
  l: number
  c: number
  h: number
}

/** "#1ce0d3", "1ce0d3", "#1cd" → "#1ce0d3"; anything else → null. */
function parseHex(value: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!m?.[1]) return null
  const h = m[1].toLowerCase()
  return '#' + (h.length === 3 ? h.replace(/./g, '$&$&') : h)
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function rgbToHex(rgb: Rgb): string {
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, v)) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)

function toOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as unknown as Rgb
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  return { l: L, c, h: c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }
}

/** OKLCH → linear sRGB, unclamped (out-of-gamut channels fall outside 0..1). */
function oklchToLinear({ l: L, c, h }: Oklch): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180)
  const B = c * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** The most chroma sRGB can show at this lightness and hue. */
function maxChroma(l: number, h: number): number {
  let lo = 0
  let hi = 0.4
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinear({ l, c: mid, h }))) lo = mid
    else hi = mid
  }
  return lo
}

/** OKLCH → hex, keeping lightness and hue and reducing chroma until the colour fits in sRGB. */
function fromOklch(l: number, c: number, h: number): string {
  const L = Math.min(1, Math.max(0, l))
  const C = Math.min(c, maxChroma(L, h))
  return rgbToHex(oklchToLinear({ l: L, c: C, h }).map(toGamma) as unknown as Rgb)
}

/** WCAG 2 relative luminance (the 0.03928 threshold, as gen-accents.py and the WCAG text). */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  ) as unknown as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2 contrast ratio between two hex colours, 1 to 21. */
function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** `fg` at `alpha` over `bg`, as the browser paints it (rounded to 8 bits, like the presets). */
function mix(fg: string, alpha: number, bg: string): string {
  const f = hexToRgb(fg)
  const b = hexToRgb(bg)
  return rgbToHex(f.map((v, i) => alpha * v + (1 - alpha) * (b[i] ?? 0)) as unknown as Rgb)
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v * 255)) as unknown as Rgb
  return `rgba(${r}, ${g}, ${b}, ${num(alpha)})`
}

const num = (n: number) => String(Number(n.toFixed(2)))
const worst = (c: string, surfaces: readonly string[]) =>
  Math.min(...surfaces.map((s) => contrastRatio(c, s)))

// ---------------------------------------------------------------------------------------------
// The checks gen-accents.py runs, one theme at a time.

function ringColour(theme: Theme, f: AccentFamily) {
  return theme === 'dark' ? f.accent : f.fg
}

function measure(theme: Theme, f: AccentFamily): AccentCheck[] {
  const s = SURFACES[theme]
  const ratios = {
    on: Math.min(...[f.accent, f.hover, f.press].map((c) => contrastRatio(f.on, c))),
    fill: worst(f.accent, s),
    fg: worst(f.fg, s),
    ring: Math.min(...s.map((b) => contrastRatio(mix(ringColour(theme, f), f.ringAlpha, b), b))),
    subtle: Math.min(...s.map((b) => contrastRatio(f.fg, mix(f.accent, 0.1, b)))),
  }
  return (Object.keys(PAIRS) as (keyof typeof PAIRS)[]).map((k) => ({
    theme,
    ...PAIRS[k],
    ratio: Math.floor(ratios[k] * 100) / 100,
    pass: ratios[k] >= PAIRS[k].min,
  }))
}

// ---------------------------------------------------------------------------------------------
// Derivation. Each token starts from a lightness step off the accent (tuned on the presets), then
// walks in OKLCH lightness, keeping hue and chroma, until its own requirement passes.

interface Walk {
  hex: string
  ok: boolean
}

/** From `l`, step lightness by `dir` until `ok(hex)` holds or lightness runs out. */
function walk(
  l: number,
  dir: 1 | -1,
  colour: (l: number) => string,
  ok: (hex: string) => boolean,
): Walk {
  let L = l
  for (;;) {
    const hex = colour(L)
    if (ok(hex)) return { hex, ok: true }
    if ((dir < 0 && L <= 0) || (dir > 0 && L >= 1)) return { hex, ok: false }
    L = Math.min(1, Math.max(0, L + dir * STEP))
  }
}

/** Chroma falls as a tint gets much lighter than the accent (the presets' 300 shades do too). */
function tintChroma(c: number, from: number, to: number) {
  return c * Math.min(1, Math.max(0.4, 1 - 5 * (to - from - 0.03)))
}

/** Ramps 0 → 1 between `a` and `b`, stays 1 to `c`, back to 0 at `d`. */
function plateau(h: number, a: number, b: number, c: number, d: number) {
  if (h <= a || h >= d) return 0
  if (h < b) return (h - a) / (b - a)
  return h <= c ? 1 : (d - h) / (d - c)
}

/**
 * The darker light-theme fill leans its hue the way the presets' 600 shades do: yellows towards
 * amber (darkened yellow turns olive), blues slightly towards violet.
 */
function lightHue(h: number, c: number) {
  if (c < 0.03) return h
  return h - 30 * plateau(h, 40, 80, 110, 130) + 8 * plateau(h, 225, 250, 260, 285)
}

interface Builder {
  adjustments: AccentAdjustment[]
  failed: Set<string>
}

/** Records the nudge when a walk moved the colour off where it started. */
function note(
  b: Builder,
  theme: Theme,
  token: AccentAdjustment['token'],
  start: string,
  result: Walk,
  why: string,
) {
  if (!result.ok) b.failed.add(`${theme} ${token}`)
  if (result.hex === start) return
  const dl = toOklch(result.hex).l - toOklch(start).l
  b.adjustments.push({
    theme,
    token,
    from: start,
    to: result.hex,
    message: `${theme} ${token}: ${dl > 0 ? 'lightened' : 'darkened'} from ${start} to ${result.hex} (OKLCH L ${toOklch(start).l.toFixed(2)} → ${toOklch(result.hex).l.toFixed(2)}) ${why}`,
  })
}

function darkFamily(input: string, b: Builder): AccentFamily {
  const s = SURFACES.dark
  const src = toOklch(input)
  const on = fromOklch(DARK_TEXT_L, Math.min(0.07, src.c * 0.35), src.h)
  const reads = (c: string) => contrastRatio(on, c) >= 4.5

  // The fill: the input itself when it passes; otherwise lighter, same hue and chroma.
  // It also leaves room for a darker press shade that text still reads on.
  const pressOf = (c: string) => {
    const o = toOklch(c)
    return fromOklch(o.l - 0.08, o.c * 1.25, o.h)
  }
  const fill = walk(
    src.l,
    1,
    (l) => (l === src.l ? input : fromOklch(l, src.c, src.h)),
    (c) => worst(c, s) >= 3 && reads(c) && reads(pressOf(c)),
  )
  note(
    b,
    'dark',
    'accent',
    input,
    fill,
    'so the fill reaches 3:1 on every surface and its text 4.5:1.',
  )
  const accent = fill.hex
  const a = toOklch(accent)

  // Hover: lighter, at least to the presets' 300-shade lightness; darker when already near white.
  let hl = Math.max(a.l + 0.04, 0.81)
  if (hl > 0.97) hl = a.l - 0.05
  const hoverStart = fromOklch(hl, tintChroma(a.c, a.l, hl), a.h)
  const hover = walk(hl, 1, (l) => fromOklch(l, tintChroma(a.c, a.l, l), a.h), reads)
  note(b, 'dark', 'hover', hoverStart, hover, 'so text on it reaches 4.5:1.')

  // Press: darker and a little more saturated (the presets' 500 shades).
  const pl = a.l - 0.08
  const pc = a.c * 1.25
  const pressStart = fromOklch(pl, pc, a.h)
  const press = walk(pl, 1, (l) => fromOklch(l, pc, a.h), reads)
  note(b, 'dark', 'press', pressStart, press, 'so text on it reaches 4.5:1.')

  // Text: the fill when it is light already, else a step lighter for easier reading.
  const fl = a.l >= 0.8 ? a.l : Math.min(0.8, a.l + 0.045)
  const fgColour = (l: number) => (l === a.l ? accent : fromOklch(l, tintChroma(a.c, a.l, l), a.h))
  const fgStart = fgColour(fl)
  const fg = walk(
    fl,
    1,
    fgColour,
    (c) => worst(c, s) >= 4.5 && s.every((bg) => contrastRatio(c, mix(accent, 0.1, bg)) >= 4.5),
  )
  note(b, 'dark', 'fg', fgStart, fg, 'so accent text reaches 4.5:1 on every surface.')

  const family: AccentFamily = {
    accent,
    hover: hover.hex,
    press: press.hex,
    fg: fg.hex,
    on,
    border: accent,
    ringAlpha: 0.7,
  }
  return withRing('dark', family, b)
}

function lightFamily(input: string, text: 'white' | 'dark', b: Builder): AccentFamily {
  const s = SURFACES.light
  const src = toOklch(input)
  const on =
    text === 'white' ? '#ffffff' : fromOklch(DARK_TEXT_L, Math.min(0.07, src.c * 0.35), src.h)
  const reads = (c: string) => contrastRatio(on, c) >= 4.5
  const fills = (c: string) => worst(c, s) >= 3

  // The fill: the input when it passes as it is. Otherwise a derived shade: the hue (yellows lean
  // to amber), chroma raised like the presets' 600 shades, lightness walked until the pair passes.
  const h = lightHue(src.h, src.c)
  const derived = (l: number) => fromOklch(l, Math.min(src.c * 1.5, 0.92 * maxChroma(l, h)), h)
  let fill: Walk
  if (fills(input) && reads(input)) fill = { hex: input, ok: true }
  else if (text === 'white')
    fill = walk(src.l, -1, derived, (c) => fills(c) && contrastRatio(on, c) >= LIGHT_FILL_TARGET)
  else {
    // Dark text: the fill must stay light enough to read on and dark enough to show: the first
    // lightness, from the top, where it shows.
    fill = walk(Math.max(src.l, 0.75), -1, derived, fills)
    if (!reads(fill.hex)) fill = { hex: fill.hex, ok: false }
  }
  note(
    b,
    'light',
    'accent',
    input,
    fill,
    text === 'white'
      ? 'so white text on it reaches 4.5:1 and the fill 3:1 on light surfaces.'
      : 'so the fill reaches 3:1 on light surfaces with dark text on it.',
  )
  const accent = fill.hex
  const a = toOklch(accent)
  const shade = (l: number) => fromOklch(l, Math.min(a.c, 0.95 * maxChroma(l, a.h)), a.h)

  let hover: Walk
  let press: Walk
  let hoverStart: string
  let pressStart: string
  if (text === 'white') {
    // Hover and press darken; near black, where there is no room left, they lighten instead
    // (by more: OKLCH lightness barely shows down there).
    const nearBlack = a.l < 0.2
    const hl = nearBlack ? Math.max(a.l + 0.1, 0.3) : a.l - 0.06
    const pl = nearBlack ? Math.max(a.l + 0.05, 0.24) : a.l - 0.12
    hoverStart = shade(hl)
    pressStart = shade(pl)
    hover = walk(hl, -1, shade, reads)
    press = walk(pl, -1, shade, reads)
  } else {
    // Dark text: hover lightens; press stays about the fill, the darkest the text still reads on.
    hoverStart = shade(a.l + 0.08)
    pressStart = shade(a.l - 0.03)
    hover = walk(a.l + 0.08, 1, shade, reads)
    press = walk(a.l - 0.03, 1, shade, reads)
  }
  note(b, 'light', 'hover', hoverStart, hover, 'so text on it reaches 4.5:1.')
  note(b, 'light', 'press', pressStart, press, 'so text on it reaches 4.5:1.')

  // Text: a step darker than the fill (with white text the presets reuse the hover shade).
  const fl = Math.max(0, a.l - (text === 'white' ? 0.06 : 0.1))
  const fgStart = shade(fl)
  const fg = walk(
    fl,
    -1,
    shade,
    (c) => worst(c, s) >= 4.5 && s.every((bg) => contrastRatio(c, mix(accent, 0.1, bg)) >= 4.5),
  )
  note(b, 'light', 'fg', fgStart, fg, 'so accent text reaches 4.5:1 on every surface.')

  const family: AccentFamily = {
    accent,
    hover: hover.hex,
    press: press.hex,
    fg: fg.hex,
    on,
    border: accent,
    ringAlpha: 0.85,
  }
  return withRing('light', family, b)
}

/** Raises the focus ring's alpha (0.05 at a time, up to opaque) until it reaches 3:1. */
function withRing(theme: Theme, f: AccentFamily, b: Builder): AccentFamily {
  const s = SURFACES[theme]
  const colour = ringColour(theme, f)
  const start = f.ringAlpha
  let alpha = start
  const ok = (a: number) => s.every((bg) => contrastRatio(mix(colour, a, bg), bg) >= 3)
  while (!ok(alpha) && alpha < 1) alpha = Math.min(1, Math.round((alpha + 0.05) * 100) / 100)
  if (!ok(alpha)) b.failed.add(`${theme} ringAlpha`)
  if (alpha !== start)
    b.adjustments.push({
      theme,
      token: 'ringAlpha',
      from: num(start),
      to: num(alpha),
      message: `${theme} ring: alpha raised from ${num(start)} to ${num(alpha)} so the focus ring reaches 3:1 on every surface.`,
    })
  return { ...f, ringAlpha: alpha }
}

// ---------------------------------------------------------------------------------------------
// Output.

/** "Acme Orange!" → "acme-orange"; nothing usable → "brand". */
function toAccentName(value: string): string {
  const name = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return name || 'brand'
}

/** The CSS variables of one theme's family, as accents.css writes them. */
function accentVariables(theme: Theme, f: AccentFamily): Record<string, string> {
  const dark = theme === 'dark'
  return {
    '--accent': f.accent,
    '--accent-hover': f.hover,
    '--accent-press': f.press,
    '--accent-fg': f.fg,
    '--accent-subtle': rgba(f.accent, 0.1),
    '--accent-ring': rgba(ringColour(theme, f), f.ringAlpha),
    '--border-accent': f.border,
    '--fg-on-accent': f.on,
    '--glow-accent': `0 0 0 1px ${rgba(f.accent, dark ? 0.4 : 0.35)}, 0 6px ${dark ? 24 : 20}px ${rgba(f.accent, dark ? 0.22 : 0.2)}`,
  }
}

function accentCss(name: string, input: string, dark: AccentFamily, light: AccentFamily): string {
  const block = (selector: string, vars: Record<string, string>) =>
    `${selector} {\n${Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}\n`
  return [
    `/* Coreloom UI — "${name}" accent, generated from ${input} by the theme generator (lib/accent.ts).`,
    ' * Import after accents.css, then set it on <html> or on any element (a section of its own):',
    ` *   <html data-accent="${name}">   or   <html data-accent="${name}" data-theme="light">`,
    ' * Every pairing is checked: text 4.5:1, fills and focus rings 3:1 on all surfaces. */',
    '',
    block(`[data-accent='${name}']`, accentVariables('dark', dark)),
    block(
      `[data-theme='light'][data-accent='${name}'],\n[data-theme='light'] [data-accent='${name}']`,
      accentVariables('light', light),
    ),
  ].join('\n')
}

/**
 * The full accent family for one brand colour, in both themes, with its contrast checks.
 * Throws a TypeError when `input` is not a hex colour (#rgb or #rrggbb).
 */
function generateAccent(input: string, options: AccentOptions = {}): GeneratedAccent {
  const hex = parseHex(input)
  if (!hex) throw new TypeError(`Not a hex colour: ${JSON.stringify(input)}`)
  const name = toAccentName(options.name ?? 'brand')
  const b: Builder = { adjustments: [], failed: new Set() }
  const dark = darkFamily(hex, b)
  const light = lightFamily(hex, options.lightText ?? 'white', b)
  const checks = [...measure('dark', dark), ...measure('light', light)]
  return {
    name,
    input: hex,
    dark,
    light,
    checks,
    adjustments: b.adjustments,
    pass: b.failed.size === 0 && checks.every((c) => c.pass),
    css: accentCss(name, hex, dark, light),
  }
}

export {
  type AccentAdjustment,
  type AccentCheck,
  type AccentFamily,
  type AccentOptions,
  accentVariables,
  contrastRatio,
  generateAccent,
  type GeneratedAccent,
  parseHex,
  toAccentName,
  toOklch,
}
