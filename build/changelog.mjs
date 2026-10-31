// Coreloom's changelog from Changesets, in the house style: `## [x.y.z] - date`, then Added /
// Changed / Fixed / Upgrading written for people who installed items.
//
// Changesets fixes the shape of what it writes (`## 0.8.0`, then `### Minor Changes` / `### Patch
// Changes`, inserted under the first line) and only lets a changelog module shape each changeset's
// lines. So this file does two things:
//   1. As the `changelog` module in .changeset/config.json, it hands Changesets each changeset's
//      text as written, sections included (no commit hashes, no bullet wrapped around it).
//   2. Run as a script after `changeset version` (`pnpm version-packages` does both), it rewrites
//      that entry: dated heading, the changesets' sections merged in the house order, moved under
//      the intro, with its link and the "pin a release" example updated to the new version.
// `node build/changelog.mjs --check` validates the pending changesets (CI runs it on pull requests).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'https://github.com/Eldenn/coreloom-ui'

// The sections a release can have, in the order they are printed.
const SECTIONS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security', 'Upgrading']

// A changeset without a section heading goes under this one.
const DEFAULT_SECTION = { major: 'Changed', minor: 'Changed', patch: 'Fixed' }

// The headings Changesets writes itself; they are dropped.
const BUMP_HEADING = /^### (Major|Minor|Patch) Changes$/

// Marks which changeset the lines below come from. Changesets reads the files in directory order,
// which differs between file systems; sorting by id makes the entry the same on every machine.
const MARKER = /^<!-- changeset: (\S+) -->$/

// Ends the entry. Changesets writes it under the file's first line, so without this nothing tells
// where its text stops and the intro starts. The dependency line is always rendered last.
const END = '<!-- changesets: end -->'

const VERSION = String.raw`\d+\.\d+\.\d+(?:-[\w.]+)?`

// Files written on Windows (or with core.autocrlf) read the same as the others.
const toLf = (text) => text.replace(/\r\n?/g, '\n')

