import { describe, expect, it } from 'vitest'

import { parseUmlValue, type UmlSpec } from '@/lib/uml'
import {
  addElement,
  addRelation,
  canDelete,
  deleteItems,
  elementTypes,
  relationTypes,
  toIdentifier,
  uniqueId,
} from '@/lib/uml-edit'
import {
  elementFields,
  relationFields,
  renameElement,
  reverseRelation,
  setElementFields,
  setRelationFields,
} from '@/lib/uml-edit-fields'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'

/** Parses text that must be problem-free and returns its diagram. */
function read<K extends UmlSpec['kind']>(text: string, kind: K): Extract<UmlSpec, { kind: K }> {
  const result = parseMermaid(text)
  expect(result.problems).toEqual([])
  const d = result.diagram
  if (d?.kind !== kind) throw new Error(`expected a ${kind} diagram`)
  return d as Extract<UmlSpec, { kind: K }>
}

/** The edited diagram still reads back, through Mermaid and the JSON schema, as the same diagram. */
function roundTrips(d: UmlSpec) {
  expect(parseUmlValue(JSON.parse(JSON.stringify(d))).problems).toEqual([])
  const again = parseMermaid(toMermaid(d))
  expect(again.problems).toEqual([])
  expect(toMermaid(again.diagram ?? d)).toBe(toMermaid(d))
}

const shop = () =>
  read(
    `classDiagram
  namespace Shop {
    class Order {
      +String id
      +place() void
    }
    class LineItem
  }
  class Customer
  Customer "1" --> "*" Order : places
  Order *-- LineItem
  note for Order "Paid orders can't change"`,
    'class',
  )

describe('names and ids', () => {
  it('makes a Mermaid id from any name', () => {
    expect(toIdentifier('Order')).toBe('Order')
    expect(toIdentifier('Classe abstraite')).toBe('ClasseAbstraite')
    expect(toIdentifier('État')).toBe('Etat')
    expect(toIdentifier('2nd step')).toBe('_2ndStep')
    expect(toIdentifier('«»', 'Class')).toBe('Class')
  })

  it('numbers an id that is taken', () => {
    expect(uniqueId('Class', new Set())).toBe('Class')
    expect(uniqueId('Class', new Set(['Class', 'Class2']))).toBe('Class3')
  })
})

describe('what each kind offers', () => {
  it('lists elements and relations per diagram kind, C4 by level', () => {
    expect(elementTypes(shop())).toContain('interface')
    expect(relationTypes(shop())[0]).toBe('association')
    const context = read('C4Context\n  Person(a, "A")', 'c4')
    expect(elementTypes(context)).not.toContain('container')
    const container = read('C4Container\n  Person(a, "A")', 'c4')
    expect(elementTypes(container)).toContain('database')
  })
})

describe('adding elements', () => {
  it('adds a class with a fresh id, next to the selected one', () => {
    const { diagram, id } = addElement(shop(), { type: 'interface', name: 'Order', near: 'Order' })
    expect(id).toBe('Order2')
    if (diagram.kind !== 'class') throw new Error('class')
    expect(diagram.classes.at(-1)).toEqual({
      id: 'Order2',
      stereotype: 'interface',
      namespace: 'Shop',
    })
    roundTrips(diagram)
  })

  it('puts a class inside a selected namespace, and pins a note to a class', () => {
    const inside = addElement(shop(), { type: 'class', name: 'Cart', near: 'namespace:Shop' })
    expect(inside.diagram.kind === 'class' && inside.diagram.classes.at(-1)?.namespace).toBe('Shop')
    const note = addElement(shop(), { type: 'note', name: 'Hello', near: 'Customer' })
    expect(note.id).toBe('note:1')
    expect(note.diagram.kind === 'class' && note.diagram.notes?.[1]).toEqual({
      text: 'Hello',
      for: 'Customer',
    })
    roundTrips(note.diagram)
  })

  it('adds a state inside a composite state, beside a simple one', () => {
    const d = read(
      `stateDiagram-v2
  state Active {
    [*] --> Idle
  }
  [*] --> Active`,
      'state',
    )
    const inside = addElement(d, { type: 'state', name: 'Busy', near: 'Active' })
    expect(inside.diagram.kind === 'state' && inside.diagram.states.at(-1)).toEqual({
      id: 'Busy',
      parent: 'Active',
    })
    const beside = addElement(d, { type: 'choice', name: 'Check', near: 'Idle' })
    expect(beside.diagram.kind === 'state' && beside.diagram.states.at(-1)).toEqual({
      id: 'Check',
      kind: 'choice',
      parent: 'Active',
    })
    roundTrips(beside.diagram)
  })

  it('adds an entity with a key, a participant, and C4 elements with labels', () => {
    const er = addElement(read('erDiagram\n  CUSTOMER', 'er'), { type: 'entity', name: 'Order' })
    expect(er.diagram.kind === 'er' && er.diagram.entities.at(-1)?.attributes).toEqual([
      { type: 'string', name: 'id', keys: ['PK'] },
    ])
    roundTrips(er.diagram)
    const seq = addElement(read('sequenceDiagram\n  participant A', 'sequence'), {
      type: 'actor',
      name: 'User',
    })
    expect(seq.diagram.kind === 'sequence' && seq.diagram.participants.at(-1)).toEqual({
      id: 'User',
      kind: 'actor',
    })
    const c4 = read(
      'C4Container\n  System_Boundary(b, "Shop") {\n    Container(api, "API", "Go")\n  }',
      'c4',
    )
    const db = addElement(c4, { type: 'database', name: 'Orders DB', near: 'api' })
    expect(db.id).toBe('ordersDB')
    expect(db.diagram.kind === 'c4' && db.diagram.elements.at(-1)).toEqual({
      id: 'ordersDB',
      label: 'Orders DB',
      kind: 'container',
      shape: 'database',
      boundary: 'b',
    })
    roundTrips(db.diagram)
    const boundary = addElement(c4, { type: 'boundary', name: 'Billing' })
    expect(boundary.diagram.kind === 'c4' && boundary.diagram.boundaries?.at(-1)).toEqual({
      id: 'billing',
      label: 'Billing',
    })
  })
})

