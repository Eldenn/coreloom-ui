import fs from 'node:fs'

import { describe, expect, it } from 'vitest'

// @ts-expect-error -- a Node build script without types; its exports are checked below.
import { build, guidesFor } from '../build/gen-llms.mjs'
// @ts-expect-error -- a Node build script without types.
import { buildExamples } from '../build/registry-examples.mjs'
// @ts-expect-error -- a Node build script without types.
import { withGuides } from '../build/registry-guides.mjs'

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

describe('registry guide links', () => {
  const link = withGuides as (item: Item & { description?: string }) => {
    description?: string
    docs?: string
  }

  it('ends the description with the guide and keeps it in docs', () => {
    const button = link({ name: 'button', type: 'registry:ui', title: 'Button', description: 'A.' })
    const url = 'https://eldenn.github.io/coreloom-ui/guides/Button.md'
    expect(button.description).toBe(`A. Guide: ${url}`)
    expect(button.docs).toBe(`Guide: ${url}`)
  })

  it('lists every guide of an item documented by several', () => {
    expect(link({ name: 'auth', type: 'registry:block', description: 'B.' }).docs).toMatch(
      /^Guides: \S+LoginForm\.md, \S+PasswordReset\.md$/,
    )
  })

  it('is idempotent and leaves items without a guide alone', () => {
    const once = link({ name: 'button', type: 'registry:ui', title: 'Button', description: 'A.' })
    expect(link({ ...once, name: 'button', type: 'registry:ui' }).description).toBe(
      once.description,
    )
    const plain = { name: 'copy-button', type: 'registry:component', description: 'C.' }
    expect(link(plain)).toBe(plain)
  })
})

describe('registry examples', () => {
  interface Example {
    name: string
    type: string
    registryDependencies: string[]
    files: { path: string; content: string }[]
  }
  const examples = (buildExamples as () => Example[])()

  it('publishes a *-demo item per story file, naming the items it shows', () => {
    const button = examples.find((e) => e.name === 'button-demo')
    expect(button?.type).toBe('registry:example')
    expect(button?.registryDependencies).toContain('@coreloom/button')
    expect(button?.files[0]?.content).toContain("from '@/components/ui/button'")
  })

  it('brings the local helpers a story imports', () => {
    const chat = examples.find((e) => e.name === 'ai-chat-demo')
    expect(chat?.files.map((f) => f.path)).toContain('stories/blocks/ai-models.ts')
  })

  it('shows every component', () => {
    const shown = new Set(examples.flatMap((e) => e.registryDependencies))
    const components = registry.items.filter((i) => i.type === 'registry:ui')
    const missing = components.filter((i) => !shown.has(`@coreloom/${i.name}`))
    expect(missing.map((i) => i.name)).toEqual([])
  })
})
