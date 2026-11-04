import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  closure,
  heavyPackages,
  npmPackages,
  overBudget,
  packageName,
  // @ts-expect-error -- a Node build script without types; its exports are checked below.
} from '../build/registry-size.mjs'

interface Item {
  name: string
  dependencies?: string[]
  registryDependencies?: string[]
}

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8')) as { items: Item[] }
const realItems = new Map(registry.items.map((item) => [item.name, item]))
const fakeItems = new Map<string, Item>([
  ['a', { name: 'a', registryDependencies: ['@coreloom/b', 'https://example.com/r/x.json'] }],
  [
    'b',
    {
      name: 'b',
      dependencies: ['recharts@^3', '@scope/pkg@1.2.0'],
      registryDependencies: ['@coreloom/a'],
    },
  ],
  ['c', { name: 'c', dependencies: ['clsx'] }],
])

const reach = closure as (items: Map<string, Item>, name: string) => Set<string>
const npm = npmPackages as (items: Map<string, Item>, name: string) => string[]
const heavy = heavyPackages as (items: Map<string, Item>, name: string) => string[]
const over = overBudget as (
  budget: Record<string, number>,
  sizes: Record<string, number>,
) => string[]
const pkg = packageName as (dependency: string) => string

describe('registry sizes', () => {
  it('reads package names with and without a version or scope', () => {
    expect(pkg('recharts@^3')).toBe('recharts')
    expect(pkg('@scope/pkg@1.2.0')).toBe('@scope/pkg')
    expect(pkg('@scope/pkg')).toBe('@scope/pkg')
    expect(pkg('clsx')).toBe('clsx')
  })

  it('follows @coreloom dependencies through cycles and skips other registries', () => {
    expect([...reach(fakeItems, 'a')].sort()).toEqual(['a', 'b'])
    expect(() => reach(fakeItems, 'missing')).toThrow(/no item "missing"/)
  })

  it('lists the npm packages of an item and of what it pulls', () => {
    expect(npm(fakeItems, 'a')).toEqual(['@scope/pkg', 'recharts'])
    expect(heavy(fakeItems, 'a')).toEqual(['recharts'])
    expect(heavy(fakeItems, 'c')).toEqual([])
  })

  it('flags items over their budget and its margin, and items without one', () => {
    const budget = { small: 1000, large: 100_000 }
    expect(over(budget, { small: 2124, large: 111_024 })).toEqual([])
    expect(over(budget, { small: 2125 })).toEqual(['small: 2125 B, budget 1000 B (+10 %)'])
    expect(over(budget, { large: 111_025 })).toHaveLength(1)
    expect(over(budget, { fresh: 10 })).toEqual(['fresh: no budget yet (10 B)'])
  })

  it('keeps `all` free of heavy packages, and `everything` still has them', () => {
    expect(heavy(realItems, 'all')).toEqual([])
    const full = heavy(realItems, 'everything')
    for (const name of ['recharts', '@tiptap/react', '@codemirror/view', '@xyflow/react'])
      expect(full).toContain(name)
  })

  it('installs every ui component through `everything`', () => {
    const everything = reach(realItems, 'everything')
    const ui = registry.items.filter(
      (item) => (item as Item & { type: string }).type === 'registry:ui',
    )
    for (const item of ui) expect(everything.has(item.name), item.name).toBe(true)
  })
})
