import { describe, expect, it } from 'vitest'

import { graphTarget, sequenceTarget } from '@/components/ui/uml-diagram-labels'
import type { SequenceDiagram, UmlSpec } from '@/lib/uml'
import { toDiagramGraph } from '@/lib/uml-graph'
import { parseMermaid } from '@/lib/uml-mermaid'

function read(text: string): UmlSpec {
  const result = parseMermaid(text)
  if (!result.diagram) throw new Error('nothing read')
  return result.diagram
}

/** The target of a hit on the canvas of `text`, roles named by their key. */
function hit(text: string | UmlSpec, at: Parameters<typeof graphTarget>[1]) {
  const graph = toDiagramGraph(typeof text === 'string' ? read(text) : text)
  if (!graph) throw new Error('not a canvas diagram')
  return graphTarget(graph, at, (node) => node.role)
}

const CLASSES = `classDiagram
  class Payment {
    +number total
    -pay(amount) bool
  }
  class Order
  class List~T~
  Order --> Payment : pays
  Payment <|-- Refund`

describe('class diagram targets', () => {
  it('names an element by its name, with its generic', () => {
    expect(hit(CLASSES, { node: 'Payment' })).toEqual({
      type: 'element',
      id: 'Payment',
      label: 'Payment',
    })
    expect(hit(CLASSES, { node: 'List' })?.label).toBe('List<T>')
  })

  it('names a member after its element, as written in the box', () => {
    expect(hit(CLASSES, { node: 'Payment', member: 0 })).toEqual({
      type: 'member',
      element: 'Payment',
      index: 0,
      label: 'Payment.number total',
    })
    // Methods come after the attributes.
    expect(hit(CLASSES, { node: 'Payment', member: 1 })?.label).toBe('Payment.pay(amount) bool')
  })

  it('reads a row past the last as the element itself', () => {
    expect(hit(CLASSES, { node: 'Payment', member: 9 })?.type).toBe('element')
  })

  it('names a relation by its ends the way the model has them, then its label', () => {
    expect(hit(CLASSES, { edge: 'r0' })).toEqual({
      type: 'relation',
      index: 0,
      label: 'Order → Payment: pays',
    })
    // Inheritance is drawn from the parent, but read from the child.
    expect(hit(CLASSES, { edge: 'r1' })?.label).toBe('Refund → Payment')
  })

  it('names a note by its text on one line, and skips its line', () => {
    const noted: UmlSpec = {
      kind: 'class',
      classes: [{ id: 'Order', label: 'Big\n  order' }],
      relations: [],
      notes: [{ text: 'Placed\n  online', for: 'Order' }],
    }
    const graph = toDiagramGraph(noted)
    const note = graph?.nodes.find((n) => n.role === 'note')
    expect(note).toBeDefined()
    expect(hit(noted, { node: note?.id })?.label).toBe('Placed online')
    expect(hit(noted, { node: 'Order' })?.label).toBe('Big order')
    const line = graph?.edges.find((e) => e.relation === 'note')
    expect(line).toBeDefined()
    expect(hit(noted, { edge: line?.id })).toBeNull()
  })

  it('finds nothing for an unknown node, an unknown edge or the pane', () => {
    expect(hit(CLASSES, { node: 'Nope' })).toBeNull()
    expect(hit(CLASSES, { edge: 'r42' })).toBeNull()
    expect(hit(CLASSES, {})).toBeNull()
  })
})

describe('other canvas kinds', () => {
  it('state: a pseudo-state has its role, a transition its event', () => {
    const text = `stateDiagram-v2
  [*] --> Idle
  Idle --> Busy : start`
    const graph = toDiagramGraph(read(text))
    const start = graph?.nodes.find((n) => n.role === 'start')
    expect(hit(text, { node: start?.id })?.label).toBe('start')
    expect(hit(text, { edge: 't1' })?.label).toBe('Idle → Busy: start')
  })

  it('ER: an attribute is its name then its type', () => {
    const text = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER {
    string id PK
    decimal total
  }`
    expect(hit(text, { node: 'ORDER', member: 1 })?.label).toBe('ORDER.total: decimal')
    expect(hit(text, { edge: 'e0' })?.label).toBe('CUSTOMER → ORDER: places')
  })

  it('C4: an element by its label, a relation by its label', () => {
    const text = `C4Context
  Person(shopper, "Shopper")
  System(shop, "Web shop")
  Rel(shopper, shop, "Buys from")`
    expect(hit(text, { node: 'shopper' })?.label).toBe('Shopper')
    expect(hit(text, { edge: 'c0' })?.label).toBe('Shopper → Web shop: Buys from')
  })

  it('flowchart (activity): a node by its text', () => {
    const text = `flowchart TD
  a[Take order] --> b{Paid?}`
    expect(hit(text, { node: 'a' })?.label).toBe('Take order')
    expect(hit(text, { edge: 'r0' })?.label).toBe('Take order → Paid?')
  })
})

describe('sequence targets', () => {
  const diagram = read(`sequenceDiagram
  participant C as Client
  participant API
  C->>API: login(user)
  API-->>C: token
  API->>API: check
  Note over C,API: cached
  activate API
  loop every minute
    C-)API: ping
  end
  alt ok
    API->>C: 200
  else failed
    API->>C: 500
  end`) as SequenceDiagram

  it('writes a message the way a reader would', () => {
    expect(sequenceTarget(diagram, 'step:0')).toEqual({
      type: 'step',
      id: 'step:0',
      label: 'Client -> API: login(user)',
    })
    expect(sequenceTarget(diagram, 'step:1')?.label).toBe('API --> Client: token')
    expect(sequenceTarget(diagram, 'step:2')?.label).toBe('API -> API: check')
  })

  it('keeps a label on one line, and names a participant missing from the list by its id', () => {
    const odd: SequenceDiagram = {
      kind: 'sequence',
      participants: [],
      steps: [{ type: 'message', from: 'A', to: 'B', text: 'two\nlines', arrow: 'dottedLine' }],
    }
    expect(sequenceTarget(odd, 'step:0')?.label).toBe('A --> B: two lines')
  })

  it('writes notes, activations and blocks', () => {
    expect(sequenceTarget(diagram, 'step:3')?.label).toBe('Note over Client, API: cached')
    expect(sequenceTarget(diagram, 'step:4')?.label).toBe('activate API')
    expect(sequenceTarget(diagram, 'step:5')?.label).toBe('loop every minute')
    expect(sequenceTarget(diagram, 'step:5.0.0')?.label).toBe('Client -> API: ping')
    expect(sequenceTarget(diagram, 'step:6')?.label).toBe('alt ok')
  })

  it('names a participant by its label, and finds no step that is not there', () => {
    expect(sequenceTarget(diagram, 'C')).toEqual({ type: 'element', id: 'C', label: 'Client' })
    expect(sequenceTarget(diagram, 'step:99')).toBeNull()
  })
})
