import fs from "node:fs"
import { describe, expect, it } from "vitest"

// @ts-expect-error — a plain .mjs build script, no types
import { buildDtcg, color, shadow } from "../build/gen-dtcg.mjs"

const src = JSON.parse(fs.readFileSync("src/styles/tokens.json", "utf8"))
const files = buildDtcg(src) as Record<string, Record<string, unknown>>
const css = fs.readFileSync("src/styles/tokens.css", "utf8")

type Node = Record<string, unknown>
/** Every token (an object with $value) under a group, with its dotted path and inherited $type. */
function tokens(group: Node, prefix = "", type?: string): { path: string; type?: string; value: unknown }[] {
  const t = (group.$type as string | undefined) ?? type
  return Object.entries(group).flatMap(([key, v]) => {
    if (key.startsWith("$") || typeof v !== "object" || v === null) return []
    const node = v as Node
    const path = prefix ? `${prefix}.${key}` : key
    return "$value" in node ? [{ path, type: (node.$type as string | undefined) ?? t, value: node.$value }] : tokens(node, path, t)
  })
}

/** The CSS custom property in one theme block of tokens.css. */
function cssVar(name: string, theme: "dark" | "light") {
  const block = theme === "dark" ? css.split('[data-theme="light"]')[0] : css.split('[data-theme="light"]')[1].split("}")[0]
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(block)?.[1].trim()
}

describe("DTCG export", () => {
  it("writes the base, both themes and the resolver", () => {
    expect(Object.keys(files).sort()).toEqual(["coreloom.dark.tokens.json", "coreloom.light.tokens.json", "coreloom.resolver.json", "coreloom.tokens.json"])
  })

  for (const theme of ["dark", "light"] as const) {
    const merged = [...tokens(files["coreloom.tokens.json"]), ...tokens(files[`coreloom.${theme}.tokens.json`])]
    const byPath = new Map(merged.map((t) => [t.path, t]))
    const resolve = (v: unknown, depth = 0): unknown => {
      if (typeof v === "string" && /^\{.+\}$/.test(v)) {
        const target = byPath.get(v.slice(1, -1))
        if (!target || depth > 5) throw new Error(`Unresolved reference ${v}`)
        return resolve(target.value, depth + 1)
      }
      return v
    }

    it(`${theme}: every token has a type and every reference resolves`, () => {
      for (const t of merged) {
        expect(t.type, t.path).toBeTruthy()
        expect(() => resolve(t.value), t.path).not.toThrow()
      }
    })

    it(`${theme}: colours match tokens.css`, () => {
      for (const t of merged.filter((t) => t.type === "color")) {
        const name = t.path.replace(/^color\./, "")
        let expected = cssVar(name, theme) ?? cssVar(name, "dark")
        // Follow var(--x) chains in the CSS the same way.
        for (let i = 0; expected?.startsWith("var(") && i < 5; i++) {
          const ref = /var\(--([^)]+)\)/.exec(expected)![1]
          expected = cssVar(ref, theme) ?? cssVar(ref, "dark")
        }
        expect(resolve(t.value), t.path).toEqual(color(expected!))
      }
    })
  }

  it("reads CSS colours and shadows", () => {
    expect(color("#1CE0D3")).toEqual({ colorSpace: "srgb", components: [0.1098, 0.8784, 0.8275], hex: "#1ce0d3" })
    expect(color("rgba(0, 0, 0, 0.55)")).toMatchObject({ components: [0, 0, 0], alpha: 0.55, hex: "#000000" })
    expect(shadow("inset 0 1px 0 rgba(255,255,255,0.6)")).toMatchObject({ inset: true, offsetY: { value: 1, unit: "px" } })
    expect(shadow("0 0 0 1px #000000, 0 6px 24px #111111")).toHaveLength(2)
  })

  it("keeps letter spacing exact: em in the scale, em × size in typography", () => {
    const base = files["coreloom.tokens.json"] as Node
    const display = (base.typography as Node)["cl-display"] as Node
    expect((display.$value as Node).letterSpacing).toEqual({ value: -1.92, unit: "px" })
    expect(((base.letterSpacing as Node)["ls-tighter"] as Node).$value).toBe(-0.03)
  })
})
