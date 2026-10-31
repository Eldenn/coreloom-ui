import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// @ts-expect-error — a plain .mjs build script, no types
import * as changelogModule from '../build/changelog.mjs'
// @ts-expect-error — a plain .mjs build script, no types
import * as notesModule from '../build/release-notes.mjs'

interface Changeset {
  id: string
  summary: string
}
type Bump = 'major' | 'minor' | 'patch'

// What these tests use from the scripts, typed here.
const changelog = changelogModule as {
  default: {
    getReleaseLine: (changeset: Changeset, type: Bump) => Promise<string>
    getDependencyReleaseLine: () => Promise<string>
  }
  checkSummary: (summary: string) => string[]
  normalizeSummary: (summary: string, type: Bump) => string
  formatRelease: (
    changelog: string,
    options?: { date?: string },
  ) => { changelog: string; version: string } | null
  releaseDate: (date?: Date) => string
  checkChangesets: (dir: string) => string[]
}
const { releaseNotes } = notesModule as {
  releaseNotes: (input: { tag: string; packageVersion: string; changelog: string }) => string
}

const REPO = 'https://github.com/Eldenn/coreloom-ui'

const intro = `# Changelog

What changed, release by release.

\`\`\`json
"registries": { "@coreloom": "${REPO}/releases/download/v0.7.0/{name}.json" }
\`\`\`
`

const history = `## [0.7.0] - 2026-10-30

### Added

- \`MultiSelect\`.

[0.7.0]: ${REPO}/releases/tag/v0.7.0
`

/** What `changeset version` writes: its entry under the first line, then the rest of the file. */
async function changesetsEntry(version: string, changesets: (Changeset & { type: Bump })[]) {
  const { getReleaseLine, getDependencyReleaseLine } = changelog.default
  const block = async (type: Bump, title: string, extra: string[] = []) => {
    const lines = await Promise.all(
      changesets.filter((cs) => cs.type === type).map((cs) => getReleaseLine(cs, type)),
    )
    const all = [...lines, ...extra].map((l) => l.trim()).filter(Boolean)
    return all.length > 0 ? `### ${title} Changes\n\n${all.join('\n\n')}` : ''
  }
  const parts = [
    `## ${version}`,
    await block('major', 'Major'),
    await block('minor', 'Minor'),
    await block('patch', 'Patch', [await getDependencyReleaseLine()]),
  ].filter(Boolean)
  return parts.join('\n\n')
}

function asWrittenByChangesets(file: string, entry: string) {
  const index = file.indexOf('\n')
  return `${file.slice(0, index)}\n\n${entry}\n${file.slice(index + 1)}`
}

describe('changeset text', () => {
  it('keeps the sections a changeset names', () => {
    const text = '### Added\n\n- `Thing`.\n\n### Upgrading\n\n- Re-install it.'
    expect(changelog.normalizeSummary(`\n${text}\n`, 'minor')).toBe(text)
  })

  it('files a changeset without a section by its bump', () => {
    expect(changelog.normalizeSummary('- Fixed a thing.', 'patch')).toBe(
      '### Fixed\n\n- Fixed a thing.',
    )
    expect(changelog.normalizeSummary('- Renamed a prop.', 'minor')).toBe(
      '### Changed\n\n- Renamed a prop.',
    )
  })

  it('refuses headings that are not sections, outside code only', () => {
    expect(changelog.checkSummary('### Fixes\n\n- x')).toHaveLength(1)
    expect(changelog.checkSummary('## Added\n\n- x')).toHaveLength(1)
    expect(changelog.checkSummary('### Added\n\n```md\n## Not a heading\n```')).toEqual([])
    expect(() => changelog.normalizeSummary('#### Notes', 'patch')).toThrow(/not a section/)
  })

  it('reports the file of a bad changeset to Changesets', async () => {
    await expect(
      changelog.default.getReleaseLine({ id: 'odd-cats', summary: '### Misc\n\n- x' }, 'patch'),
    ).rejects.toThrow('.changeset/odd-cats.md')
  })
})

