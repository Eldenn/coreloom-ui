// Coreloom UI — UML diagrams as boxes and lines. Turns a class, state, ER or C4 diagram into one
// neutral graph (nodes with a shape, a title, compartments; edges with markers at either end) that
// a single canvas draws, and sizes each node from its text so the layout is known before render.
// Edges point the way the layout flows: parents, wholes and callers come first.
import type {
  C4Diagram,
  C4ElementKind,
  ClassDiagram,
  ClassMember,
  ClassRelationKind,
  ErCardinality,
  ErDiagram,
  StateDiagram,
  UmlDirection,
  UmlNote,
  UmlSpec,
} from '@/lib/uml'

type DiagramShape =
  'box' | 'rounded' | 'person' | 'start' | 'end' | 'choice' | 'bar' | 'note' | 'frame'

/** The look of a box: plain, the system in focus (C4), or something outside it. */
type DiagramTone = 'default' | 'primary' | 'external'

type DiagramMarker =
  | 'triangle'
  | 'diamond'
  | 'diamondFilled'
  | 'arrow'
  | 'arrowFilled'
  | 'one'
  | 'zeroOrOne'
  | 'oneOrMore'
  | 'zeroOrMore'

/** A line in a compartment: `+ name: String`, or `PK id string`. */
interface DiagramRow {
  text: string
  /** A narrow column before the text: visibility sign, PK/FK. */
  prefix?: string
  /** Muted, after the text: an ER attribute's type. */
  suffix?: string
  underline?: boolean
  italic?: boolean
}

/** What the box stands for, which the UI names in the reader's language. */
type DiagramRole =
  | 'class'
  | 'note'
  | 'namespace'
  | 'state'
  | 'composite'
  | 'start'
  | 'end'
  | 'choice'
  | 'fork'
  | 'join'
  | 'entity'
  | C4ElementKind
  | 'boundary'

interface DiagramNode {
  id: string
  parent?: string
  shape: DiagramShape
  role: DiagramRole
  title: string
  /** Shown above the title in guillemets: «interface». */
  stereotype?: string
  /** C4: the technology, after the kind: [Container: React]. */
  technology?: string
  /** C4: drawn as a database or a queue. */
  variant?: 'database' | 'queue'
  italicTitle?: boolean
  body?: string
  compartments?: DiagramRow[][]
  tone?: DiagramTone
  width: number
  height: number
}

/** What a line means, for the words a screen reader hears. */
type DiagramRelation = ClassRelationKind | 'note' | 'transition' | 'er' | 'c4'

interface DiagramEdge {
  id: string
  source: string
  target: string
  /** The ends as the model has them (`from` → `to`), whichever way the line was laid out. */
  from: string
  to: string
  relation: DiagramRelation
  dashed?: boolean
  sourceMarker?: DiagramMarker
  targetMarker?: DiagramMarker
  label?: string
  /** Multiplicities or cardinalities by each end. */
  sourceLabel?: string
  targetLabel?: string
  /** ER: the cardinalities in words, at `from` and at `to`. */
  cardinality?: [ErCardinality, ErCardinality]
  /** C4: the technology, in brackets under the label. */
  technology?: string
}

interface DiagramGraph {
  direction: UmlDirection
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

// Sizes, matching the canvas's type scale (13px titles, 12px mono rows).
const CHAR = 7.4
const MONO = 7.25
const ROW = 20
const PAD_X = 28
const MIN_W = 120
const MAX_W = 300
const HEAD = 40
const EYEBROW = 16
const COMPARTMENT_PAD = 10
const BODY_LINE = 17

const textWidth = (text: string, char = CHAR) =>
  Math.max(0, ...text.split('\n').map((l) => l.length)) * char

/** How many lines `text` takes at `width`, wrapping at about the same place the browser does. */
function wrappedLines(text: string, width: number): number {
  const perLine = Math.max(8, Math.floor((width - PAD_X) / 6.6))
  return text.split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / perLine)), 0)
}

const C4_ROLES: ReadonlySet<DiagramRole> = new Set(['person', 'system', 'container', 'component'])

