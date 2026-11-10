// Every npm dependency an item installs names its major (`radix-ui@^1`): without a range,
// `shadcn add` installs the latest version, and a dependency's new major would reach apps
// without the major release VERSIONING.md promises.
import { describe, expect, it } from 'vitest'

import registry from '../registry.json'

describe('registry dependencies', () => {
  it('each one has a version range', () => {
    const bare = registry.items.flatMap((item) =>
      (item.dependencies ?? [])
        .filter((dep) => !/.@\^\d/.test(dep))
        .map((dep) => `${item.name}: ${dep}`),
    )
    expect(bare).toEqual([])
  })
})
