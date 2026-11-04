// Coreloom UI — Mermaid text for UML diagrams. `parseMermaid` reads the subset of Mermaid that
// covers class, sequence, state, entity–relationship and C4 diagrams into Coreloom's UML model,
// tolerantly: what it can't read becomes a problem on its line and the rest still draws.
// `toMermaid` writes a diagram back (positions people dragged stay in the JSON only).
// No `mermaid` dependency: the parsers are plain functions, and nothing is rendered as HTML.
import type { UmlParseResult, UmlSpec } from '@/lib/uml'
import { c4Level, c4ToMermaid, parseC4Diagram } from '@/lib/uml-mermaid-c4'
import { classToMermaid, parseClassDiagram } from '@/lib/uml-mermaid-class'
import { erToMermaid, parseErDiagram } from '@/lib/uml-mermaid-er'
import { parseSequenceDiagram, sequenceToMermaid } from '@/lib/uml-mermaid-sequence'
import { parseStateDiagram, stateToMermaid } from '@/lib/uml-mermaid-state'
import { frontMatter, sourceLines } from '@/lib/uml-text'

/** Reads Mermaid text whose first line names one of the supported diagram types. */
function parseMermaid(input: string): UmlParseResult {
  const { title, body } = frontMatter(input)
  const all = sourceLines(body)
  const header = all.at(0)
  const lines = all.slice(1)
  if (!header) return { diagram: null, problems: [{ line: 0, severity: 'error', code: 'empty' }] }
  const word = header.text.split(/\s+/)[0] ?? ''
  switch (word) {
    case 'classDiagram':
    case 'classDiagram-v2':
      return parseClassDiagram(lines, title)
    case 'stateDiagram':
    case 'stateDiagram-v2':
      return parseStateDiagram(lines, title)
    case 'erDiagram':
      return parseErDiagram(lines, title)
    case 'sequenceDiagram':
      return parseSequenceDiagram(lines, title)
  }
  const level = c4Level(word)
  if (level) return parseC4Diagram(level, lines, title)
  return {
    diagram: null,
    problems: [{ line: header.no, severity: 'error', code: 'header', text: header.text }],
  }
}

/** The diagram as Mermaid text. */
function toMermaid(diagram: UmlSpec): string {
  switch (diagram.kind) {
    case 'class':
      return classToMermaid(diagram)
    case 'state':
      return stateToMermaid(diagram)
    case 'er':
      return erToMermaid(diagram)
    case 'sequence':
      return sequenceToMermaid(diagram)
    case 'c4':
      return c4ToMermaid(diagram)
  }
}

export { parseMermaid, toMermaid }
