import { describe, expect, it } from 'vitest'

import {
  type ComponentDiagram,
  type PackageDiagram,
  parseUmlJson,
  toUmlJson,
  type UmlSpec,
} from '@/lib/uml'
import { addElement, addRelation, elementTypes, relationTypes } from '@/lib/uml-edit'
import { copyItems, pasteItems } from '@/lib/uml-edit-clipboard'
import { elementFields, setElementFields } from '@/lib/uml-edit-fields'
import { toDiagramGraph } from '@/lib/uml-graph'
import { layoutDiagram } from '@/lib/uml-layout'
import { isMermaidSpec, toMermaid } from '@/lib/uml-mermaid'
import { parsePlantUml, toPlantUml } from '@/lib/uml-plantuml'

/** Parses text that must be problem-free and returns its diagram. */
function read<K extends UmlSpec['kind']>(text: string, kind: K): Extract<UmlSpec, { kind: K }> {
  const result = parsePlantUml(text)
  expect(result.problems).toEqual([])
  const d = result.diagram
  if (d?.kind !== kind) throw new Error(`expected a ${kind} diagram, got ${String(d?.kind)}`)
  return d as Extract<UmlSpec, { kind: K }>
}

const components: ComponentDiagram = {
  kind: 'component',
  elements: [
    { id: 'checkout', kind: 'component', label: 'Checkout' },
    { id: 'api', kind: 'port', parent: 'checkout' },
    { id: 'cart', kind: 'component', label: 'Cart', parent: 'checkout' },
    { id: 'payments', kind: 'interface', label: 'Payments' },
    { id: 'pay', kind: 'component', label: 'Payment service', stereotype: 'service' },
    { id: 'audit', kind: 'component' },
  ],
  relations: [
    { from: 'api', to: 'cart', kind: 'delegate' },
    { from: 'pay', to: 'payments', kind: 'provide' },
    { from: 'checkout', to: 'payments', kind: 'require' },
    { from: 'checkout', to: 'pay', kind: 'assembly', label: 'pays' },
    { from: 'pay', to: 'audit' },
  ],
}

const packages: PackageDiagram = {
  kind: 'package',
  elements: [
    { id: 'web', kind: 'package', label: 'Web' },
    { id: 'controller', kind: 'class', label: 'OrderController', parent: 'web' },
    { id: 'domain', kind: 'package', label: 'Domain', stereotype: 'model' },
    { id: 'repo', kind: 'interface', label: 'OrderRepository', parent: 'domain' },
    { id: 'core', kind: 'package', parent: 'domain' },
    { id: 'persistence', kind: 'package' },
  ],
  relations: [
    { from: 'web', to: 'domain', kind: 'import' },
    { from: 'persistence', to: 'domain' },
    { from: 'domain', to: 'core', kind: 'merge', label: 'v2' },
  ],
}

describe('component diagrams in PlantUML', () => {
  it('reads components, nesting, ports, interfaces and every kind of line', () => {
    const d = read(
      `@startuml
left to right direction
component "Checkout" as checkout {
  portin "api" as api
  [Cart] as cart
}
() "Payments" as payments
interface Refunds
component "Payment service" as pay <<service>>
node Cluster {
  component audit
}
api --> cart : <<delegate>>
pay - payments
Refunds -- pay
checkout -( payments
Refunds )- checkout
checkout -(0)- pay : pays
pay ..> audit
@enduml`,
      'component',
    )
    expect(d.direction).toBe('LR')
    expect(d.elements.find((e) => e.id === 'api')).toMatchObject({
      kind: 'port',
      parent: 'checkout',
    })
    expect(d.elements.find((e) => e.id === 'cart')).toMatchObject({
      parent: 'checkout',
      label: 'Cart',
    })
    expect(d.elements.find((e) => e.id === 'payments')?.kind).toBe('interface')
    expect(d.elements.find((e) => e.id === 'pay')?.stereotype).toBe('service')
    // A grouping is a component holding others, its keyword as stereotype.
    expect(d.elements.find((e) => e.id === 'Cluster')).toMatchObject({
      kind: 'component',
      stereotype: 'node',
    })
    expect(d.elements.find((e) => e.id === 'audit')?.parent).toBe('Cluster')
    expect(d.relations).toEqual([
      { from: 'api', to: 'cart', kind: 'delegate' },
      { from: 'pay', to: 'payments', kind: 'provide' },
      // Written the other way round: the component still provides the interface.
      { from: 'pay', to: 'Refunds', kind: 'provide' },
      { from: 'checkout', to: 'payments', kind: 'require' },
      { from: 'checkout', to: 'Refunds', kind: 'require' },
      { from: 'checkout', to: 'pay', kind: 'assembly', label: 'pays' },
      { from: 'pay', to: 'audit' },
    ])
  })

  it('writes a component diagram that reads back the same', () => {
    const text = toPlantUml(components)
    expect(text).toContain('component "Checkout" as checkout {')
    expect(text).toContain('checkout -( payments')
    expect(text).toContain('checkout -(0)- pay : pays')
    expect(read(text, 'component')).toEqual({ ...components, direction: 'LR' })
  })

  it('tells a component diagram from a deployment one', () => {
    // Nodes make it a deployment diagram, even with components on them.
    expect(parsePlantUml('@startuml\nnode web {\n  [api]\n}\n@enduml').diagram?.kind).toBe(
      'deployment',
    )
    expect(parsePlantUml('@startuml\n[api]\n() HTTP\napi - HTTP\n@enduml').diagram?.kind).toBe(
      'component',
    )
  })

  it('reports what it cannot read, and survives hostile input', () => {
    const r = parsePlantUml('@startuml\ncomponent A {\n  ???\n@enduml')
    expect(r.diagram?.kind).toBe('component')
    expect(r.problems.map((p) => p.code)).toEqual(['syntax', 'unclosed'])
    expect(() => parsePlantUml(`@startuml\n${'component -( '.repeat(500)}\n@enduml`)).not.toThrow()
  })
})

