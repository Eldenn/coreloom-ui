import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  accentVariables,
  contrastRatio,
  generateAccent,
  type GeneratedAccent,
  parseHex,
  toAccentName,
  toOklch,
} from '@/lib/accent'

// The hand-picked presets of build/gen-accents.py (and accents.css), keyed by their dark fill: the
// colour a brand would type in.
const PRESETS = {
  cyan: {
    dark: { accent: '#1ce0d3', hover: '#4deadf', press: '#14b5ab', fg: '#1ce0d3', on: '#06201e' },
    light: { accent: '#00968d', hover: '#14b5ab', press: '#00958c', fg: '#006f6c', on: '#06201e' },
  },
  blue: {
    dark: { accent: '#60a5fa', hover: '#93c5fd', press: '#3b82f6', fg: '#7cb5fb', on: '#04122a' },
    light: { accent: '#2563eb', hover: '#1d4fd8', press: '#1e40af', fg: '#1d4ed8', on: '#ffffff' },
  },
  violet: {
    dark: { accent: '#a78bfa', hover: '#c4b5fd', press: '#9d84fa', fg: '#b4a0fb', on: '#160c33' },
    light: { accent: '#7c3aed', hover: '#6d28d9', press: '#5b21b6', fg: '#6d28d9', on: '#ffffff' },
  },
  amber: {
    dark: { accent: '#fbbf24', hover: '#fcd34d', press: '#f59e0b', fg: '#fbbf24', on: '#231500' },
    light: { accent: '#b45309', hover: '#92400e', press: '#78350f', fg: '#92400e', on: '#ffffff' },
  },
  rose: {
    dark: { accent: '#fb7185', hover: '#fda4af', press: '#f43f5e', fg: '#fb8799', on: '#2b0610' },
    light: { accent: '#e11d48', hover: '#be123c', press: '#9f1239', fg: '#be123c', on: '#ffffff' },
  },
} as const

type Token = 'accent' | 'hover' | 'press' | 'fg' | 'on'
const TOKENS: Token[] = ['accent', 'hover', 'press', 'fg', 'on']

/** Distance in OKLab (ΔE OK). About 0.02 is the smallest difference people notice side by side. */
function deltaE(a: string, b: string) {
  const lab = (hex: string) => {
    const { l, c, h } = toOklch(hex)
    return [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)] as const
  }
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

const isHex = (s: string) => /^#[0-9a-f]{6}$/.test(s)

function expectSound(g: GeneratedAccent) {
  expect(g.checks).toHaveLength(10)
  for (const c of g.checks) expect(c, `${c.theme} ${c.pair}`).toMatchObject({ pass: true })
  expect(g.pass).toBe(true)
  for (const f of [g.dark, g.light]) {
    for (const t of TOKENS) expect(isHex(f[t]), `${t} ${f[t]}`).toBe(true)
    expect(f.ringAlpha).toBeGreaterThan(0)
    expect(f.ringAlpha).toBeLessThanOrEqual(1)
  }
}