describe('formatRelease', () => {
  it('turns the Changesets entry into the house style, under the intro', async () => {
    const entry = await changesetsEntry('0.8.0', [
      { id: 'b-chart', type: 'minor', summary: '### Added\n\n- `Chart`.\n\n### Upgrading\n\n- B.' },
      {
        id: 'a-table',
        type: 'minor',
        summary: '### Added\n\n- `Table` `virtual`: many rows,\n  only the visible ones.',
      },
      { id: 'c-fix', type: 'patch', summary: '- `Select` keeps focus.' },
      { id: 'd-theme', type: 'minor', summary: '### Changed\n\n- Light accent darker.' },
    ])
    const result = changelog.formatRelease(asWrittenByChangesets(intro + '\n' + history, entry), {
      date: '2026-11-02',
    })
    expect(result?.version).toBe('0.8.0')
    expect(result?.changelog).toBe(`# Changelog

What changed, release by release.

\`\`\`json
"registries": { "@coreloom": "${REPO}/releases/download/v0.8.0/{name}.json" }
\`\`\`

## [0.8.0] - 2026-11-02

### Added

- \`Table\` \`virtual\`: many rows,
  only the visible ones.
- \`Chart\`.

### Changed

- Light accent darker.

### Fixed

- \`Select\` keeps focus.

### Upgrading

- B.

## [0.7.0] - 2026-10-30

### Added

- \`MultiSelect\`.

[0.8.0]: ${REPO}/releases/tag/v0.8.0
[0.7.0]: ${REPO}/releases/tag/v0.7.0
`)
  })

  it('writes the first release before the links, or at the end', async () => {
    const entry = await changesetsEntry('0.1.0', [
      { id: 'a', type: 'minor', summary: '### Added\n\n- The registry.' },
    ])
    const result = changelog.formatRelease(asWrittenByChangesets(intro, entry), {
      date: '2026-10-29',
    })
    expect(result?.changelog).toBe(
      `${intro.replace('v0.7.0', 'v0.1.0')}\n## [0.1.0] - 2026-10-29\n\n### Added\n\n- The registry.\n\n[0.1.0]: ${REPO}/releases/tag/v0.1.0\n`,
    )
  })

  it('does nothing when Changesets wrote no entry', () => {
    expect(changelog.formatRelease(intro + '\n' + history)).toBeNull()
  })

  it('refuses an entry written without this changelog module', () => {
    const file = asWrittenByChangesets(intro, '## 0.8.0\n\n### Minor Changes\n\n- abc1234: Thing')
    expect(() => changelog.formatRelease(file)).toThrow(/no end marker/)
  })

  it('refuses a version that already has a section', async () => {
    const entry = await changesetsEntry('0.7.0', [
      { id: 'a', type: 'minor', summary: '### Added\n\n- Again.' },
    ])
    expect(() =>
      changelog.formatRelease(asWrittenByChangesets(intro + '\n' + history, entry)),
    ).toThrow(/already has a \[0\.7\.0\]/)
  })

  it('reads a CHANGELOG with Windows line endings', async () => {
    const entry = await changesetsEntry('0.8.0', [
      { id: 'a', type: 'patch', summary: '### Fixed\r\n\r\n- `Select` keeps focus.\r\n' },
    ])
    const crlf = asWrittenByChangesets(intro + '\n' + history, entry).replace(/\n/g, '\r\n')
    const result = changelog.formatRelease(crlf, { date: '2026-11-02' })
    expect(result?.changelog).toContain(
      '## [0.8.0] - 2026-11-02\n\n### Fixed\n\n- `Select` keeps focus.\n\n## [0.7.0]',
    )
    expect(result?.changelog).not.toContain('\r')
  })

  it('copies code blocks as they are, headings inside them included', async () => {
    const code = '```md\n### Fixed\n\n## Nor this\n```'
    const entry = await changesetsEntry('0.8.0', [
      { id: 'a', type: 'minor', summary: `### Added\n\n- \`Markdown\` renders:\n\n${code}` },
    ])
    const result = changelog.formatRelease(asWrittenByChangesets(intro, entry), {
      date: '2026-11-02',
    })
    expect(result?.changelog).toContain(`### Added\n\n- \`Markdown\` renders:\n\n${code}\n`)
  })

  it('dates releases in Paris', () => {
    expect(changelog.releaseDate(new Date('2026-10-31T23:30:00Z'))).toBe('2026-11-01')
    expect(changelog.releaseDate(new Date('2026-10-31T12:00:00Z'))).toBe('2026-10-31')
  })
})

describe('checkChangesets', () => {
  it('names the files with problems', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'changesets-'))
    fs.writeFileSync(path.join(dir, 'config.json'), '{}')
    fs.writeFileSync(path.join(dir, 'README.md'), '# Changesets\n\n## Anything goes here\n')
    fs.writeFileSync(
      path.join(dir, 'good.md'),
      "---\n'@coreloom/ui': minor\n---\n\n### Added\n\n- x\n",
    )
    fs.writeFileSync(path.join(dir, 'bad.md'), "---\n'@coreloom/ui': patch\n---\n\n## Fixes\n")
    fs.writeFileSync(path.join(dir, 'bare.md'), '### Added\n\n- x\n')
    fs.writeFileSync(
      path.join(dir, 'windows.md'),
      "---\r\n'@coreloom/ui': minor\r\n---\r\n\r\n### Added\r\n",
    )
    const problems = changelog.checkChangesets(dir)
    fs.rmSync(dir, { recursive: true })
    expect([...problems].sort()).toEqual([
      expect.stringMatching(/^bad\.md: "## Fixes" is not a section/),
      expect.stringMatching(/^bare\.md: no front matter/),
    ])
  })
})

describe('releaseNotes', () => {
  const file = intro + '\n' + history

  it('reads a CHANGELOG with Windows line endings', () => {
    const notes = releaseNotes({
      tag: 'v0.7.0',
      packageVersion: '0.7.0',
      changelog: file.replace(/\n/g, '\r\n'),
    })
    expect(notes.startsWith('### Added\n\n- `MultiSelect`.\n\n**Pin')).toBe(true)
  })

  it('prints the section and how to pin the release', () => {
    const notes = releaseNotes({ tag: 'v0.7.0', packageVersion: '0.7.0', changelog: file })
    expect(notes.startsWith('### Added\n\n- `MultiSelect`.\n\n**Pin this release**')).toBe(true)
    expect(notes).toContain(`${REPO}/releases/download/v0.7.0/{name}.json`)
  })

  it('refuses a tag that disagrees with package.json or the CHANGELOG', () => {
    expect(() => releaseNotes({ tag: '0.7', packageVersion: '0.7.0', changelog: file })).toThrow(
      /not a version tag/,
    )
    expect(() => releaseNotes({ tag: 'v0.8.0', packageVersion: '0.7.0', changelog: file })).toThrow(
      /package\.json is at 0\.7\.0/,
    )
    expect(() => releaseNotes({ tag: 'v0.6.0', packageVersion: '0.6.0', changelog: file })).toThrow(
      /no "## \[0\.6\.0\]" section/,
    )
  })
})
