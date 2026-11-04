import { describe, expect, it } from 'vitest'

import type { UmlSpec } from '@/lib/uml'
import { isPlantUml, parsePlantUml, toPlantUml } from '@/lib/uml-plantuml'

/** Parses text that must be problem-free and returns its diagram. */
function read<K extends UmlSpec['kind']>(text: string, kind: K): Extract<UmlSpec, { kind: K }> {
  const result = parsePlantUml(text)
  expect(result.problems).toEqual([])
  const d = result.diagram
  if (d?.kind !== kind) throw new Error(`expected a ${kind} diagram, got ${String(d?.kind)}`)
  return d as Extract<UmlSpec, { kind: K }>
}

/** Writes a diagram and reads it back. */
function roundTrip<K extends UmlSpec['kind']>(d: Extract<UmlSpec, { kind: K }>, kind: K) {
  return read(toPlantUml(d), kind)
}

describe('isPlantUml', () => {
  it('knows @startuml, with or without a leading comment', () => {
    expect(isPlantUml('@startuml\nA -> B\n@enduml')).toBe(true)
    expect(isPlantUml("' a comment\n@startuml")).toBe(true)
    expect(isPlantUml('classDiagram\n  class A')).toBe(false)
  })
})

describe('parsePlantUml: classes, states, sequences, entities', () => {
  it('reads classes with members, an interface and relations', () => {
    const d = read(
      `@startuml
title Shop
interface Payable
class Order {
  -String id
  +total() : Money
}
Order ..|> Payable
Order "1" *-- "many" LineItem : holds
@enduml`,
      'class',
    )
    expect(d.title).toBe('Shop')
    expect(d.classes.find((c) => c.id === 'Payable')?.stereotype).toBe('interface')
    const order = d.classes.find((c) => c.id === 'Order')
    expect(order?.attributes?.[0]).toMatchObject({ visibility: 'private' })
    expect(order?.methods).toHaveLength(1)
    expect(d.relations).toContainEqual(
      expect.objectContaining({ from: 'Order', to: 'Payable', kind: 'realization' }),
    )
    expect(d.relations).toContainEqual(
      expect.objectContaining({ kind: 'composition', label: 'holds' }),
    )
  })

  it('reads states with a composite state and start and end', () => {
    const d = read(
      `@startuml
[*] --> Draft
state Review {
  [*] --> Reading
}
Draft --> Review : submit
Review --> [*]
@enduml`,
      'state',
    )
    expect(d.states.map((s) => s.id)).toEqual(
      expect.arrayContaining(['Draft', 'Review', 'Reading']),
    )
    expect(d.states.find((s) => s.id === 'Reading')?.parent).toBe('Review')
    expect(d.transitions).toContainEqual(expect.objectContaining({ label: 'submit' }))
  })

  it('reads a sequence with participants, messages and an alt block', () => {
    const d = read(
      `@startuml
actor User
participant "Web app" as Web
User -> Web : open
alt signed in
  Web --> User : home
else
  Web --> User : sign in
end
@enduml`,
      'sequence',
    )
    expect(d.participants).toEqual([
      expect.objectContaining({ id: 'User', kind: 'actor' }),
      expect.objectContaining({ id: 'Web', label: 'Web app' }),
    ])
    expect(d.steps[0]).toMatchObject({ type: 'message', from: 'User', to: 'Web', text: 'open' })
    expect(d.steps[1]).toMatchObject({ type: 'block', kind: 'alt' })
  })

  it('reads entities with keys and crow’s feet', () => {
    const d = read(
      `@startuml
entity Customer {
  *id : uuid <<PK>>
  email : text
}
entity Order {
  *id : uuid <<PK>>
  customer_id : uuid <<FK>>
}
Customer ||--o{ Order : places
@enduml`,
      'er',
    )
    expect(d.entities.find((e) => e.id === 'Order')?.attributes?.[1]?.keys).toEqual(['FK'])
    expect(d.relations[0]).toMatchObject({ from: 'Customer', to: 'Order', label: 'places' })
  })

  it('reads C4-PlantUML macros', () => {
    const d = read(
      `@startuml
!include <C4/C4_Container>
Person(user, "User")
System_Boundary(app, "App") {
  Container(api, "API", "Go")
}
Rel(user, api, "Uses", "HTTPS")
@enduml`,
      'c4',
    )
    expect(d.level).toBe('container')
    expect(d.relations).toHaveLength(1)
  })
})