describe('generateAccent reproduces the presets', () => {
  // Tolerance: every token within ΔE OK 0.07 of the hand-picked value (most are under 0.03; the
  // largest is violet's dark press, which the preset keeps almost as light as the fill), the light
  // fill within 0.035, and the dark fill and dark text exactly the preset's (the input passes).
  for (const [name, preset] of Object.entries(PRESETS)) {
    it(name, () => {
      const g = generateAccent(preset.dark.accent, {
        name,
        lightText: name === 'cyan' ? 'dark' : 'white',
      })
      expectSound(g)
      expect(g.dark.accent).toBe(preset.dark.accent)
      expect(deltaE(g.dark.fg, preset.dark.fg)).toBeLessThan(0.015)
      expect(deltaE(g.light.accent, preset.light.accent)).toBeLessThan(0.035)
      for (const theme of ['dark', 'light'] as const)
        for (const t of TOKENS)
          expect(deltaE(g[theme][t], preset[theme][t]), `${theme} ${t}`).toBeLessThan(0.07)
      // White text in light where the presets have it, dark text on the dark fill.
      expect(g.light.on).toBe(name === 'cyan' ? g.dark.on : '#ffffff')
      expect(toOklch(g.dark.on).l).toBeLessThan(0.25)
    })
  }

  it('keeps the input as it is where it passes, and says what it moved', () => {
    const g = generateAccent('#60a5fa')
    expect(g.adjustments.some((a) => a.theme === 'dark' && a.token === 'accent')).toBe(false)
    const light = g.adjustments.find((a) => a.theme === 'light' && a.token === 'accent')
    expect(light).toMatchObject({ from: '#60a5fa', to: g.light.accent })
    expect(light?.message).toMatch(/^light accent: darkened from #60a5fa to #[0-9a-f]{6} .*4\.5:1/)
  })

  it('uses a light-theme colour as the light fill and lightens it for dark', () => {
    const g = generateAccent('#2563eb')
    expectSound(g)
    expect(g.light.accent).toBe('#2563eb')
    expect(toOklch(g.dark.accent).l).toBeGreaterThan(toOklch('#2563eb').l)
    expect(g.adjustments.map((a) => `${a.theme} ${a.token}`)).toContain('dark accent')
  })
})

describe('generateAccent on hard inputs', () => {
  const edges = {
    'pure yellow': '#ffff00',
    'near black': '#0a0a0a',
    black: '#000000',
    'near white': '#f5f5f5',
    white: '#ffffff',
    grey: '#808080',
    'pure red': '#ff0000',
    'pure blue': '#0000ff',
    'brand orange': '#ff5a1f',
  }
  for (const [label, hex] of Object.entries(edges)) {
    it(`${label} (${hex}) passes every check, with distinct states`, () => {
      const g = generateAccent(hex)
      expectSound(g)
      for (const f of [g.dark, g.light]) {
        expect(f.hover).not.toBe(f.accent)
        expect(f.press).not.toBe(f.accent)
      }
    })
  }

  it('darkens yellow towards amber in light, not olive', () => {
    const { h } = toOklch(generateAccent('#ffff00').light.accent)
    expect(h).toBeGreaterThan(60)
    expect(h).toBeLessThan(95)
  })

  it('keeps greys grey', () => {
    for (const hex of ['#808080', '#0a0a0a', '#f5f5f5']) {
      const g = generateAccent(hex)
      for (const f of [g.dark, g.light])
        for (const t of TOKENS) expect(toOklch(f[t]).c, `${hex} ${t}`).toBeLessThan(0.01)
    }
  })

  it('lightens a dark input for the dark theme and keeps a near-black one in light', () => {
    const g = generateAccent('#0a0a0a')
    expect(g.light.accent).toBe('#0a0a0a')
    expect(contrastRatio(g.dark.accent, '#21242b')).toBeGreaterThanOrEqual(3)
    expect(toOklch(g.light.hover).l).toBeGreaterThan(toOklch('#0a0a0a').l)
  })

  it('sets pass from the checks the CLI and the page show', () => {
    // No hex input found so far fails (every lightness walk can reach its target on these
    // surfaces); the flag is still derived from the checks, never assumed.
    const g = generateAccent('#ff5a1f', { lightText: 'dark' })
    expect(g.pass).toBe(g.checks.every((c) => c.pass))
    for (const c of g.checks) expect(c.ratio).toBeGreaterThanOrEqual(1)
  })

  it('rejects what is not a hex colour', () => {
    for (const bad of ['', 'red', '#12', '#12345', '#ggg000', 'rgb(0,0,0)'])
      expect(() => generateAccent(bad), bad).toThrow(TypeError)
  })
})

describe('parseHex and toAccentName', () => {
  it('normalises hex colours', () => {
    expect(parseHex('#1CE0D3')).toBe('#1ce0d3')
    expect(parseHex(' 1ce0d3 ')).toBe('#1ce0d3')
    expect(parseHex('#1cd')).toBe('#11ccdd')
    expect(parseHex('#1cd3')).toBeNull()
  })

  it('makes a safe data-accent value', () => {
    expect(toAccentName('Acme Orange!')).toBe('acme-orange')
    expect(toAccentName('"] body { color: red } [x="')).toBe('body-color-red-x')
    expect(toAccentName('  ')).toBe('brand')
    expect(generateAccent('#ff5a1f', { name: '<script>' }).name).toBe('script')
  })
})

describe('contrastRatio', () => {
  it('matches WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
  })
})

describe('the CSS', () => {
  const accentsCss = fs.readFileSync('src/styles/accents.css', 'utf8')

  it('is structured like accents.css, both themes, every variable', () => {
    const g = generateAccent('#ff5a1f', { name: 'orange' })
    expect(g.css).toContain("[data-accent='orange'] {")
    expect(g.css).toContain(
      "[data-theme='light'][data-accent='orange'],\n[data-theme='light'] [data-accent='orange'] {",
    )
    const presetVars = [...accentsCss.matchAll(/^\s+(--[a-z-]+):/gm)].map((m) => m[1])
    for (const v of new Set(presetVars)) expect(g.css.split(`  ${v}: `)).toHaveLength(3)
    expect(g.css).toContain(`--accent: ${g.dark.accent};`)
    expect(g.css).toContain(`--accent: ${g.light.accent};`)
    expect(g.css).toContain(`--fg-on-accent: ${g.light.on};`)
  })

  it('writes the preset blocks of accents.css for the preset values', () => {
    // accentVariables is the same writer the CSS uses; with blue's values it gives accents.css's
    // blue block (ring alpha and glow included).
    const block = /\[data-accent='blue'\] \{\n([^}]+)\}/.exec(accentsCss)?.[1] ?? ''
    const vars = accentVariables('dark', {
      ...PRESETS.blue.dark,
      border: PRESETS.blue.dark.accent,
      ringAlpha: 0.7,
    })
    const written = Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};\n`)
      .join('')
    expect(written).toBe(block)
  })
})