/** The longest line above a title: «stereotype», or a C4 kind with its technology. */
function eyebrowLength(node: Omit<DiagramNode, 'width' | 'height'>): number {
  if (node.stereotype) return node.stereotype.length + 2
  // "[Software System · External]", "[Container: PostgreSQL]".
  if (C4_ROLES.has(node.role))
    return 18 + (node.technology?.length ?? 0) + (node.tone === 'external' ? 11 : 0)
  return 0
}

function sizeBox(node: Omit<DiagramNode, 'width' | 'height'>, minWidth = MIN_W) {
  const rows = (node.compartments ?? []).flat()
  // Keys (PK, FK) get one column wide enough for all of them.
  const prefixed = rows.some((r) => r.prefix)
  let keyColumn = prefixed ? MONO + 8 : 0
  if (prefixed && node.role === 'entity') keyColumn = 3.2 * 12 + 8
  const rowWidth = (r: DiagramRow) =>
    keyColumn + textWidth(r.text, MONO) + (r.suffix ? r.suffix.length * MONO + 8 : 0)
  const eyebrow = eyebrowLength(node)
  const width = Math.min(
    MAX_W,
    Math.max(
      minWidth,
      textWidth(node.title) + PAD_X,
      eyebrow ? eyebrow * 6.5 + PAD_X + (node.variant ? 16 : 0) : 0,
      ...rows.map((r) => rowWidth(r) + PAD_X + 4),
    ),
  )
  let height = HEAD + (eyebrow ? EYEBROW : 0)
  for (const c of node.compartments ?? []) height += Math.max(1, c.length) * ROW + COMPARTMENT_PAD
  if (node.body) height += wrappedLines(node.body, width) * BODY_LINE + 8
  if (node.shape === 'person') height += 22
  return { ...node, width: Math.ceil(width), height: Math.ceil(height) }
}

function noteNodes(
  notes: readonly UmlNote[] | undefined,
  parentOf: (id: string) => string | undefined,
) {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  ;(notes ?? []).forEach((note, i) => {
    const id = `note:${String(i)}`
    const parent = note.for ? parentOf(note.for) : undefined
    const width = Math.min(240, Math.max(140, textWidth(note.text, 6.6) + PAD_X))
    nodes.push({
      id,
      shape: 'note',
      role: 'note',
      title: '',
      body: note.text,
      ...(parent ? { parent } : {}),
      width,
      height: wrappedLines(note.text, width) * BODY_LINE + 24,
    })
    if (note.for)
      edges.push({
        id: `${id}->${note.for}`,
        source: id,
        target: note.for,
        from: id,
        to: note.for,
        relation: 'note',
        dashed: true,
      })
  })
  return { nodes, edges }
}

// ── Class ───────────────────────────────────────────────────────────────────────────────────────

const SIGN = { public: '+', private: '-', protected: '#', package: '~' } as const

const memberRow = (m: ClassMember): DiagramRow => ({
  text: m.text,
  ...(m.visibility ? { prefix: SIGN[m.visibility] } : {}),
  ...(m.static ? { underline: true } : {}),
  ...(m.abstract ? { italic: true } : {}),
})

/** Markers and orientation per relation: hierarchy kinds start from `to` (parent, whole). */
const CLASS_EDGES: Record<
  ClassRelationKind,
  { fromTo: boolean; marker?: DiagramMarker; dashed?: boolean }
> = {
  inheritance: { fromTo: false, marker: 'triangle' },
  realization: { fromTo: false, marker: 'triangle', dashed: true },
  composition: { fromTo: false, marker: 'diamondFilled' },
  aggregation: { fromTo: false, marker: 'diamond' },
  association: { fromTo: true, marker: 'arrow' },
  dependency: { fromTo: true, marker: 'arrow', dashed: true },
  link: { fromTo: true },
  dashedLink: { fromTo: true, dashed: true },
}

