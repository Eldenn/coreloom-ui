import { describe, expect, it } from 'vitest'

import {
  type ActivityDiagram,
  type DeploymentDiagram,
  parseUmlJson,
  toUmlJson,
  type UmlSpec,
  type UseCaseDiagram,
} from '@/lib/uml'
import { addElement, addRelation, deleteItems, elementTypes, relationTypes } from '@/lib/uml-edit'
import { copyItems, pasteItems } from '@/lib/uml-edit-clipboard'
import {
  elementFields,
  renameElement,
  reverseRelation,
  setElementFields,
  setRelationFields,
} from '@/lib/uml-edit-fields'
import { toDiagramGraph } from '@/lib/uml-graph'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'

function activity(text: string): ActivityDiagram {
  const r = parseMermaid(text)
  expect(r.problems).toEqual([])
  if (r.diagram?.kind !== 'activity') throw new Error('expected an activity diagram')
  return r.diagram
}

const usecase: UseCaseDiagram = {
  kind: 'usecase',
  elements: [
    { id: 'Customer', kind: 'actor' },
    { id: 'Shop', kind: 'system' },
    { id: 'Order', kind: 'usecase', label: 'Place an order', parent: 'Shop' },
    { id: 'Pay', kind: 'usecase', parent: 'Shop' },
    { id: 'Member', kind: 'actor' },
  ],
  relations: [
    { from: 'Customer', to: 'Order' },
    { from: 'Order', to: 'Pay', kind: 'include' },
    { from: 'Member', to: 'Customer', kind: 'generalization' },
  ],
}

const deployment: DeploymentDiagram = {
  kind: 'deployment',
  elements: [
    { id: 'web', kind: 'node' },
    { id: 'app', kind: 'artifact', label: 'app.jar', parent: 'web' },
    { id: 'db', kind: 'database' },
    { id: 'phone', kind: 'device' },
  ],
  relations: [
    { from: 'web', to: 'db', label: 'JDBC' },
    { from: 'app', to: 'web', kind: 'deploy' },
  ],
}

describe('flowcharts as activity diagrams', () => {
  it('reads node shapes as activity nodes', () => {
    const d = activity(`flowchart LR
  a((start)) --> b("Fill the cart") --> c{"Paid?"}
  c -->|yes| d[Ship] --> e(((done)))
  c -- no --> f@{ shape: cross-circ }
  g@{ shape: fork }
  h@{ shape: join }
  m{ }`)
    expect(d.direction).toBe('LR')
    const kind = (id: string) => d.elements.find((e) => e.id === id)?.kind
    expect([kind('a'), kind('b'), kind('c'), kind('d'), kind('e'), kind('f')]).toEqual([
      'start',
      'action',
      'decision',
      'action',
      'end',
      'flowEnd',
    ])
    expect([kind('g'), kind('h'), kind('m')]).toEqual(['fork', 'join', 'merge'])
    expect(d.relations).toContainEqual({ from: 'c', to: 'd', label: 'yes' })
    expect(d.relations).toContainEqual({ from: 'c', to: 'f', label: 'no' })
  })

  it('reads subgraphs as partitions, `&` as several links, and warns about styling', () => {
    const r = parseMermaid(`graph TD
  subgraph Shop
    A --> B
  end
  B & C --> D
  style A fill:#f00`)
    const d = r.diagram
    if (d?.kind !== 'activity') throw new Error('expected an activity diagram')
    expect(d.elements.find((e) => e.id === 'A')?.parent).toBe('Shop')
    expect(d.elements.find((e) => e.id === 'Shop')?.kind).toBe('partition')
    expect(d.relations.filter((rel) => rel.to === 'D').map((rel) => rel.from)).toEqual(['B', 'C'])
    expect(r.problems).toEqual([expect.objectContaining({ line: 6, severity: 'warning' })])
  })

  it('writes activities that read back the same', () => {
    const d = activity(`flowchart TB
  s@{ shape: sm-circ }
  subgraph Lane
    A("Do it")
  end
  q{"Again?"}
  s --> A --> q
  q -->|yes| A
  q -->|no| e@{ shape: fr-circ }`)
    expect(activity(toMermaid(d))).toEqual(d)
  })

  it('keeps labels with quotes and markup as text', () => {
    const d = activity('flowchart TB\n  A["<b>bold</b> & \\"quoted\\""] --> B')
    expect(d.elements[0]?.label).toContain('<b>bold</b>')
  })
})