describe('package diagrams in PlantUML', () => {
  it('reads nested packages, what they hold, and import, merge and dependency', () => {
    const d = read(
      `@startuml
package "Web" as web {
  class OrderController
}
package Domain <<model>> {
  interface OrderRepository
  enum Status
  [Mailer]
  package Core {
  }
}
Web ..> Domain : <<import>>
Domain ..> Core : <<merge>>
OrderController --> OrderRepository
@enduml`,
      'package',
    )
    expect(d.elements.find((e) => e.id === 'web')).toMatchObject({ kind: 'package', label: 'Web' })
    expect(d.elements.find((e) => e.id === 'OrderController')).toMatchObject({
      kind: 'class',
      parent: 'web',
    })
    expect(d.elements.find((e) => e.id === 'Status')).toMatchObject({
      kind: 'class',
      stereotype: 'enumeration',
    })
    expect(d.elements.find((e) => e.id === 'Mailer')?.kind).toBe('component')
    expect(d.elements.find((e) => e.id === 'Core')?.parent).toBe('Domain')
    expect(d.elements.find((e) => e.id === 'Domain')?.stereotype).toBe('model')
    expect(d.relations.map((r) => r.kind ?? 'dependency')).toEqual([
      'import',
      'merge',
      'dependency',
    ])
  })

  it('writes a package diagram that reads back the same', () => {
    const text = toPlantUml(packages)
    expect(text).toContain('web ..> domain : <<import>>')
    expect(read(text, 'package')).toEqual(packages)
  })

  it('keeps class diagrams with packages as class diagrams', () => {
    const text = '@startuml\npackage shop {\n  class Order {\n    +id: String\n  }\n}\n@enduml'
    expect(parsePlantUml(text).diagram?.kind).toBe('class')
  })
})

describe('JSON and Mermaid', () => {
  it('reads back what it writes, and refuses unknown kinds', () => {
    for (const d of [components, packages] satisfies UmlSpec[]) {
      expect(parseUmlJson(toUmlJson(d)).diagram).toEqual(d)
    }
    const bad = parseUmlJson(
      JSON.stringify({
        kind: 'component',
        elements: [{ id: 'A', kind: 'component' }],
        relations: [{ from: 'A', to: 'A', kind: 'inheritance' }],
      }),
    )
    expect(bad.diagram).toBeNull()
  })

  it('has no Mermaid syntax: written as a flowchart, packages as subgraphs', () => {
    expect(isMermaidSpec(components)).toBe(false)
    expect(isMermaidSpec(packages)).toBe(false)
    const text = toMermaid(packages)
    expect(text).toMatch(/^flowchart TB/)
    expect(text).toContain('subgraph web')
  })
})