function classGraph(d: ClassDiagram): DiagramGraph {
  const namespaces = [...new Set(d.classes.flatMap((c) => (c.namespace ? [c.namespace] : [])))]
  const nodes: DiagramNode[] = namespaces.map((ns) =>
    sizeBox({ id: `namespace:${ns}`, shape: 'frame', role: 'namespace', title: ns }),
  )
  for (const c of d.classes) {
    const attributes = (c.attributes ?? []).map(memberRow)
    const methods = (c.methods ?? []).map(memberRow)
    const abstract = c.stereotype?.toLowerCase() === 'abstract'
    nodes.push(
      sizeBox(
        {
          id: c.id,
          shape: 'box',
          role: 'class',
          title: `${c.label ?? c.id}${c.generic ? `<${c.generic}>` : ''}`,
          ...(c.stereotype ? { stereotype: c.stereotype } : {}),
          ...(abstract ? { italicTitle: true } : {}),
          ...(attributes.length || methods.length ? { compartments: [attributes, methods] } : {}),
          ...(c.namespace ? { parent: `namespace:${c.namespace}` } : {}),
        },
        140,
      ),
    )
  }
  const edges = d.relations.map((r, i): DiagramEdge => {
    const look = CLASS_EDGES[r.kind]
    const [source, target] = look.fromTo ? [r.from, r.to] : [r.to, r.from]
    const [sourceLabel, targetLabel] = look.fromTo
      ? [r.fromCardinality, r.toCardinality]
      : [r.toCardinality, r.fromCardinality]
    return {
      id: `r${String(i)}`,
      source,
      target,
      from: r.from,
      to: r.to,
      relation: r.kind,
      ...(look.dashed ? { dashed: true } : {}),
      ...(look.marker ? { [look.fromTo ? 'targetMarker' : 'sourceMarker']: look.marker } : {}),
      ...(r.label ? { label: r.label } : {}),
      ...(sourceLabel ? { sourceLabel } : {}),
      ...(targetLabel ? { targetLabel } : {}),
    }
  })
  const parentOf = (id: string) => nodes.find((n) => n.id === id)?.parent
  const notes = noteNodes(d.notes, parentOf)
  return {
    direction: d.direction ?? 'TB',
    nodes: [...nodes, ...notes.nodes],
    edges: [...edges, ...notes.edges],
  }
}

// ── State ───────────────────────────────────────────────────────────────────────────────────────

const pseudo = (kind: 'start' | 'end', scope: string | undefined) => `[*]${kind}:${scope ?? ''}`

function stateNode(d: StateDiagram, s: StateDiagram['states'][number]): DiagramNode {
  const parent = s.parent ? { parent: s.parent } : {}
  const title = s.label ?? s.id
  const horizontal = d.direction === 'LR' || d.direction === 'RL'
  switch (s.kind) {
    case 'choice':
      return { id: s.id, shape: 'choice', role: 'choice', title, width: 30, height: 30, ...parent }
    case 'fork':
    case 'join':
      return {
        id: s.id,
        shape: 'bar',
        role: s.kind,
        title,
        width: horizontal ? 8 : 90,
        height: horizontal ? 90 : 8,
        ...parent,
      }
    default: {
      const composite = d.states.some((c) => c.parent === s.id)
      return sizeBox({
        id: s.id,
        shape: composite ? 'frame' : 'rounded',
        role: composite ? 'composite' : 'state',
        title,
        ...(s.description && !composite ? { body: s.description } : {}),
        ...parent,
      })
    }
  }
}

function stateGraph(d: StateDiagram): DiagramGraph {
  const nodes = d.states.map((s) => stateNode(d, s))
  const used = new Map<string, DiagramNode>()
  const end = (id: string, kind: 'start' | 'end', scope: string | undefined) => {
    if (id !== '[*]') return id
    const key = pseudo(kind, scope)
    if (!used.has(key)) {
      used.set(key, {
        id: key,
        shape: kind,
        role: kind,
        title: '',
        width: 22,
        height: 22,
        ...(scope ? { parent: scope } : {}),
      })
    }
    return key
  }
  const edges = d.transitions.map((t, i): DiagramEdge => {
    const source = end(t.from, 'start', t.parent)
    const target = end(t.to, 'end', t.parent)
    return {
      id: `t${String(i)}`,
      source,
      target,
      from: source,
      to: target,
      relation: 'transition',
      targetMarker: 'arrow',
      ...(t.label ? { label: t.label } : {}),
    }
  })
  const all = [...used.values(), ...nodes]
  const notes = noteNodes(d.notes, (id) => all.find((n) => n.id === id)?.parent)
  return {
    direction: d.direction ?? 'TB',
    nodes: [...all, ...notes.nodes],
    edges: [...edges, ...notes.edges],
  }
}

