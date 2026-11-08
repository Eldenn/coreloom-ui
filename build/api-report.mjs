// The public API of every registry item, written to api/<item>.api.md so a pull request shows what an
// item's API gains or loses, and CI can hold stable items to VERSIONING.md.
//   node build/api-report.mjs                  write api/ (pnpm api:report, after an intended change)
//   node build/api-report.mjs --check          fail when api/ doesn't match the code (pnpm api:check)
//   node build/api-report.mjs --check --since=origin/main
//                                              also fail when a stable item loses an export or a prop,
//                                              or a component of one gains a required prop, without a
//                                              pending major changeset (CI, on pull requests)
// Each line is one name and its type: an export (`function Button`, `type ButtonProps = …`), or a
// member of one (`Button.size?: "default" | "sm" | "lg"`), with `Button.*` naming the packages whose
// props a component passes on (React's DOM props, Radix). Objects written inline are expanded, so a
// removed i18n message key or a removed field of a prop shows too. `@deprecated` names say so.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { isExperimental } from './gen-llms.mjs'

const root = path.resolve(import.meta.dirname, '..')
const API_DIR = path.join(root, 'api')
const SRC = path.join(root, 'src') + path.sep
const FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
  ts.TypeFormatFlags.WriteArrowStyleSignature
const MAX_DEPTH = 4

// --- Reading the code ------------------------------------------------------------------------------

function createProgram() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile).config
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root)
  return ts.createProgram(parsed.fileNames, parsed.options)
}