describe('adding relations', () => {
  it('draws each kind of relation, and ignores unknown ends', () => {
    const cls = addRelation(shop(), { type: 'inheritance', from: 'LineItem', to: 'Customer' })
    expect(cls.kind === 'class' && cls.relations.at(-1)).toEqual({
      from: 'LineItem',
      to: 'Customer',
      kind: 'inheritance',
    })
    roundTrips(cls)
    expect(addRelation(shop(), { type: 'association', from: 'Nope', to: 'Order' })).toEqual(shop())
    expect(addRelation(shop(), { type: 'association', from: 'Shop', to: 'Order' })).toEqual(shop())

    const state = read('stateDiagram-v2\n  A --> B', 'state')
    const start = addRelation(state, { type: 'transition', from: '[*]', to: 'A', label: ' go ' })
    expect(start.kind === 'state' && start.transitions.at(-1)).toEqual({
      from: '[*]',
      to: 'A',
      label: 'go',
    })
    expect(addRelation(state, { type: 'transition', from: '[*]', to: '[*]' })).toBe(state)

    const er = addRelation(read('erDiagram\n  A\n  B', 'er'), {
      type: 'manyToMany',
      from: 'A',
      to: 'B',
      label: 'links',
    })
    expect(er.kind === 'er' && er.relations[0]).toMatchObject({
      fromCardinality: 'zeroOrMore',
      toCardinality: 'zeroOrMore',
    })
    roundTrips(er)

    const seq = addRelation(read('sequenceDiagram\n  participant A\n  participant B', 'sequence'), {
      type: 'reply',
      from: 'B',
      to: 'A',
      label: 'OK',
    })
    expect(seq.kind === 'sequence' && seq.steps.at(-1)).toEqual({
      type: 'message',
      from: 'B',
      to: 'A',
      text: 'OK',
      arrow: 'reply',
    })
    roundTrips(seq)

    const c4 = addRelation(read('C4Context\n  Person(a, "A")\n  System(b, "B")', 'c4'), {
      type: 'usesBoth',
      from: 'a',
      to: 'b',
    })
    expect(c4.kind === 'c4' && c4.relations[0]).toEqual({ from: 'a', to: 'b', bidirectional: true })
    roundTrips(c4)
  })
})