describe('parsePlantUml: use case and deployment', () => {
  it('reads actors, use cases in a system, include and extend', () => {
    const d = read(
      `@startuml
left to right direction
actor Customer
rectangle Shop {
  usecase "Place an order" as Order
  (Pay) as Pay
}
Customer -- Order
Order ..> Pay : <<include>>
(Coupon) .> Order : <<extend>>
@enduml`,
      'usecase',
    )
    expect(d.direction).toBe('LR')
    expect(d.elements).toContainEqual({ id: 'Customer', kind: 'actor' })
    expect(d.elements.find((e) => e.id === 'Order')).toMatchObject({
      kind: 'usecase',
      label: 'Place an order',
      parent: 'Shop',
    })
    expect(d.elements.find((e) => e.id === 'Pay')?.parent).toBe('Shop')
    expect(d.relations.map((r) => r.kind ?? 'association')).toEqual([
      'association',
      'include',
      'extend',
    ])
  })

  it('reads nested nodes, keywords and link kinds', () => {
    const d = read(
      `@startuml
node "App server" as app <<executionEnvironment>> {
  artifact "api.jar" as api
}
node phone <<device>>
database db
phone -- app : HTTPS
api ..> db
@enduml`,
      'deployment',
    )
    expect(d.elements.find((e) => e.id === 'app')?.kind).toBe('environment')
    expect(d.elements.find((e) => e.id === 'phone')?.kind).toBe('device')
    expect(d.elements.find((e) => e.id === 'api')?.parent).toBe('app')
    expect(d.relations[0]).toMatchObject({ from: 'phone', to: 'app', label: 'HTTPS' })
    expect(d.relations[1]?.kind).toBe('dependency')
  })

  it('writes use case and deployment diagrams that read back the same', () => {
    const usecase = read(
      `@startuml
actor Customer
rectangle Shop {
  usecase "Place an order" as Order
}
Customer -- Order
@enduml`,
      'usecase',
    )
    // No direction: drawn left to right, and written so that PlantUML draws it the same way.
    expect(roundTrip(usecase, 'usecase')).toEqual({ ...usecase, direction: 'LR' })
    const topDown = { ...usecase, direction: 'TB' as const }
    expect(roundTrip(topDown, 'usecase')).toEqual(topDown)
    const deployment = read(
      `@startuml
cloud aws {
  node web
  database "Orders DB" as db
}
web -- db : JDBC
@enduml`,
      'deployment',
    )
    expect(roundTrip(deployment, 'deployment')).toEqual(deployment)
  })
})

describe('parsePlantUml: activities', () => {
  it('reads start, actions, if/else, and stop', () => {
    const d = read(
      `@startuml
start
:Fill the cart;
if (Paid?) then (yes)
  :Ship the order;
else (no)
  :Cancel;
endif
stop
@enduml`,
      'activity',
    )
    const kinds = d.elements.map((e) => e.kind)
    expect(kinds).toEqual(expect.arrayContaining(['start', 'action', 'decision', 'merge', 'end']))
    expect(d.elements.filter((e) => e.kind === 'action').map((e) => e.label)).toEqual([
      'Fill the cart',
      'Ship the order',
      'Cancel',
    ])
    expect(d.relations.map((r) => r.label).filter(Boolean)).toEqual(['yes', 'no'])
    // Every element is connected: nothing floats.
    const touched = new Set(d.relations.flatMap((r) => [r.from, r.to]))
    expect(d.elements.every((e) => touched.has(e.id))).toBe(true)
  })

  it('reads fork, while and partitions', () => {
    const d = read(
      `@startuml
start
partition Warehouse {
  fork
    :Pack;
  fork again
    :Print the label;
  end fork
}
while (More items?) is (yes)
  :Scan;
endwhile (no)
stop
@enduml`,
      'activity',
    )
    const kinds = d.elements.map((e) => e.kind)
    expect(kinds).toEqual(expect.arrayContaining(['fork', 'join', 'partition', 'decision']))
    const pack = d.elements.find((e) => e.label === 'Pack')
    expect(pack?.parent).toBe(d.elements.find((e) => e.kind === 'partition')?.id)
  })
})

describe('parsePlantUml: hostile and odd input', () => {
  it('says when the kind can’t be told', () => {
    const r = parsePlantUml('@startuml\n@enduml')
    expect(r.diagram).toBeNull()
    expect(r.problems[0]?.severity).toBe('error')
  })

  it('sets styling aside with a warning and still draws', () => {
    const r = parsePlantUml('@startuml\nskinparam monochrome true\nclass A\n@enduml')
    expect(r.diagram?.kind).toBe('class')
    expect(r.problems.map((p) => p.severity)).toEqual(['warning'])
    expect(r.problems[0]?.line).toBe(2)
  })

  it('ignores comments, and marks lines it can’t read on their line', () => {
    const r = parsePlantUml(
      "@startuml\n' a comment\n/' a block\ncomment '/\nclass A\nclass B {\n@enduml",
    )
    expect(r.diagram?.kind).toBe('class')
    expect(r.problems.some((p) => p.severity === 'error')).toBe(true)
  })

  it('treats markup in names as text', () => {
    const d = read(
      '@startuml\nactor "<img src=x onerror=alert(1)>" as A\nusecase U\nA -- U\n@enduml',
      'usecase',
    )
    expect(d.elements[0]?.label).toBe('<img src=x onerror=alert(1)>')
  })

  it('doesn’t hang on a long run of brackets', () => {
    const text = `@startuml\n${'('.repeat(20000)}\n@enduml`
    const started = Date.now()
    parsePlantUml(text)
    expect(Date.now() - started).toBeLessThan(1000)
  })
})