/** The package a declaration comes from: "react" for @types/react, "src" for this repository. */
function packageOf(declaration) {
  const file = declaration.getSourceFile().fileName
  if (file.startsWith(SRC)) return 'src'
  const match = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/.exec(file)
  return match ? match[1].replace(/^@types\//, '') : path.relative(root, file)
}

const resolve = (checker, symbol) =>
  symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol

const isDeprecated = (symbol) =>
  symbol.getJsDocTags().some((tag) => tag.name === 'deprecated') ? ' // deprecated' : ''

/** An object type written inline (`{ a: string }`), not a named one, an array or a function. */
function isInlineObject(type) {
  return (
    type.flags & ts.TypeFlags.Object &&
    type.objectFlags & ts.ObjectFlags.Anonymous &&
    !type.getCallSignatures().length &&
    !type.getConstructSignatures().length &&
    type.getProperties().length > 0
  )
}

/**
 * Prints types. TypeScript writes an alias of an inline object (`type Messages = typeof en`) as the
 * whole object wherever it is used, so those are put back by name: the object is listed once.
 */
function typePrinter(checker, aliases) {
  const byType = new Map(aliases.map(({ type, name }) => [type, name]))
  const shorten = (text) => {
    for (const { body, name } of aliases)
      if (text.includes(body)) text = text.split(body).join(name)
    return text
  }
  return (type, at) => byType.get(type) ?? shorten(checker.typeToString(type, at, FLAGS))
}

/** Exported aliases of inline objects in src/, with their printed body (the longest first). */
function inlineAliases(program, checker) {
  const aliases = []
  for (const source of program.getSourceFiles()) {
    if (!source.fileName.startsWith(SRC)) continue
    const moduleSymbol = checker.getSymbolAtLocation(source)
    for (const exported of moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []) {
      const symbol = resolve(checker, exported)
      if (!(symbol.flags & ts.SymbolFlags.TypeAlias)) continue
      const type = checker.getDeclaredTypeOfSymbol(symbol)
      const body = checker.typeToString(type, symbol.declarations?.[0], FLAGS)
      if (isInlineObject(type) && body.length > 80) aliases.push({ type, body, name: symbol.name })
    }
  }
  return aliases.sort((a, b) => b.body.length - a.body.length)
}

/** `prefix.name?: type` lines for the members of an object type, inline objects expanded. */
function memberLines({ checker, print, type, prefix, at, depth = 0, onlySrc = false }) {
  const lines = []
  const inherited = new Set()
  for (const prop of checker.getPropertiesOfType(type)) {
    const declarations = prop.declarations ?? []
    if (onlySrc && !declarations.some((d) => packageOf(d) === 'src')) {
      for (const d of declarations) inherited.add(packageOf(d))
      continue
    }
    const optional = prop.flags & ts.SymbolFlags.Optional ? '?' : ''
    const propType = checker.getTypeOfSymbolAtLocation(prop, at)
    const name = `${prefix}.${prop.name}`
    const inner = checker.getNonNullableType(propType)
    if (depth < MAX_DEPTH && isInlineObject(inner)) {
      lines.push(`${name}${optional}: {}${isDeprecated(prop)}`)
      lines.push(
        ...memberLines({ checker, print, type: inner, prefix: name, at, depth: depth + 1 }),
      )
    } else lines.push(`${name}${optional}: ${print(propType, at)}${isDeprecated(prop)}`)
  }
  if (inherited.size) lines.push(`${prefix}.*: ${[...inherited].sort().join(' | ')}`)
  return lines
}

/** The lines of a function export: a component's props one per line, a hook's signature whole. */
function functionLines({ checker, print, name, type, at, deprecated }) {
  const signatures = type.getCallSignatures()
  const [props] = signatures[0].getParameters()
  if (!/^[A-Z]/.test(name) || signatures.length > 1 || !props)
    return signatures.map(
      (signature) =>
        `function ${name}${checker.signatureToString(signature, at, FLAGS)}${deprecated}`,
    )
  const propsType = checker.getTypeOfSymbolAtLocation(props, at)
  return [
    `function ${name}${deprecated}`,
    ...memberLines({ checker, print, type: propsType, prefix: name, at, onlySrc: true }),
  ]
}

/** The lines of one export of a module. */
function exportLines({ checker, print }, symbol) {
  const target = resolve(checker, symbol)
  const at = target.valueDeclaration ?? target.declarations?.[0]
  if (!at) return []
  const params = at.typeParameters?.map((param) => param.getText()).join(', ')
  const name = symbol.name
  const typeName = params ? `${name}<${params}>` : name
  const deprecated = isDeprecated(target)
  const lines = []
  if (target.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
    const type = checker.getDeclaredTypeOfSymbol(target)
    if (target.flags & ts.SymbolFlags.Interface || isInlineObject(type)) {
      lines.push(`type ${typeName} = {}${deprecated}`)
      lines.push(...memberLines({ checker, print, type, prefix: name, at, onlySrc: true }))
    } else {
      const text = checker.typeToString(type, at, FLAGS | ts.TypeFormatFlags.InTypeAlias)
      lines.push(`type ${typeName} = ${text}${deprecated}`)
    }
  }
  if (target.flags & ts.SymbolFlags.Value) {
    const type = checker.getTypeOfSymbolAtLocation(target, at)
    if (type.getCallSignatures().length)
      lines.push(...functionLines({ checker, print, name, type, at, deprecated }))
    else if (isInlineObject(type) && print(type, at).startsWith('{')) {
      lines.push(`const ${name}: {}${deprecated}`)
      lines.push(...memberLines({ checker, print, type, prefix: name, at }))
    } else lines.push(`const ${name}: ${print(type, at)}${deprecated}`)
  }
  return lines
}

/** Every item's report, by item name. */
function generate() {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
  const program = createProgram()
  const checker = program.getTypeChecker()
  const context = { checker, print: typePrinter(checker, inlineAliases(program, checker)) }
  const reports = new Map()
  for (const item of registry.items) {
    const sections = []
    for (const file of item.files ?? []) {
      if (!/\.tsx?$/.test(file.path)) continue
      const source = program.getSourceFile(path.join(root, file.path))
      const moduleSymbol = source && checker.getSymbolAtLocation(source)
      if (!moduleSymbol) continue
      const lines = checker
        .getExportsOfModule(moduleSymbol)
        .flatMap((symbol) => exportLines(context, symbol))
      if (lines.length) sections.push({ file: file.path, lines })
    }
    if (sections.length) reports.set(item.name, renderReport({ item, sections }))
  }
  return { reports, items: registry.items }
}

// --- The report as text, and comparing two of them ------------------------------------------------

function renderReport({ item, sections }) {
  const stability = isExperimental(item) ? 'experimental' : 'stable'
  const body = sections.map(
    ({ file, lines }) => `## ${file}\n\n\`\`\`ts\n${lines.join('\n')}\n\`\`\``,
  )
  return [
    `# @coreloom/${item.name}`,
    '',
    `Stability: ${stability}. Written by \`pnpm api:report\` from the code; don't edit it by hand.`,
    '',
    ...body.flatMap((section) => [section, '']),
  ].join('\n')
}

/** A report's names and their types: "Button.size" → "?: 'sm' | 'lg'". */
function parseReport(text) {
  const entries = new Map()
  for (const line of text.split('\n')) {
    const head = /^(function|type|const) ([\w$]+)(.*)$/.exec(line)
    const member = /^([\w$]+(?:\.[\w$*-]+)+)(\??: .*)$/.exec(line)
    if (head) entries.set(head[2], `${head[1]}${head[3]}`)
    else if (member) entries.set(member[1], member[2])
  }
  return entries
}

/** A required prop of a component: `Button.size: …` (no `?`) under a `function Button` line. */
function isRequiredProp(entries, key) {
  const [owner, ...members] = key.split('.')
  return (
    entries.get(owner)?.startsWith('function') === true &&
    members.length === 1 &&
    members[0] !== '*' &&
    !entries.get(key)?.startsWith('?')
  )
}

/**
 * What changed between two reports of one item: names added, removed and retyped, and the changes
 * a stable item may only make in a major (a name removed, a required prop added to a component).
 */
function compareReports({ before, after, stable }) {
  const old = parseReport(before)
  const next = parseReport(after)
  const added = [...next.keys()].filter((key) => !old.has(key))
  const removed = [...old.keys()].filter((key) => !next.has(key))
  const changed = [...next.keys()].filter((key) => old.has(key) && old.get(key) !== next.get(key))
  const breaking = !stable
    ? []
    : [
        ...removed.map((key) => `${key} removed`),
        ...added
          .filter((key) => isRequiredProp(next, key) && old.has(key.split('.')[0]))
          .map((key) => `${key} added as a required prop`),
        ...changed
          .filter((key) => old.get(key)?.startsWith('?') && isRequiredProp(next, key))
          .map((key) => `${key} became required`),
      ]
  return { added, removed, changed, breaking }
}

/** Whether a pending changeset bumps the package's major. */
function hasMajorChangeset(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .some((file) => {
      const frontmatter = /^---\r?\n([^]*?)\r?\n---/.exec(
        fs.readFileSync(path.join(dir, file), 'utf8'),
      )
      return frontmatter !== null && /:\s*['"]?major['"]?\s*$/m.test(frontmatter[1])
    })
}

// --- Commands -------------------------------------------------------------------------------------

function write(reports) {
  fs.rmSync(API_DIR, { recursive: true, force: true })
  fs.mkdirSync(API_DIR)
  for (const [name, text] of reports) fs.writeFileSync(path.join(API_DIR, `${name}.api.md`), text)
  console.log(`Wrote the API of ${reports.size} items to api/.`)
}

/** The problems between api/ on disk and the code. */
function driftProblems(reports) {
  const problems = []
  const onDisk = fs.existsSync(API_DIR) ? fs.readdirSync(API_DIR) : []
  for (const [name, text] of reports) {
    const file = path.join(API_DIR, `${name}.api.md`)
    if (!fs.existsSync(file)) problems.push(`api/${name}.api.md is missing`)
    else if (fs.readFileSync(file, 'utf8') !== text) {
      const { added, removed, changed } = compareReports({
        before: fs.readFileSync(file, 'utf8'),
        after: text,
        stable: false,
      })
      const what = [
        ...added.map((k) => `+${k}`),
        ...removed.map((k) => `-${k}`),
        ...changed.map((k) => `~${k}`),
      ]
      problems.push(`api/${name}.api.md is out of date: ${what.slice(0, 8).join(', ') || 'layout'}`)
    }
  }
  for (const file of onDisk)
    if (!reports.has(file.replace(/\.api\.md$/, '')))
      problems.push(`api/${file} has no item any more`)
  return problems
}

/** The breaking changes to stable items since a git ref, from the reports committed there. */
function breakingSince({ reports, items, ref }) {
  const stable = new Set(items.filter((item) => !isExperimental(item)).map((item) => item.name))
  const breaking = []
  for (const name of stable) {
    let before
    try {
      before = execFileSync('git', ['show', `${ref}:api/${name}.api.md`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    } catch {
      continue // new item, or no report at that ref yet
    }
    const after = reports.get(name) ?? ''
    for (const change of compareReports({ before, after, stable: true }).breaking)
      breaking.push(`@coreloom/${name}: ${change}`)
  }
  return breaking
}

function main() {
  const args = process.argv.slice(2)
  const { reports, items } = generate()
  if (!args.includes('--check')) return write(reports)

  const problems = driftProblems(reports).map((problem) => `${problem} (run pnpm api:report)`)
  const since = args.find((arg) => arg.startsWith('--since='))?.slice('--since='.length)
  if (since && !hasMajorChangeset(path.join(root, '.changeset')))
    problems.push(
      ...breakingSince({ reports, items, ref: since }).map(
        (change) =>
          `${change}. A stable item keeps its API until the next major (VERSIONING.md): ` +
          'deprecate instead of removing, make a new prop optional, or add a major changeset.',
      ),
    )
  if (problems.length) {
    console.error(`The API report doesn't match:\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`The API of ${reports.size} items matches api/.`)
}

if (process.argv[1] === import.meta.filename) main()

export { compareReports, hasMajorChangeset, parseReport }