describe('deleting', () => {
  it('removes a class with its lines, notes and position', () => {
    const d = { ...shop(), layout: { Order: { x: 1, y: 2 }, Customer: { x: 3, y: 4 } } }
    const out = deleteItems(d, { elements: ['Order'], relations: [] })
    if (out.kind !== 'class') throw new Error('class')
    expect(out.classes.map((c) => c.id)).toEqual(['LineItem', 'Customer'])
    expect(out.relations).toEqual([])
    expect(out.notes).toBeUndefined()
    expect(out.layout).toEqual({ Customer: { x: 3, y: 4 } })
    roundTrips(out)
  })

  it('removes a relation by its index, and a namespace without its classes', () => {
    const out = deleteItems(shop(), { elements: ['namespace:Shop'], relations: [0] })
    if (out.kind !== 'class') throw new Error('class')
    expect(out.classes.every((c) => !c.namespace)).toBe(true)
    expect(out.relations.map((r) => r.kind)).toEqual(['composition'])
  })

  it('moves what a removed composite state or boundary held up a level', () => {
    const state = read(
      `stateDiagram-v2
  state Outer {
    state Inner {
      A --> B
    }
  }`,
      'state',
    )
    const out = deleteItems(state, { elements: ['Inner'], relations: [] })
    expect(out.kind === 'state' && out.states.find((s) => s.id === 'A')?.parent).toBe('Outer')
    expect(out.kind === 'state' && out.transitions[0]?.parent).toBeUndefined()
    roundTrips(out)
    const c4 = read(
      'C4Container\n  System_Boundary(b, "Shop") {\n    Container(api, "API", "Go")\n  }',
      'c4',
    )
    const flat = deleteItems(c4, { elements: ['b'], relations: [] })
    expect(flat.kind === 'c4' && flat.elements[0]?.boundary).toBeUndefined()
  })

  it('takes a participant’s messages, activations and notes with it, even inside blocks', () => {
    const d = read(
      `sequenceDiagram
  participant A
  participant B
  participant C
  A->>+B: Hi
  loop Every minute
    B->>C: Ping
    A->>B: Again
  end
  Note over B,C: Both
  deactivate B`,
      'sequence',
    )
    const out = deleteItems(d, { elements: ['C'], relations: [] })
    if (out.kind !== 'sequence') throw new Error('sequence')
    expect(out.participants.map((p) => p.id)).toEqual(['A', 'B'])
    const block = out.steps.find((s) => s.type === 'block')
    expect(block?.type === 'block' && block.sections[0]?.steps).toHaveLength(1)
    expect(out.steps.find((s) => s.type === 'note')).toMatchObject({ participants: ['B'] })
    roundTrips(out)
  })

  it('says whether there is anything to delete', () => {
    expect(canDelete(shop(), { elements: [], relations: [] })).toBe(false)
    expect(canDelete(shop(), { elements: ['nothing'], relations: [] })).toBe(false)
    expect(canDelete(shop(), { elements: ['note:0'], relations: [] })).toBe(true)
    expect(canDelete(shop(), { elements: [], relations: [1] })).toBe(true)
  })
})

describe('renaming', () => {
  it('changes the id everywhere when the name can be one', () => {
    const d = { ...shop(), layout: { Order: { x: 1, y: 2 } } }
    const { diagram, id } = renameElement(d, 'Order', 'Purchase')
    expect(id).toBe('Purchase')
    const text = toMermaid(diagram)
    expect(text).toContain('class Purchase {')
    expect(text).toContain('Customer "1" --> "*" Purchase : places')
    expect(text).toContain('Purchase *-- LineItem')
    expect(text).toContain('note for Purchase')
    expect(diagram.kind === 'class' && diagram.layout).toEqual({ Purchase: { x: 1, y: 2 } })
  })

  it('keeps the id and sets a label when the name can’t be an id or is taken', () => {
    const spaced = renameElement(shop(), 'Order', 'Paid order')
    expect(spaced.id).toBe('Order')
    expect(toMermaid(spaced.diagram)).toContain('class Order["Paid order"]')
    const taken = renameElement(shop(), 'Order', 'Customer')
    expect(taken.id).toBe('Order')
    // Back to the id: the label goes.
    expect(toMermaid(renameElement(spaced.diagram, 'Order', 'Order').diagram)).toContain(
      'class Order {',
    )
    expect(renameElement(shop(), 'Order', '   ').diagram).toEqual(shop())
  })

  it('renames states, participants and namespaces, and relabels C4 elements', () => {
    const state = read(
      'stateDiagram-v2\n  state Active {\n    A --> B\n  }\n  [*] --> Active',
      'state',
    )
    const s = renameElement(state, 'Active', 'Running').diagram
    expect(toMermaid(s)).toContain('state Running {')
    expect(toMermaid(s)).toContain('[*] --> Running')
    const seq = read(
      'sequenceDiagram\n  participant A\n  A->>A: Self\n  Note over A: Hm',
      'sequence',
    )
    const p = renameElement(seq, 'A', 'App').diagram
    expect(toMermaid(p)).toContain('App->>App: Self')
    expect(toMermaid(p)).toContain('Note over App: Hm')
    const ns = renameElement(shop(), 'namespace:Shop', 'Store')
    expect(ns.id).toBe('namespace:Store')
    expect(toMermaid(ns.diagram)).toContain('namespace Store {')
    const c4 = read('C4Context\n  Person(a, "A")', 'c4')
    expect(toMermaid(renameElement(c4, 'a', 'Shopper').diagram)).toContain('Person(a, "Shopper")')
  })
})

