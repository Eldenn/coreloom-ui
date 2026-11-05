// What people type into a diagram's names, and what happens when they switch formats: a name like
// "Order #42 (v2)" written by the properties panel must read back the same in Mermaid and PlantUML,
// and must not make PlantUML text look like another kind of diagram. Each case builds a diagram
// as the editor's tools would, writes it in a format, reads it back, and compares.
import { describe, expect, it } from 'vitest'

import { parseUmlValue, type UmlSpec } from '@/lib/uml'
import { isMermaidSpec, parseMermaid, toMermaid } from '@/lib/uml-mermaid'
import { parsePlantUml, toPlantUml } from '@/lib/uml-plantuml'

/** Names people give things: a number sign, brackets, braces, a pipe, quotes, accents. */
const NAMES = [
  'Order #42 (v2)',
  'Prix : 10 € {TTC}',
  'Card | cash',
  'Say "hi"',
  'Mise à jour',
  'a -> b',
] as const

/** Sorts keys and lists, so two diagrams that say the same compare equal. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(canonical).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    )
  return value
}

/** The diagram read back, without a direction the writer chose when the diagram had none. */
function readBack(original: UmlSpec, read: UmlSpec | null): unknown {
  if (!read) return null
  if ('direction' in original) return canonical(read)
  const { direction: _chosen, ...rest } = read as UmlSpec & { direction?: unknown }
  return canonical(rest)
}

/** One diagram of each kind, with `name` everywhere a person can type text. */
function diagramsNamed(name: string): UmlSpec[] {
  return [
    {
      kind: 'class',
      title: name,
      classes: [{ id: 'A', label: name }, { id: 'B' }],
      relations: [{ from: 'A', to: 'B', kind: 'association', label: name }],
    },
    {
      kind: 'state',
      states: [{ id: 'S1', label: name, description: name }, { id: 'S2' }],
      transitions: [{ from: 'S1', to: 'S2', label: name }],
      notes: [{ text: name, for: 'S1' }],
    },
    {
      kind: 'er',
      entities: [{ id: 'E1', label: name }, { id: 'E2' }],
      relations: [
        {
          from: 'E1',
          to: 'E2',
          fromCardinality: 'exactlyOne',
          toCardinality: 'zeroOrMore',
          label: name,
        },
      ],
    },
    {
      kind: 'sequence',
      participants: [
        { id: 'P', label: name },
        { id: 'Q', kind: 'actor' },
      ],
      steps: [
        { type: 'message', from: 'P', to: 'Q', text: name, arrow: 'sync' },
        {
          type: 'block',
          kind: 'alt',
          sections: [
            {
              label: name,
              steps: [{ type: 'message', from: 'Q', to: 'P', text: 'ok', arrow: 'reply' }],
            },
          ],
        },
      ],
    },
    {
      kind: 'c4',
      level: 'container',
      elements: [
        { id: 'web', kind: 'container', label: name, technology: name, boundary: 'b' },
        { id: 'user', kind: 'person', label: 'User' },
      ],
      boundaries: [{ id: 'b', label: name, kind: 'system' }],
      relations: [{ from: 'user', to: 'web', label: name }],
    },
    {
      kind: 'activity',
      elements: [
        { id: 'a1', kind: 'action', label: name },
        { id: 'd', kind: 'decision', label: name },
        { id: 'a2', kind: 'action', label: 'Ship' },
      ],
      relations: [
        { from: 'a1', to: 'd' },
        { from: 'd', to: 'a2', label: name },
      ],
    },
    {
      kind: 'usecase',
      elements: [
        { id: 'u1', kind: 'actor', label: name },
        { id: 's', kind: 'system', label: name },
        { id: 'u2', kind: 'usecase', label: name, parent: 's' },
      ],
      relations: [{ from: 'u1', to: 'u2' }],
    },
    {
      kind: 'deployment',
      elements: [
        { id: 'n1', kind: 'node', label: name },
        { id: 'db', kind: 'database', label: name, parent: 'n1' },
      ],
      relations: [{ from: 'n1', to: 'db', label: name }],
    },
    {
      kind: 'component',
      elements: [
        { id: 'k1', kind: 'component', label: name },
        { id: 'i1', kind: 'interface', label: name },
      ],
      relations: [{ from: 'k1', to: 'i1', label: name }],
    },
    {
      kind: 'package',
      elements: [
        { id: 'p1', kind: 'package', label: name },
        { id: 'p2', kind: 'class', label: name, parent: 'p1' },
      ],
      relations: [],
    },
  ] as UmlSpec[]
}