// ── ER ──────────────────────────────────────────────────────────────────────────────────────────

const CROW: Record<ErCardinality, DiagramMarker> = {
  zeroOrOne: 'zeroOrOne',
  exactlyOne: 'one',
  zeroOrMore: 'zeroOrMore',
  oneOrMore: 'oneOrMore',
}

function erGraph(d: ErDiagram): DiagramGraph {
  const nodes = d.entities.map((e) =>
    sizeBox(
      {
        id: e.id,
        shape: 'box',
        role: 'entity',
        title: e.label ?? e.id,
        ...(e.attributes?.length
          ? {
              compartments: [
                e.attributes.map((a) => ({
                  text: a.name,
                  suffix: a.type,
                  ...(a.keys?.length ? { prefix: a.keys.join(',') } : {}),
                })),
              ],
            }
          : {}),
      },
      150,
    ),
  )
  const edges = d.relations.map((r, i): DiagramEdge => ({
    id: `e${String(i)}`,
    source: r.from,
    target: r.to,
    from: r.from,
    to: r.to,
    relation: 'er',
    sourceMarker: CROW[r.fromCardinality],
    targetMarker: CROW[r.toCardinality],
    cardinality: [r.fromCardinality, r.toCardinality],
    ...(r.identifying === false ? { dashed: true } : {}),
    ...(r.label ? { label: r.label } : {}),
  }))
  return { direction: d.direction ?? 'TB', nodes, edges }
}

// ── C4 ──────────────────────────────────────────────────────────────────────────────────────────

function c4Graph(d: C4Diagram): DiagramGraph {
  const frames = (d.boundaries ?? []).map((b) =>
    sizeBox({
      id: b.id,
      shape: 'frame',
      role: 'boundary',
      title: b.label,
      // The boundary's kind reads like a technology line: [System].
      ...(b.kind && b.kind !== 'boundary' ? { stereotype: b.kind } : {}),
      ...(b.parent ? { parent: b.parent } : {}),
    }),
  )
  const elements = d.elements.map((e) =>
    sizeBox(
      {
        id: e.id,
        shape: e.kind === 'person' ? 'person' : 'box',
        role: e.kind,
        title: e.label,
        tone: e.external ? 'external' : 'primary',
        ...(e.technology ? { technology: e.technology } : {}),
        ...(e.shape && e.shape !== 'box' ? { variant: e.shape } : {}),
        ...(e.description ? { body: e.description } : {}),
        ...(e.boundary ? { parent: e.boundary } : {}),
      },
      180,
    ),
  )
  const edges = d.relations.map((r, i): DiagramEdge => ({
    id: `c${String(i)}`,
    source: r.from,
    target: r.to,
    from: r.from,
    to: r.to,
    relation: 'c4',
    dashed: true,
    targetMarker: 'arrowFilled',
    ...(r.bidirectional ? { sourceMarker: 'arrowFilled' as const } : {}),
    ...(r.label ? { label: r.label } : {}),
    ...(r.technology ? { technology: r.technology } : {}),
  }))
  return { direction: d.direction ?? 'TB', nodes: [...frames, ...elements], edges }
}

/** The graph a canvas draws for a diagram. Sequence diagrams aren't graphs: null. */
function toDiagramGraph(diagram: UmlSpec): DiagramGraph | null {
  switch (diagram.kind) {
    case 'class':
      return classGraph(diagram)
    case 'state':
      return stateGraph(diagram)
    case 'er':
      return erGraph(diagram)
    case 'c4':
      return c4Graph(diagram)
    case 'sequence':
      return null
  }
}

export {
  type DiagramEdge,
  type DiagramGraph,
  type DiagramMarker,
  type DiagramNode,
  type DiagramRelation,
  type DiagramRole,
  type DiagramRow,
  type DiagramShape,
  type DiagramTone,
  toDiagramGraph,
}
