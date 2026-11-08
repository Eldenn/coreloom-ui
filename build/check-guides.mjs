// Checks the guides against the code: every prop a guide names under **The consumer provides** (or
// **`Name` takes**) must exist in the code it documents. A prop renamed or removed fails here instead
// of living on in the docs, in llms-full.txt and in what assistants read before installing an item.
//   node build/check-guides.mjs   (pnpm docs:check, in CI)
// The names are read with the TypeScript compiler from the registry items each guide documents (the
// guide ↔ item mapping of llms.txt). A name passes when it is a prop of one of their components
// (its own or one it passes on to Radix), a field of an object a prop takes, a string value a prop
// accepts, a name the items export (helpers, hooks), an HTML attribute (`alt`), or a prop of another
// component or hook the same paragraph names (`Chat`'s `tools`).
// The other way round, every prop the guide's own component declares in src/ (the component named
// like the guide: Rating.md → Rating) must appear in the guide's code, inline or in a `<Tag props>`
// or a code block. Pass-through props every field has (`className`, `aria-*`, `id`, `name`,
// `disabled`, `placeholder`, `onBlur`…) don't need a word.
// It also checks that experimental items (`meta.stability` in registry.json) say so in their guides.
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'

import { guidesFor, isExperimental } from './gen-llms.mjs'

const root = path.resolve(import.meta.dirname, '..')
const guidesDir = path.join(root, 'stories/guidelines')
const LITERALS = new Set(['true', 'false', 'null', 'undefined'])
const PASS_THROUGH =
  /^(className|\w+ClassName|style|ref|children|id|name|placeholder|disabled|readOnly|required|autoFocus|defaultValue|onBlur|onFocus|aria-.+)$/

/**
 * The passages that list props, with the component each one is about (undefined: the guide's items
 * as a whole). "**The consumer provides** …" starts one; "**`Name` takes** …" starts one, also in the
 * middle of a paragraph.
 */
function propParagraphs(markdown) {
  const passages = []
  for (const block of markdown.split(/\n\s*\n/)) {
    const text = block.trim()
    const provides = /^\*\*The consumer provides:?\*\*/.exec(text)
    const takes = /^\*\*`\w+` takes\*\*/.test(text)
    if (!provides && !takes) continue
    const parts = text.slice(provides ? provides[0].length : 0).split(/\*\*`(\w+)` takes\*\*/)
    if (parts[0].trim()) passages.push({ component: undefined, text: parts[0] })
    for (let i = 1; i < parts.length; i += 2)
      passages.push({ component: parts[i], text: parts[i + 1] })
  }
  return passages
}

