import { describe, expect, it } from 'vitest'

import {
  type ClassDiagram,
  parseUmlJson,
  parseUmlValue,
  type SequenceDiagram,
  type StateDiagram,
  toUmlJson,
  type UmlSpec,
} from '@/lib/uml'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'
import { parseMember } from '@/lib/uml-mermaid-class'
import { macroArgs } from '@/lib/uml-text'

/** Parses text that must be problem-free and returns its diagram. */
function read<K extends UmlSpec['kind']>(text: string, kind: K): Extract<UmlSpec, { kind: K }> {
  const result = parseMermaid(text)
  expect(result.problems).toEqual([])
  const d = result.diagram
  if (!isKind(d, kind)) throw new Error(`expected a ${kind} diagram`)
  return d
}

function isKind<K extends UmlSpec['kind']>(
  d: UmlSpec | null,
  kind: K,
): d is Extract<UmlSpec, { kind: K }> {
  return d?.kind === kind
}

function fail(): never {
  throw new Error('no diagram')
}

/** Writing a diagram and reading it back gives the same diagram. */
function roundTrip(diagram: UmlSpec) {
  const again = parseMermaid(toMermaid(diagram))
  expect(again.problems).toEqual([])
  expect(again.diagram).toEqual(diagram)
}

/** For writers that group by scope: same states and transitions in any order, and stable text. */
function roundTripState(diagram: StateDiagram) {
  const text = toMermaid(diagram)
  const again = read(text, 'state')
  const key = (x: object) => JSON.stringify(x, Object.keys(x).sort())
  expect(again.states.map(key).sort()).toEqual(diagram.states.map(key).sort())
  expect(again.transitions.map(key).sort()).toEqual(diagram.transitions.map(key).sort())
  expect(again.notes).toEqual(diagram.notes)
  expect(toMermaid(again)).toBe(text)
}

