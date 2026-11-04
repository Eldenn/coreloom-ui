import { describe, expect, it } from 'vitest'

import type { ClassDiagram, StateDiagram } from '@/lib/uml'
import { toDiagramGraph } from '@/lib/uml-graph'
import { type LayoutBox, layoutDiagram } from '@/lib/uml-layout'
import { parseMermaid } from '@/lib/uml-mermaid'

const overlaps = (a: LayoutBox, b: LayoutBox) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

/** No two boxes in the same frame overlap. */
function expectNoOverlap(
  boxes: Map<string, LayoutBox>,
  parentOf: (id: string) => string | undefined,
) {
  const list = [...boxes]
  for (const [i, [a, boxA]] of list.entries()) {
    for (const [b, boxB] of list.slice(i + 1)) {
      if (parentOf(a) !== parentOf(b)) continue
      expect(overlaps(boxA, boxB), `${a} overlaps ${b}`).toBe(false)
    }
  }
}

describe('layoutDiagram', () => {
  const box = (id: string, parent?: string) => ({
    id,
    width: 120,
    height: 60,
    ...(parent ? { parent } : {}),
  })

  it('puts sources above what they point to, top to bottom', () => {
    const layout = layoutDiagram({
      nodes: [box('a'), box('b'), box('c')],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ],
    })
    const y = (id: string) => layout.get(id)?.y ?? NaN
    expect(y('a')).toBeLessThan(y('b'))
    expect(y('b')).toBeLessThan(y('c'))
  })

  it('turns for LR and mirrors for BT', () => {
    const edges = [{ source: 'a', target: 'b' }]
    const lr = layoutDiagram({ nodes: [box('a'), box('b')], edges, direction: 'LR' })
    expect(lr.get('a')?.x).toBeLessThan(lr.get('b')?.x ?? 0)
    const bt = layoutDiagram({ nodes: [box('a'), box('b')], edges, direction: 'BT' })
    expect(bt.get('a')?.y).toBeGreaterThan(bt.get('b')?.y ?? 0)
  })

  it('survives cycles and self-loops', () => {
    const layout = layoutDiagram({
      nodes: [box('a'), box('b'), box('c')],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'a' },
        { source: 'a', target: 'a' },
      ],
    })
    expect(layout.size).toBe(3)
    expectNoOverlap(layout, () => undefined)
  })

  it('grows a frame around its children, which are placed relative to it', () => {
    const frame = { id: 'f', width: 100, height: 40 }
    const layout = layoutDiagram({
      nodes: [frame, box('x', 'f'), box('y', 'f'), box('z')],
      edges: [
        { source: 'x', target: 'y' },
        { source: 'z', target: 'x' },
      ],
    })
    const f = layout.get('f')
    const x = layout.get('x')
    const y = layout.get('y')
    if (!f || !x || !y) throw new Error('missing boxes')
    for (const child of [x, y]) {
      expect(child.x).toBeGreaterThan(0)
      expect(child.y).toBeGreaterThan(0)
      expect(child.x + child.width).toBeLessThanOrEqual(f.width)
      expect(child.y + child.height).toBeLessThanOrEqual(f.height)
    }
    // z points into the frame, so the frame is laid out below it.
    expect(layout.get('z')?.y).toBeLessThan(f.y)
  })

  it('keeps dragged positions', () => {
    const layout = layoutDiagram({
      nodes: [box('a'), box('b')],
      edges: [{ source: 'a', target: 'b' }],
      fixed: { b: { x: 900, y: 12 } },
    })
    expect(layout.get('b')).toMatchObject({ x: 900, y: 12 })
  })

  it('wraps unconnected nodes into rows instead of one long line', () => {
    const nodes = Array.from({ length: 30 }, (_, i) => box(`n${String(i)}`))
    const layout = layoutDiagram({ nodes, edges: [] })
    const right = Math.max(...[...layout.values()].map((b) => b.x + b.width))
    expect(right).toBeLessThan(1300)
    expectNoOverlap(layout, () => undefined)
  })
})

describe('toDiagramGraph', () => {
  const classes = parseMermaid(`classDiagram
  Animal <|-- Duck
  Pond o-- Duck : home
  Duck --> Food : eats
  Customer "1" --> "*" Order
  namespace Zoo {
    class Keeper
  }
  note for Duck "Quacks"`).diagram as ClassDiagram

  it('starts hierarchy lines at the parent or whole, with the marker there', () => {
    const graph = toDiagramGraph(classes)
    const edge = (from: string, to: string) =>
      graph?.edges.find((e) => e.from === from && e.to === to)
    expect(edge('Duck', 'Animal')).toMatchObject({
      source: 'Animal',
      target: 'Duck',
      sourceMarker: 'triangle',
    })
    expect(edge('Duck', 'Pond')).toMatchObject({
      source: 'Pond',
      sourceMarker: 'diamond',
      label: 'home',
    })
    expect(edge('Duck', 'Food')).toMatchObject({ source: 'Duck', targetMarker: 'arrow' })
    expect(edge('Customer', 'Order')).toMatchObject({ sourceLabel: '1', targetLabel: '*' })
  })

  it('frames namespaces and links notes', () => {
    const graph = toDiagramGraph(classes)
    expect(graph?.nodes.find((n) => n.id === 'Keeper')?.parent).toBe('namespace:Zoo')
    expect(graph?.nodes.find((n) => n.id === 'namespace:Zoo')?.shape).toBe('frame')
    expect(graph?.edges.find((e) => e.relation === 'note')).toMatchObject({
      target: 'Duck',
      dashed: true,
    })
  })

  it('gives each scope of a state diagram its own start and end', () => {
    const states = parseMermaid(`stateDiagram-v2
  [*] --> A
  state A {
    [*] --> B
    B --> [*]
  }
  A --> [*]`).diagram as StateDiagram
    const graph = toDiagramGraph(states)
    const pseudo = graph?.nodes.filter((n) => n.shape === 'start' || n.shape === 'end') ?? []
    expect(pseudo.map((n) => [n.shape, n.parent])).toEqual([
      ['start', undefined],
      ['start', 'A'],
      ['end', 'A'],
      ['end', undefined],
    ])
    expect(graph?.nodes.find((n) => n.id === 'A')?.shape).toBe('frame')
  })

  it('sizes boxes to their text, within limits', () => {
    const graph = toDiagramGraph({
      kind: 'class',
      classes: [
        { id: 'A' },
        { id: 'B', attributes: [{ text: 'x'.repeat(400) }], methods: [{ text: 'run()' }] },
      ],
      relations: [],
    })
    const a = graph?.nodes.find((n) => n.id === 'A')
    const b = graph?.nodes.find((n) => n.id === 'B')
    if (!a || !b) throw new Error('missing nodes')
    expect(a.width).toBeGreaterThanOrEqual(120)
    expect(b.width).toBeLessThanOrEqual(300)
    expect(b.height).toBeGreaterThan(a.height)
  })

  it('has no graph for sequence diagrams', () => {
    expect(toDiagramGraph({ kind: 'sequence', participants: [], steps: [] })).toBeNull()
  })

  it('lays out a real diagram without overlaps', () => {
    const graph = toDiagramGraph(classes)
    if (!graph) throw new Error('no graph')
    const layout = layoutDiagram(graph)
    expect(layout.size).toBe(graph.nodes.length)
    const parent = new Map(graph.nodes.map((n) => [n.id, n.parent]))
    expectNoOverlap(layout, (id) => parent.get(id))
  })
})