describe('the drawing of the new kinds', () => {
  it('draws use cases left to right, generalization with a triangle at the parent', () => {
    const g = toDiagramGraph(usecase)
    expect(g?.direction).toBe('LR')
    expect(g?.nodes.find((n) => n.id === 'Customer')?.shape).toBe('actor')
    expect(g?.nodes.find((n) => n.id === 'Order')).toMatchObject({
      shape: 'ellipse',
      parent: 'Shop',
    })
    expect(g?.nodes.find((n) => n.id === 'Shop')?.shape).toBe('frame')
    expect(g?.edges[1]).toMatchObject({ dashed: true, label: '«include»' })
    expect(g?.edges[2]).toMatchObject({
      source: 'Customer',
      target: 'Member',
      sourceMarker: 'triangle',
    })
  })

  it('puts guards in brackets', () => {
    const g = toDiagramGraph(activity('flowchart TB\n  A -->|paid| B\n  A -->|[late]| C'))
    expect(g?.edges.map((e) => e.label)).toEqual(['[paid]', '[late]'])
  })

  it('draws deployment nodes in 3D, holders as frames, and the «deploy» keyword', () => {
    const g = toDiagramGraph(deployment)
    expect(g?.nodes.find((n) => n.id === 'web')?.shape).toBe('frame')
    expect(g?.nodes.find((n) => n.id === 'phone')).toMatchObject({
      shape: 'node3d',
      stereotype: 'device',
    })
    expect(g?.nodes.find((n) => n.id === 'db')?.variant).toBe('database')
    expect(g?.edges[1]).toMatchObject({ dashed: true, label: '«deploy»', targetMarker: 'arrow' })
  })
})

describe('JSON', () => {
  it('reads back what it writes, and refuses unknown kinds of element', () => {
    for (const d of [usecase, deployment] satisfies UmlSpec[]) {
      expect(parseUmlJson(toUmlJson(d)).diagram).toEqual(d)
    }
    const bad = parseUmlJson(
      JSON.stringify({ kind: 'usecase', elements: [{ id: 'X', kind: 'robot' }], relations: [] }),
    )
    expect(bad.diagram).toBeNull()
    expect(bad.problems[0]?.severity).toBe('error')
  })
})

describe('editing the new kinds', () => {
  it('offers the elements and relations each kind holds', () => {
    expect(elementTypes(usecase)).toEqual(['actor', 'usecase', 'subject', 'note'])
    expect(relationTypes(usecase)[0]).toBe('association')
    expect(relationTypes(deployment)).toEqual(['link', 'dependency', 'deploy'])
  })

  it('adds an element next to the selected one, inside its frame', () => {
    const { diagram, id } = addElement(usecase, { type: 'usecase', name: 'Track it', near: 'Pay' })
    if (diagram.kind !== 'usecase') throw new Error('kind changed')
    expect(diagram.elements.find((e) => e.id === id)).toMatchObject({
      kind: 'usecase',
      parent: 'Shop',
    })
  })

  it('connects, reverses, relabels and deletes', () => {
    let d = addRelation(deployment, {
      type: 'dependency',
      from: 'phone',
      to: 'web',
      label: 'HTTPS',
    })
    if (d.kind !== 'deployment') throw new Error('kind changed')
    expect(d.relations[2]).toEqual({ from: 'phone', to: 'web', kind: 'dependency', label: 'HTTPS' })
    d = reverseRelation(d, 2)
    if (d.kind !== 'deployment') throw new Error('kind changed')
    expect(d.relations[2]).toMatchObject({ from: 'web', to: 'phone' })
    d = setRelationFields(d, 2, { label: 'push', type: 'link' })
    if (d.kind !== 'deployment') throw new Error('kind changed')
    expect(d.relations[2]).toEqual({ from: 'web', to: 'phone', label: 'push' })
    // Removing a node takes its lines; what it held moves up a level.
    d = deleteItems(d, { elements: ['web'], relations: [] })
    if (d.kind !== 'deployment') throw new Error('kind changed')
    expect(d.elements.find((e) => e.id === 'app')?.parent).toBeUndefined()
    expect(d.relations.some((r) => r.from === 'web' || r.to === 'web')).toBe(false)
  })

  it('renames an id everywhere it is used, and sets a stereotype', () => {
    const renamed = renameElement(usecase, 'Order', 'Checkout')
    const d = renamed.diagram
    if (d.kind !== 'usecase') throw new Error('kind changed')
    expect(renamed.id).toBe('Checkout')
    expect(d.relations[0]?.to).toBe('Checkout')
    expect(d.relations[1]?.from).toBe('Checkout')
    const styled = setElementFields(deployment, 'phone', { name: 'phone', stereotype: 'mobile' })
    expect(elementFields(styled.diagram, 'phone')?.stereotype).toBe('mobile')
  })

  it('copies and pastes with fresh ids, and not into another kind', () => {
    const clip = copyItems(usecase, { elements: ['Order', 'Pay'], relations: [] })
    if (!clip) throw new Error('nothing copied')
    const pasted = pasteItems(usecase, clip)
    const d = pasted.diagram
    if (d.kind !== 'usecase') throw new Error('kind changed')
    expect(pasted.selection.elements).toHaveLength(2)
    expect(pasted.selection.elements).not.toContain('Order')
    expect(d.relations).toHaveLength(usecase.relations.length + 1)
    expect(pasteItems(deployment, clip).diagram).toBe(deployment)
  })
})