describe('parseMermaid · class diagrams', () => {
  const text = `---
title: Orders
---
classDiagram
  direction LR
  %% the domain
  class Order {
    <<entity>>
    +String id
    -List~LineItem~ items
    +total() Money
    +create()$ Order
    #validate()* bool
  }
  class Repository~T~
  <<interface>> Repository
  Customer "1" --> "*" Order : places
  Order *-- LineItem
  Repository~T~ <|.. OrderRepository
  Animal <|-- Duck
  Duck : +swim()
  note for Order "Paid orders\\nare final"
  namespace Billing {
    class Invoice
  }`

  it('reads classes, members, generics and stereotypes', () => {
    const d = read(text, 'class')
    expect(d.title).toBe('Orders')
    expect(d.direction).toBe('LR')
    const order = d.classes.find((c) => c.id === 'Order')
    expect(order?.stereotype).toBe('entity')
    expect(order?.attributes).toEqual([
      { text: 'String id', visibility: 'public' },
      { text: 'List~LineItem~ items', visibility: 'private' },
    ])
    expect(order?.methods).toEqual([
      { text: 'total() Money', visibility: 'public' },
      { text: 'create() Order', visibility: 'public', static: true },
      { text: 'validate() bool', visibility: 'protected', abstract: true },
    ])
    expect(d.classes.find((c) => c.id === 'Repository')).toMatchObject({
      generic: 'T',
      stereotype: 'interface',
    })
    expect(d.classes.find((c) => c.id === 'Invoice')?.namespace).toBe('Billing')
    expect(d.notes).toEqual([{ for: 'Order', text: 'Paid orders\nare final' }])
  })

  it('puts the marker at `to`, whichever side it was written on', () => {
    const d = read(text, 'class')
    expect(d.relations).toEqual([
      {
        from: 'Customer',
        to: 'Order',
        kind: 'association',
        label: 'places',
        fromCardinality: '1',
        toCardinality: '*',
      },
      { from: 'LineItem', to: 'Order', kind: 'composition' },
      { from: 'OrderRepository', to: 'Repository', kind: 'realization' },
      { from: 'Duck', to: 'Animal', kind: 'inheritance' },
    ])
    expect(read('classDiagram\n  Duck --|> Animal', 'class').relations[0]).toEqual({
      from: 'Duck',
      to: 'Animal',
      kind: 'inheritance',
    })
  })

  it('creates the classes a relation names', () => {
    const d = read('classDiagram\n  A ..> B\n  B -- C\n  C .. D', 'class')
    expect(d.classes.map((c) => c.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(d.relations.map((r) => r.kind)).toEqual(['dependency', 'link', 'dashedLink'])
  })

  it('round-trips', () => {
    roundTrip(parseMermaid(text).diagram ?? fail())
  })

  it('reports what it can’t read, by line, and still draws the rest', () => {
    const result = parseMermaid(
      'classDiagram\n  class A\n  this is not uml\n  style A fill:#f00\n  class B {',
    )
    expect(result.diagram?.kind).toBe('class')
    expect(result.problems).toEqual([
      { line: 3, severity: 'error', code: 'syntax', text: 'this is not uml' },
      { line: 4, severity: 'warning', code: 'unsupported', text: 'style A fill:#f00' },
      { line: 5, severity: 'error', code: 'unclosed', text: 'class B {' },
    ])
  })

  it('parses member visibility and classifiers', () => {
    expect(parseMember('~int count')).toEqual({ text: 'int count', visibility: 'package' })
    expect(parseMember('String name$')).toEqual({ text: 'String name', static: true })
    expect(parseMember('draw()*')).toEqual({ text: 'draw()', abstract: true })
  })
})

describe('parseMermaid · state diagrams', () => {
  const text = `stateDiagram-v2
  [*] --> Draft
  state "In review" as Review
  Draft --> Review : submit
  Review --> Draft : changes requested
  Review --> check
  state check <<choice>>
  check --> Published : approved
  check --> Rejected : declined
  Published : visible to everyone
  state Published {
    [*] --> Live
    Live --> Archived : after a year
    Archived --> [*]
  }
  Rejected --> [*]
  note right of Draft : only the author sees it`

  it('reads states, composites, pseudo-states and transitions', () => {
    const d = read(text, 'state')
    expect(d.states.find((s) => s.id === 'Review')?.label).toBe('In review')
    expect(d.states.find((s) => s.id === 'check')?.kind).toBe('choice')
    expect(d.states.find((s) => s.id === 'Published')?.description).toBe('visible to everyone')
    expect(d.states.find((s) => s.id === 'Live')?.parent).toBe('Published')
    expect(d.transitions[0]).toEqual({ from: '[*]', to: 'Draft' })
    expect(d.transitions).toContainEqual({ from: '[*]', to: 'Live', parent: 'Published' })
    expect(d.transitions).toContainEqual({ from: 'Archived', to: '[*]', parent: 'Published' })
    expect(d.notes).toEqual([{ for: 'Draft', text: 'only the author sees it' }])
  })

  it('round-trips', () => {
    roundTripState(read(text, 'state'))
  })

  it('reads multi-line notes and flags concurrent regions', () => {
    const result = parseMermaid(
      'stateDiagram\n  note left of A\n    first\n    second\n  end note\n  state B {\n    C\n    --\n    D\n  }',
    )
    const d = result.diagram as StateDiagram
    expect(d.notes).toEqual([{ for: 'A', text: 'first\nsecond' }])
    expect(result.problems).toEqual([
      { line: 8, severity: 'warning', code: 'unsupported', text: '--' },
    ])
  })
})

describe('parseMermaid · entity–relationship diagrams', () => {
  const text = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT |o..o{ LINE_ITEM : "appears in"
  CUSTOMER["Customer"] {
    string id PK
    string email UK "login"
    string name
  }
  ORDER {
    int id PK
    string customer_id FK
  }`

  it('reads entities, attributes and cardinalities', () => {
    const d = read(text, 'er')
    expect(d.entities.map((e) => e.id)).toEqual(['CUSTOMER', 'ORDER', 'LINE_ITEM', 'PRODUCT'])
    expect(d.entities[0]).toEqual({
      id: 'CUSTOMER',
      label: 'Customer',
      attributes: [
        { type: 'string', name: 'id', keys: ['PK'] },
        { type: 'string', name: 'email', keys: ['UK'], comment: 'login' },
        { type: 'string', name: 'name' },
      ],
    })
    expect(d.relations[0]).toEqual({
      from: 'CUSTOMER',
      to: 'ORDER',
      fromCardinality: 'exactlyOne',
      toCardinality: 'zeroOrMore',
      label: 'places',
    })
    expect(d.relations[2]).toMatchObject({
      fromCardinality: 'zeroOrOne',
      toCardinality: 'zeroOrMore',
      label: 'appears in',
      identifying: false,
    })
  })

  it('round-trips', () => {
    roundTrip(parseMermaid(text).diagram ?? fail())
  })
})

describe('parseMermaid · sequence diagrams', () => {
  const text = `sequenceDiagram
  title Checkout
  autonumber
  actor U as Shopper
  participant W as Web app
  participant API
  U->>W: Pay
  W->>+API: POST /payments
  alt card accepted
    API-->>W: 201 Created
  else declined
    API-->>W: 402<br/>Payment required
  end
  API--)W: webhook
  deactivate API
  loop every 5 s
    W-xAPI: GET /status
  end
  Note over W,API: idempotency key
  Note right of U: waits`

  it('reads participants, messages, blocks and notes', () => {
    const d = read(text, 'sequence')
    expect(d.title).toBe('Checkout')
    expect(d.autonumber).toBe(true)
    expect(d.participants).toEqual([
      { id: 'U', label: 'Shopper', kind: 'actor' },
      { id: 'W', label: 'Web app' },
      { id: 'API' },
    ])
    expect(d.steps[1]).toEqual({
      type: 'message',
      from: 'W',
      to: 'API',
      text: 'POST /payments',
      arrow: 'sync',
      activate: true,
    })
    expect(d.steps[2]).toMatchObject({ type: 'block', kind: 'alt' })
    const alt = d.steps[2]
    if (alt.type !== 'block') throw new Error('expected a block')
    expect(alt.sections.map((s) => s.label)).toEqual(['card accepted', 'declined'])
    expect(alt.sections[1]?.steps[0]).toMatchObject({
      text: '402\nPayment required',
      arrow: 'reply',
    })
    expect(d.steps[3]).toMatchObject({ arrow: 'dottedAsync' })
    expect(d.steps[4]).toEqual({ type: 'activation', participant: 'API', active: false })
    expect(d.steps.at(-2)).toEqual({
      type: 'note',
      position: 'over',
      participants: ['W', 'API'],
      text: 'idempotency key',
    })
  })

  it('round-trips', () => {
    roundTrip(parseMermaid(text).diagram ?? fail())
  })

  it('closes an unclosed block and keeps its steps', () => {
    const result = parseMermaid('sequenceDiagram\n  loop retry\n    A->>B: ping')
    expect(result.problems).toMatchObject([{ line: 2, code: 'unclosed' }])
    const d = result.diagram as SequenceDiagram
    expect(d.steps[0]).toMatchObject({ type: 'block', sections: [{ steps: [{ text: 'ping' }] }] })
  })

  it('flags a stray end or else', () => {
    const result = parseMermaid('sequenceDiagram\n  A->>B: hi\n  else\n  end')
    expect(result.problems.map((p) => p.code)).toEqual(['unexpected', 'unexpected'])
  })
})

describe('parseMermaid · C4', () => {
  const text = `C4Container
  title Internet banking
  Person(customer, "Customer", "A bank customer")
  System_Ext(mail, "Mail system")
  System_Boundary(bank, "Internet banking") {
    Container(web, "Web app", "React", "Delivers the SPA")
    ContainerDb(db, "Database", "PostgreSQL")
    ContainerQueue_Ext(queue, "Events", "Kafka")
  }
  Rel(customer, web, "Uses", "HTTPS")
  BiRel(web, db, "Reads and writes")
  Rel_Back(mail, customer, "Sends e-mails to")
  UpdateRelStyle(customer, web, $textColor="red")`

  it('reads elements, boundaries and relations', () => {
    const result = parseMermaid(text)
    expect(result.problems).toMatchObject([{ line: 13, code: 'unsupported', severity: 'warning' }])
    const d = result.diagram
    if (d?.kind !== 'c4') throw new Error('expected C4')
    expect(d.level).toBe('container')
    expect(d.title).toBe('Internet banking')
    expect(d.elements).toEqual([
      { id: 'customer', label: 'Customer', kind: 'person', description: 'A bank customer' },
      { id: 'mail', label: 'Mail system', kind: 'system', external: true },
      {
        id: 'web',
        label: 'Web app',
        kind: 'container',
        technology: 'React',
        description: 'Delivers the SPA',
        boundary: 'bank',
      },
      {
        id: 'db',
        label: 'Database',
        kind: 'container',
        shape: 'database',
        technology: 'PostgreSQL',
        boundary: 'bank',
      },
      {
        id: 'queue',
        label: 'Events',
        kind: 'container',
        shape: 'queue',
        external: true,
        technology: 'Kafka',
        boundary: 'bank',
      },
    ])
    expect(d.boundaries).toEqual([{ id: 'bank', label: 'Internet banking', kind: 'system' }])
    expect(d.relations[0]).toEqual({
      from: 'customer',
      to: 'web',
      label: 'Uses',
      technology: 'HTTPS',
    })
    expect(d.relations[1]).toMatchObject({ bidirectional: true })
  })

  it('round-trips', () => {
    const d = parseMermaid(text.split('\n').slice(0, -1).join('\n')).diagram
    if (!d) throw new Error('no diagram')
    roundTrip(d)
  })

  it('splits macro arguments outside quotes only', () => {
    expect(macroArgs('a, "b, c", d, $tags="x"')).toEqual(['a', 'b, c', 'd'])
  })
})

describe('parseMermaid · headers and hostile input', () => {
  it('says when the text is empty or the type unknown', () => {
    expect(parseMermaid('  \n %% only a comment')).toEqual({
      diagram: null,
      problems: [{ line: 0, severity: 'error', code: 'empty' }],
    })
    expect(parseMermaid('pie title Pets\n  "Dogs" : 386')).toEqual({
      diagram: null,
      problems: [{ line: 1, severity: 'error', code: 'header', text: 'pie title Pets' }],
    })
  })

  it('treats markup as text', () => {
    const d = read('classDiagram\n  class A["<img src=x onerror=alert(1)>"]', 'class')
    expect(d.classes[0]?.label).toBe('<img src=x onerror=alert(1)>')
  })

  it('survives long and odd input without throwing', () => {
    const noise = Array.from(
      { length: 2000 },
      (_, i) => `${'}'.repeat(i % 3)}<<${'-'.repeat(i % 7)}>>`,
    ).join('\n')
    for (const header of [
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'sequenceDiagram',
      'C4Context',
    ]) {
      expect(() => parseMermaid(`${header}\n${noise}`)).not.toThrow()
    }
  })
})

describe('parseUmlJson', () => {
  it('reads a valid diagram and writes it back', () => {
    const diagram: ClassDiagram = {
      kind: 'class',
      classes: [{ id: 'A' }, { id: 'B' }],
      relations: [{ from: 'B', to: 'A', kind: 'inheritance' }],
      layout: { A: { x: 10, y: 20 } },
    }
    expect(parseUmlJson(toUmlJson(diagram))).toEqual({ diagram, problems: [] })
  })

  it('reports broken JSON and wrong shapes with the path', () => {
    expect(parseUmlJson('{ nope')).toMatchObject({ diagram: null, problems: [{ code: 'json' }] })
    const wrong = parseUmlValue({ kind: 'class', classes: [{ id: '' }], relations: [] })
    expect(wrong.diagram).toBeNull()
    expect(wrong.problems[0]).toMatchObject({
      code: 'schema',
      text: expect.stringContaining('classes.0.id') as unknown,
    })
    expect(parseUmlValue({ kind: 'flowchart' }).diagram).toBeNull()
    expect(parseUmlValue(null).diagram).toBeNull()
  })

  it('checks nested sequence blocks', () => {
    const ok = parseUmlValue({
      kind: 'sequence',
      participants: [],
      steps: [
        {
          type: 'block',
          kind: 'loop',
          sections: [
            { label: 'x', steps: [{ type: 'activation', participant: 'A', active: true }] },
          ],
        },
      ],
    })
    expect(ok.problems).toEqual([])
    const bad = parseUmlValue({
      kind: 'sequence',
      participants: [],
      steps: [
        { type: 'block', kind: 'loop', sections: [{ label: 'x', steps: [{ type: 'oops' }] }] },
      ],
    })
    expect(bad.diagram).toBeNull()
  })
})