/** The code spans of a passage, each with whether it sits inside parentheses or brackets. */
function codeSpans(text) {
  const spans = []
  let depth = 0
  for (const part of text.split(/(`[^`]+`)/)) {
    if (/^`[^`]+`$/.test(part)) {
      spans.push({ code: part.slice(1, -1), nested: depth > 0 })
      continue
    }
    for (const char of part) {
      if ('([{'.includes(char)) depth++
      else if (')]}'.includes(char) && depth > 0) depth--
    }
  }
  return spans
}

/**
 * The prop names a passage claims, in order: code spans outside parentheses, cut to their leading
 * identifier (`onSearch(query)` → onSearch). Left out: what sits in parentheses (values and shapes:
 * `size` (`sm`, `lg`)), attributes (`aria-label`), components (`Toaster`), paths (`field.TextField`),
 * code samples (`action: { … }`, `<Toaster />`), calls with no argument (`toast()`) and literals.
 */
function claimedProps(text) {
  const names = []
  for (const { code, nested } of codeSpans(text)) {
    if (nested || /[:<]/.test(code) || /^[\w$]+\(\)$/.test(code)) continue
    const name = /^[a-z_$][\w$]*/.exec(code)?.[0]
    if (!name || LITERALS.has(name) || /^[\w$]+[-.][\w$]/.test(code)) continue
    if (!names.includes(name)) names.push(name)
  }
  return names
}

/** Every identifier the passage's code spans mention: the components and hooks it refers to. */
function mentioned(text) {
  return codeSpans(text).flatMap(({ code }) => code.match(/[A-Za-z_$][\w$]*/g) ?? [])
}

/**
 * The claims a guide makes that the code doesn't back, as readable lines. `namesOf(component)` gives
 * the names a component (undefined: all the guide's items) backs, or undefined when it doesn't exist;
 * `elsewhere(identifier)` the names of any exported component or hook, for cross-references.
 */
function staleClaims({ guide, passages, namesOf, elsewhere }) {
  const problems = []
  for (const { component, text } of passages) {
    const known = namesOf(component)
    if (!known) {
      problems.push(`${guide}: no exported component \`${component}\` in its items`)
      continue
    }
    const referenced = new Set(mentioned(text).flatMap((name) => [...elsewhere(name)]))
    for (const name of claimedProps(text))
      if (!known.has(name) && !referenced.has(name))
        problems.push(`${guide}: \`${name}\` is not a prop of ${component ?? 'its components'}`)
  }
  return problems
}

/** Every identifier the guide shows as code: inline spans and code blocks. */
function codeIdentifiers(markdown) {
  const blocks = markdown.match(/```[\s\S]*?```/g) ?? []
  const inline = markdown.replace(/```[\s\S]*?```/g, '').match(/`[^`\n]+`/g) ?? []
  return new Set([...blocks, ...inline].flatMap((code) => code.match(/[A-Za-z_$][\w$-]*/g) ?? []))
}

/** The guide's component's own props that the guide never names. */
function undocumentedProps({ guide, markdown, ownProps }) {
  const shown = codeIdentifiers(markdown)
  return ownProps
    .filter((name) => !PASS_THROUGH.test(name) && !shown.has(name))
    .map((name) => `${guide}: prop \`${name}\` of ${guide} is not in the guide`)
}

function createProgram() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile).config
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root)
  return ts.createProgram(parsed.fileNames, parsed.options)
}

/** The types a prop's type is made of: union members, array elements, intersection parts. */
function partsOf(checker, type, depth = 0) {
  if (depth > 3) return []
  if (type.isUnionOrIntersection())
    return type.types.flatMap((part) => partsOf(checker, part, depth + 1))
  if (checker.isArrayType(type) || checker.isTupleType(type))
    return checker.getTypeArguments(type).flatMap((part) => partsOf(checker, part, depth + 1))
  return [type]
}

/** A parameter's names: its properties, their string values and the fields of their objects. */
function namesOfParameter(checker, type, names) {
  for (const part of partsOf(checker, type)) {
    if (part.getCallSignatures().length || !(part.flags & ts.TypeFlags.Object)) continue
    for (const prop of checker.getPropertiesOfType(part)) {
      names.add(prop.name)
      for (const inner of partsOf(
        checker,
        checker.getNonNullableType(checker.getTypeOfSymbol(prop)),
      )) {
        if (inner.isStringLiteral()) names.add(inner.value)
        else if (!inner.getCallSignatures().length && inner.flags & ts.TypeFlags.Object)
          for (const field of checker.getPropertiesOfType(inner)) names.add(field.name)
      }
    }
  }
}

/** The props of a component declared in src/, not those it passes on to Radix or the DOM. */
function declaredIn(checker, props, declaration) {
  const src = path.join(root, 'src')
  return checker
    .getPropertiesOfType(checker.getTypeOfSymbolAtLocation(props, declaration))
    .filter((prop) => prop.declarations?.some((d) => d.getSourceFile().fileName.startsWith(src)))
    .map((prop) => prop.name)
}

/** The names each exported function of a file backs (components and hooks), and all its exports. */
function readModule(checker, source) {
  const functions = new Map()
  const ownProps = new Map()
  const moduleSymbol = checker.getSymbolAtLocation(source)
  const exported = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []
  for (const symbol of exported) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const declaration = target.valueDeclaration ?? target.declarations?.[0]
    if (!declaration) continue
    const signatures = checker.getTypeOfSymbolAtLocation(target, declaration).getCallSignatures()
    if (!signatures.length) continue
    const names = new Set()
    for (const signature of signatures)
      for (const param of signature.getParameters())
        namesOfParameter(checker, checker.getTypeOfSymbolAtLocation(param, declaration), names)
    functions.set(symbol.name, names)
    const [props] = signatures[0].getParameters()
    if (props) ownProps.set(symbol.name, declaredIn(checker, props, declaration))
  }
  return { functions, ownProps, exports: exported.map((symbol) => symbol.name) }
}