describe('the drawing', () => {
  it('draws interfaces as lollipops, ports on the edge, and the UML ends', () => {
    const g = toDiagramGraph(components)
    expect(g?.direction).toBe('LR')
    expect(g?.nodes.find((n) => n.id === 'checkout')).toMatchObject({
      shape: 'frame',
      stereotype: 'component',
    })
    expect(g?.nodes.find((n) => n.id === 'pay')).toMatchObject({
      shape: 'box',
      stereotype: 'service',
    })
    expect(g?.nodes.find((n) => n.id === 'payments')?.shape).toBe('lollipop')
    expect(g?.nodes.find((n) => n.id === 'api')).toMatchObject({ shape: 'port', border: true })
    const ends = g?.edges.map((e) => [e.relation, e.targetMarker ?? null, e.dashed ?? false])
    expect(ends).toEqual([
      ['delegate', 'arrow', false],
      ['provide', null, false],
      ['require', 'socket', false],
      ['assembly', 'assembly', false],
      ['dependency', 'arrow', true],
    ])
    expect(g?.edges[0]?.label).toBe('«delegate»')
  })

  it('sets ports on their component’s sides, not inside it', () => {
    const g = toDiagramGraph({
      kind: 'component',
      elements: [
        { id: 'c', kind: 'component' },
        { id: 'p1', kind: 'port', parent: 'c' },
        { id: 'p2', kind: 'port', parent: 'c' },
        { id: 'p3', kind: 'port', parent: 'c' },
      ],
      relations: [],
    })
    if (!g) throw new Error('no graph')
    // Ports alone don't make a component a frame.
    expect(g.nodes.find((n) => n.id === 'c')?.shape).toBe('box')
    const boxes = layoutDiagram({ nodes: g.nodes, edges: g.edges })
    const c = boxes.get('c')
    if (!c) throw new Error('no box')
    expect(boxes.get('p1')?.x).toBe(-7)
    expect(boxes.get('p2')?.x).toBe(-7)
    expect(boxes.get('p3')?.x).toBe(c.width - 7)
    // The component is tall enough for two ports on a side.
    const p2 = boxes.get('p2')
    expect((p2?.y ?? 0) + 14).toBeLessThanOrEqual(c.height)
    // A dragged port stays where it was put.
    const moved = layoutDiagram({ nodes: g.nodes, edges: g.edges, fixed: { p1: { x: 30, y: -7 } } })
    expect(moved.get('p1')).toMatchObject({ x: 30, y: -7 })
  })

  it('draws packages as folders, frames when they hold something', () => {
    const g = toDiagramGraph(packages)
    expect(g?.nodes.find((n) => n.id === 'web')).toMatchObject({ shape: 'frame', role: 'package' })
    expect(g?.nodes.find((n) => n.id === 'persistence')).toMatchObject({
      shape: 'folder',
      role: 'package',
    })
    expect(g?.nodes.find((n) => n.id === 'repo')).toMatchObject({
      role: 'interface',
      stereotype: 'interface',
    })
    expect(g?.edges.map((e) => e.label ?? null)).toEqual(['«import»', null, '«merge»\nv2'])
    expect(g?.edges.every((e) => e.dashed && e.targetMarker === 'arrow')).toBe(true)
  })
})

describe('editing', () => {
  it('offers the elements and relations each kind holds', () => {
    expect(elementTypes(components)).toEqual(['component', 'interface', 'port', 'note'])
    expect(relationTypes(components)).toEqual([
      'dependency',
      'provide',
      'require',
      'assembly',
      'delegate',
    ])
    expect(elementTypes(packages)).toEqual(['package', 'class', 'interface', 'component', 'note'])
    expect(relationTypes(packages)).toEqual(['dependency', 'import', 'merge'])
  })

  it('adds a port to the selected component, and an element into the selected package', () => {
    const port = addElement(components, { type: 'port', name: 'events', near: 'pay' })
    if (port.diagram.kind !== 'component') throw new Error('kind changed')
    expect(port.diagram.elements.find((e) => e.id === port.id)).toMatchObject({
      kind: 'port',
      parent: 'pay',
    })
    const cls = addElement(packages, { type: 'class', name: 'Invoice', near: 'repo' })
    if (cls.diagram.kind !== 'package') throw new Error('kind changed')
    expect(cls.diagram.elements.find((e) => e.id === cls.id)?.parent).toBe('domain')
  })

  it('connects with the kind picked, leaving the usual one unsaid', () => {
    const d = addRelation(components, { type: 'require', from: 'audit', to: 'payments', label: '' })
    if (d.kind !== 'component') throw new Error('kind changed')
    expect(d.relations.at(-1)).toEqual({ from: 'audit', to: 'payments', kind: 'require' })
    const p = addRelation(packages, { type: 'dependency', from: 'web', to: 'core', label: '' })
    if (p.kind !== 'package') throw new Error('kind changed')
    expect(p.relations.at(-1)).toEqual({ from: 'web', to: 'core' })
  })

  it('sets a stereotype, and pastes only into the same kind', () => {
    const styled = setElementFields(components, 'audit', { name: 'audit', stereotype: 'library' })
    expect(elementFields(styled.diagram, 'audit')?.stereotype).toBe('library')
    expect(elementFields(packages, 'domain')?.stereotype).toBe('model')
    const clip = copyItems(components, { elements: ['checkout'], relations: [] })
    if (!clip) throw new Error('nothing copied')
    const pasted = pasteItems(components, clip)
    // The component, its port and its part come along, under fresh ids.
    expect(pasted.selection.elements).toHaveLength(3)
    expect(pasteItems(packages, clip).diagram).toBe(packages)
  })
})