describe('element fields', () => {
  it('reads and writes a class’s stereotype and members', () => {
    expect(elementFields(shop(), 'Order')).toEqual({
      name: 'Order',
      stereotype: '',
      members: '+String id\n+place() void',
    })
    const { diagram } = setElementFields(shop(), 'Order', {
      name: 'Order',
      stereotype: 'entity',
      members: '+String id\n\n-total() Money$\n#int count',
    })
    const order = diagram.kind === 'class' ? diagram.classes.find((c) => c.id === 'Order') : null
    expect(order?.stereotype).toBe('entity')
    expect(order?.attributes?.map((m) => m.text)).toEqual(['String id', 'int count'])
    expect(order?.methods).toEqual([{ text: 'total() Money', visibility: 'private', static: true }])
    roundTrips(diagram)
  })

  it('reads and writes entity attributes loosely, and C4 details', () => {
    const er = read('erDiagram\n  CUSTOMER {\n    string id PK\n  }', 'er')
    expect(elementFields(er, 'CUSTOMER')).toEqual({ name: 'CUSTOMER', attributes: 'string id PK' })
    const out = setElementFields(er, 'CUSTOMER', {
      name: 'CUSTOMER',
      attributes: 'string id PK\nstring email UK "login"\nnot quite right!',
    }).diagram
    expect(out.kind === 'er' && out.entities[0]?.attributes).toEqual([
      { type: 'string', name: 'id', keys: ['PK'] },
      { type: 'string', name: 'email', keys: ['UK'], comment: 'login' },
      { type: 'not', name: 'quite_right!' },
    ])
    const c4 = read('C4Container\n  Container(api, "API", "Go")\n  System(s, "S")', 'c4')
    expect(elementFields(c4, 'api')).toEqual({ name: 'API', description: '', technology: 'Go' })
    expect(elementFields(c4, 's')).toEqual({ name: 'S', description: '', external: false })
    const ext = setElementFields(c4, 's', { name: 'Bank', description: 'Pays', external: true })
    expect(toMermaid(ext.diagram)).toContain('System_Ext(s, "Bank", "Pays")')
    expect(elementFields(c4, 'nope')).toBeNull()
  })

  it('edits a note’s text and a state’s description', () => {
    const note = setElementFields(shop(), 'note:0', { name: 'Final once paid' }).diagram
    expect(note.kind === 'class' && note.notes?.[0]?.text).toBe('Final once paid')
    const state = read('stateDiagram-v2\n  A --> B', 'state')
    expect(elementFields(state, 'A')).toEqual({ name: 'A', description: '' })
    const described = setElementFields(state, 'A', { name: 'A', description: 'Waiting' }).diagram
    expect(toMermaid(described)).toContain('A : Waiting')
  })
})

describe('relation fields', () => {
  it('changes a class relation’s kind, label and multiplicities, and reverses it', () => {
    expect(relationFields(shop(), 0)).toEqual({
      type: 'association',
      label: 'places',
      fromCardinality: '1',
      toCardinality: '*',
    })
    expect(relationFields(shop(), 9)).toBeNull()
    const changed = setRelationFields(shop(), 0, {
      type: 'aggregation',
      label: '',
      fromCardinality: '0..1',
      toCardinality: '',
    })
    expect(changed.kind === 'class' && changed.relations[0]).toEqual({
      from: 'Customer',
      to: 'Order',
      kind: 'aggregation',
      fromCardinality: '0..1',
    })
    const back = reverseRelation(shop(), 0)
    expect(back.kind === 'class' && back.relations[0]).toMatchObject({
      from: 'Order',
      to: 'Customer',
      fromCardinality: '*',
      toCardinality: '1',
    })
    roundTrips(changed)
  })

  it('changes ER ends and C4 technology, and leaves a start transition’s direction alone', () => {
    const er = read('erDiagram\n  A ||--o{ B : has', 'er')
    const out = setRelationFields(er, 0, {
      label: 'owns',
      fromEnd: 'zeroOrOne',
      toEnd: 'oneOrMore',
    })
    expect(toMermaid(out)).toContain('A |o--|{ B : "owns"')
    expect(toMermaid(reverseRelation(er, 0))).toContain('B }o--|| A')
    const c4 = read('C4Context\n  Person(a, "A")\n  System(b, "B")\n  Rel(a, b, "Uses")', 'c4')
    expect(relationFields(c4, 0)).toEqual({ type: 'uses', label: 'Uses', technology: '' })
    const both = setRelationFields(c4, 0, { type: 'usesBoth', label: 'Syncs', technology: 'HTTPS' })
    expect(toMermaid(both)).toContain('BiRel(a, b, "Syncs", "HTTPS")')
    const state = read('stateDiagram-v2\n  [*] --> A', 'state')
    expect(reverseRelation(state, 0)).toEqual(state)
  })
})