/** HTML and SVG attribute names (React's spelling): a guide may tell what to put on the content. */
function htmlAttributes(program, checker) {
  const names = new Set()
  for (const source of program.getSourceFiles()) {
    if (!source.fileName.includes('@types/react/index.d.ts')) continue
    source.forEachChild(function visit(node) {
      if (
        ts.isInterfaceDeclaration(node) &&
        /^(AllHTMLAttributes|SVGAttributes)$/.test(node.name.text)
      )
        for (const prop of checker.getPropertiesOfType(checker.getTypeAtLocation(node)))
          names.add(prop.name)
      else if (ts.isModuleDeclaration(node) || ts.isModuleBlock(node)) node.forEachChild(visit)
    })
  }
  return names
}

const EXPERIMENTAL = '> **Experimental.**'

/**
 * An item's stability (`meta.stability` in registry.json) and its guides agree: an experimental
 * item's guides open with the Experimental note, a stable item's guides don't carry it.
 */
function stabilityProblems(items) {
  const problems = []
  for (const item of items)
    for (const guide of guidesFor(item)) {
      const flagged = fs
        .readFileSync(path.join(guidesDir, `${guide}.md`), 'utf8')
        .includes(EXPERIMENTAL)
      if (isExperimental(item) && !flagged)
        problems.push(`${guide}.md: ${item.name} is experimental, add the "${EXPERIMENTAL}" note`)
      if (!isExperimental(item) && flagged)
        problems.push(`${guide}.md: ${item.name} is stable, remove the "${EXPERIMENTAL}" note`)
    }
  return problems
}

function main() {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
  const program = createProgram()
  const checker = program.getTypeChecker()
  const attributes = htmlAttributes(program, checker)

  // Every exported component and hook of src/, by name, for cross-references.
  const everywhere = new Map()
  const modules = new Map()
  for (const source of program.getSourceFiles()) {
    if (!source.fileName.startsWith(path.join(root, 'src'))) continue
    const module = readModule(checker, source)
    modules.set(source.fileName, module)
    for (const [name, names] of module.functions) everywhere.set(name, names)
  }

  // Guide → the components and exports of the items it documents.
  const byGuide = new Map()
  for (const item of registry.items)
    for (const guide of guidesFor(item)) {
      const entry = byGuide.get(guide) ?? {
        components: new Map(),
        exports: new Set(attributes),
        ownProps: undefined,
      }
      for (const file of item.files ?? []) {
        const module = modules.get(path.join(root, file.path))
        if (!module) continue
        // Hooks count with the components: a guide may list `useAppForm`'s options.
        for (const [name, names] of module.functions)
          if (/^[A-Z]/.test(name)) entry.components.set(name, names)
          else for (const option of names) entry.exports.add(option)
        for (const name of module.exports) entry.exports.add(name)
        entry.ownProps ??= module.ownProps.get(guide)
      }
      byGuide.set(guide, entry)
    }

  const problems = stabilityProblems(registry.items)
  let checked = 0
  for (const [guide, { components, exports, ownProps }] of byGuide) {
    if (!components.size) continue
    const all = new Set([...exports, ...[...components.values()].flatMap((names) => [...names])])
    const namesOf = (component) => {
      if (!component) return all
      const names = components.get(component)
      return names && new Set([...exports, ...names])
    }
    const markdown = fs.readFileSync(path.join(guidesDir, `${guide}.md`), 'utf8')
    const passages = propParagraphs(markdown)
    const elsewhere = (name) => everywhere.get(name) ?? []
    problems.push(...staleClaims({ guide, passages, namesOf, elsewhere }))
    if (ownProps) problems.push(...undocumentedProps({ guide, markdown, ownProps }))
    checked++
  }

  if (problems.length) {
    console.error(`Guides that don't match the code:\n  ${problems.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`Checked the props named in ${checked} guides against the code.`)
}

if (process.argv[1] === import.meta.filename) main()

export { claimedProps, codeIdentifiers, propParagraphs, staleClaims, undocumentedProps }