const FENCE = /^\s*(```|~~~)/

/** Problems in one changeset's text: headings other than `### <Section>`. Empty when it's fine. */
export function checkSummary(summary) {
  const problems = []
  let inCode = false
  for (const line of toLf(summary).split('\n')) {
    if (FENCE.test(line)) inCode = !inCode
    if (inCode || !/^#{1,6}\s/.test(line)) continue
    const match = /^### (.+?)\s*$/.exec(line)
    if (!match || !SECTIONS.includes(match[1]))
      problems.push(`"${line.trim()}" is not a section; use ### ${SECTIONS.join(' / ')}.`)
  }
  return problems
}

/** A changeset's text with its first section heading made explicit. Throws on unknown headings. */
export function normalizeSummary(summary, type) {
  const text = toLf(summary).trim()
  const problems = checkSummary(text)
  if (problems.length > 0) throw new Error(problems.join('\n'))
  if (!text) return ''
  return text.startsWith('### ') ? text : `### ${DEFAULT_SECTION[type] ?? 'Changed'}\n\n${text}`
}

/** Changesets' changelog API. */
function getReleaseLine(changeset, type) {
  try {
    const text = normalizeSummary(changeset.summary, type)
    return Promise.resolve(text ? `\n\n<!-- changeset: ${changeset.id} -->\n${text}\n` : '')
  } catch (error) {
    return Promise.reject(
      new Error(`.changeset/${changeset.id}.md: ${error instanceof Error ? error.message : ''}`),
    )
  }
}

// One package, no internal dependencies to report: this line only closes the entry.
function getDependencyReleaseLine() {
  return Promise.resolve(END)
}

/** A date as YYYY-MM-DD in Paris, where the project lives. */
export function releaseDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(date)
}

const isListItem = (line) => /^[-*] /.test(line)

/** Joins the parts several changesets wrote under one section: lists run on as one list. */
function joinParts(parts) {
  return parts.reduce((body, part) => {
    if (!body) return part
    const last = body.split('\n').at(-1) ?? ''
    const continuesList = isListItem(part) && (isListItem(last) || /^\s+\S/.test(last))
    return `${body}${continuesList ? '\n' : '\n\n'}${part}`
  }, '')
}

/** Merges an entry's lines into its sections, in the house order. */
function mergeSections(lines, version) {
  // Section name -> the parts written under it, one per heading met (each changeset starts with one).
  const sections = new Map()
  let id = ''
  let part
  let inCode = false
  for (const line of lines) {
    // Code blocks are copied as they are: a "### " line inside one is not a heading.
    if (FENCE.test(line)) inCode = !inCode
    if (inCode || FENCE.test(line)) {
      if (!part) throw new Error(`The ${version} entry has a code block outside a section.`)
      part.lines.push(line)
      continue
    }
    if (BUMP_HEADING.test(line)) continue
    const marker = MARKER.exec(line.trim())
    if (marker) {
      id = marker[1]
      part = undefined
      continue
    }
    const heading = /^### (.+?)\s*$/.exec(line)
    if (heading && SECTIONS.includes(heading[1])) {
      part = { id, lines: [] }
      sections.set(heading[1], [...(sections.get(heading[1]) ?? []), part])
      continue
    }
    if (!line.trim()) {
      part?.lines.push(line)
      continue
    }
    if (!part) throw new Error(`The ${version} entry has text outside a section: "${line}".`)
    part.lines.push(line)
  }
  const blocks = SECTIONS.filter((name) => sections.has(name))
    .map((name) => {
      const parts = sections
        .get(name)
        .toSorted((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        .map((p) => p.lines.join('\n').trim())
        .filter(Boolean)
      return parts.length > 0 ? `### ${name}\n\n${joinParts(parts)}` : ''
    })
    .filter(Boolean)
  if (blocks.length === 0) throw new Error(`The ${version} entry is empty.`)
  return blocks.join('\n\n')
}

/**
 * Rewrites the entry `changeset version` just wrote into the house style. Returns the new
 * changelog and the version, or null when there is no Changesets entry to rewrite.
 */
export function formatRelease(file, { date = releaseDate() } = {}) {
  const changelog = toLf(file)
  const heading = new RegExp(`^## (${VERSION})[ \\t]*$`, 'm')
  const match = heading.exec(changelog)
  if (!match) return null
  const version = match[1]

  const start = match.index
  const afterHeading = start + match[0].length
  const close = changelog.indexOf(END, afterHeading)
  if (close === -1)
    throw new Error(
      `The ${version} entry has no end marker: run \`pnpm version-packages\` with build/changelog.mjs as the changelog module.`,
    )
  const end = close + END.length
  const entryLines = changelog.slice(afterHeading, close).split('\n')
  const entry = `## [${version}] - ${date}\n\n${mergeSections(entryLines, version)}\n`

  let rest = changelog.slice(0, start) + changelog.slice(end)
  if (new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm').test(rest))
    throw new Error(`CHANGELOG.md already has a [${version}] section.`)

  // Under the intro: before the newest release, or before the links when there is none yet.
  const firstRelease = rest.search(/^## \[/m)
  const firstLink = rest.search(/^\[[^\]]+\]: /m)
  const at = firstRelease !== -1 ? firstRelease : firstLink !== -1 ? firstLink : rest.length
  const intro = rest
    .slice(0, at)
    .replace(
      new RegExp(`(/releases/download/)v${VERSION}(/)`, 'g'),
      (_, before, after) => `${before}v${version}${after}`,
    )
  rest = `${intro.trimEnd()}\n\n${entry}\n${rest.slice(at).trimStart()}`

  // The version's link, first among the links (they run newest first).
  const link = `[${version}]: ${REPO}/releases/tag/v${version}`
  if (!rest.includes(`\n[${version}]: `)) {
    const links = rest.search(/^\[[^\]]+\]: /m)
    rest =
      links === -1
        ? `${rest.trimEnd()}\n\n${link}\n`
        : `${rest.slice(0, links)}${link}\n${rest.slice(links)}`
  }
  return { changelog: rest.replace(/\n{3,}/g, '\n\n'), version }
}

/** Problems in the pending changeset files (.changeset/*.md), by file. */
export function checkChangesets(dir) {
  const problems = []
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md')) {
    const text = toLf(fs.readFileSync(path.join(dir, name), 'utf8'))
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, '')
    if (body === text)
      problems.push(`${name}: no front matter ("---" / '@coreloom/ui': minor / "---").`)
    for (const problem of checkSummary(body)) problems.push(`${name}: ${problem}`)
  }
  return problems
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(import.meta.dirname, '..')
  if (process.argv.includes('--check')) {
    const problems = checkChangesets(path.join(root, '.changeset'))
    if (problems.length > 0) {
      console.error(problems.join('\n'))
      process.exit(1)
    }
    console.log('Changesets: every pending entry uses the CHANGELOG sections.')
  } else {
    const file = path.join(root, 'CHANGELOG.md')
    const result = formatRelease(fs.readFileSync(file, 'utf8'))
    if (!result) {
      console.log('CHANGELOG.md has no new Changesets entry to format.')
    } else {
      const prettier = await import('prettier')
      const options = (await prettier.resolveConfig(file)) ?? {}
      fs.writeFileSync(
        file,
        await prettier.format(result.changelog, { ...options, filepath: file }),
      )
      console.log(`CHANGELOG.md: ${result.version} written in the house style.`)
    }
  }
}

export default { getReleaseLine, getDependencyReleaseLine }