/** PlantUML has no `"` inside a quoted name: the writer puts `'` instead, by design. */
const PLANTUML_KEEPS_QUOTES = (name: string) => !name.includes('"')

describe.each(NAMES)('a name people typed: %s', (name) => {
  const diagrams = diagramsNamed(name)

  it('is a valid diagram to begin with', () => {
    for (const d of diagrams) expect(parseUmlValue(d).problems).toEqual([])
  })

  it.each(diagrams.filter(isMermaidSpec).map((d) => [d.kind, d] as const))(
    'reads back the same from Mermaid (%s)',
    (_kind, d) => {
      const back = parseMermaid(toMermaid(d))
      expect(back.problems).toEqual([])
      expect(readBack(d, back.diagram)).toEqual(canonical(d))
    },
  )

  it.each(diagrams.filter((d) => d.kind !== 'activity').map((d) => [d.kind, d] as const))(
    'reads back as the same kind of diagram from PlantUML (%s)',
    (kind, d) => {
      const back = parsePlantUml(toPlantUml(d))
      expect(back.problems).toEqual([])
      expect(back.diagram?.kind).toBe(kind)
      if (PLANTUML_KEEPS_QUOTES(name)) expect(readBack(d, back.diagram)).toEqual(canonical(d))
    },
  )
})

describe('PlantUML that people write', () => {
  it('reads an entity with no attributes, and an entity’s name', () => {
    const back = parsePlantUml(`@startuml
entity "Customer account" as Customer {
  *id : uuid <<PK>>
}
entity Order
entity Invoice as "Monthly invoice"
Customer ||--o{ Order : places
@enduml`)
    expect(back.problems).toEqual([])
    expect(back.diagram).toMatchObject({
      kind: 'er',
      entities: [
        { id: 'Customer', label: 'Customer account' },
        { id: 'Order' },
        { id: 'Invoice', label: 'Monthly invoice' },
      ],
    })
  })

  it('takes colours off a declaration, not off the name or what follows the colon', () => {
    const back = parsePlantUml(`@startuml
state "Order #42" as Placed #pink
Placed : waits for payment #3
Placed --> Paid : card #1
@enduml`)
    expect(back.problems).toEqual([])
    expect(back.diagram).toMatchObject({
      kind: 'state',
      states: [{ id: 'Placed', label: 'Order #42', description: 'waits for payment #3' }, {}],
      transitions: [{ from: 'Placed', to: 'Paid', label: 'card #1' }],
    })
  })

  it('keeps a node’s name whole when it holds a number sign', () => {
    const back = parsePlantUml(`@startuml
node "Server #2" as s2 #lightblue
component "Cart #1" as cart
@enduml`)
    expect(back.diagram).toMatchObject({
      elements: [
        { id: 's2', label: 'Server #2' },
        { id: 'cart', label: 'Cart #1' },
      ],
    })
  })

  it('isn’t fooled by brackets in a title, a name or a message', () => {
    expect(
      parsePlantUml(`@startuml
title Checkout (v2)
participant "Bank (external)" as Bank
Shop -> Bank : pay (card)
alt refused (fraud)
  Bank --> Shop : no
end
@enduml`).diagram?.kind,
    ).toBe('sequence')
    expect(
      parsePlantUml(`@startuml
class "Order (v2)" as Order
class Line
Order --> Line
@enduml`).diagram?.kind,
    ).toBe('class')
  })
})

describe('Mermaid flowcharts that people write', () => {
  it('reads quoted text holding brackets, braces and pipes', () => {
    const back = parseMermaid(`flowchart TB
  A("Order (v2)") --> B{"Paid {card}?"}
  B -->|"yes | partly"| C["List [all]"]`)
    expect(back.problems).toEqual([])
    expect(back.diagram).toMatchObject({
      kind: 'activity',
      elements: [
        { id: 'A', label: 'Order (v2)' },
        { id: 'B', kind: 'decision', label: 'Paid {card}?' },
        { id: 'C', label: 'List [all]' },
      ],
      relations: [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C', label: 'yes | partly' },
      ],
    })
  })

  it('turns #quot; back into quotes in class and entity names', () => {
    expect(parseMermaid('classDiagram\n  class A["Say #quot;hi#quot;"]').diagram).toMatchObject({
      classes: [{ id: 'A', label: 'Say "hi"' }],
    })
    expect(
      parseMermaid('erDiagram\n  E["Say #quot;hi#quot;"] {\n    string n "a #quot;b#quot;"\n  }')
        .diagram,
    ).toMatchObject({
      entities: [{ id: 'E', label: 'Say "hi"', attributes: [{ comment: 'a "b"' }] }],
    })
  })
})
