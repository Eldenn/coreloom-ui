import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

// @ts-expect-error -- a Node build script without types; its exports are checked below.
import { build, guidesFor } from '../build/gen-llms.mjs'

interface Item {
  name: string
  type: string
  title?: string
}
interface Llms {
  index: string
  full: string
  guides: string[]
}

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8')) as { items: Item[] }
const llms = (build as () => Llms)()
const guides = guidesFor as (item: Item) => string[]

describe('llms.txt', () => {
  it('lists every registry item once, with its install name', () => {
    for (const item of registry.items)
      expect(llms.index.split(`\`@coreloom/${item.name}\``).length - 1, item.name).toBe(1)
  })

  it('links a guide for every component and block', () => {
    // Small block parts documented by the block that uses them.
    const without = ['copy-button', 'site-header', 'site-footer']
    const documented = registry.items.filter(
      (i) =>
        ['registry:ui', 'registry:block', 'registry:component'].includes(i.type) &&
        !without.includes(i.name),
    )
    for (const item of documented) expect(guides(item), item.name).not.toEqual([])
  })

  it('inlines the guides in llms-full.txt', () => {
    expect(llms.full.length).toBeGreaterThan(llms.index.length * 3)
    expect(llms.full).toContain('### Button (`@coreloom/button`)')
    expect(llms.guides).toContain('AiSdk')
  })
})
