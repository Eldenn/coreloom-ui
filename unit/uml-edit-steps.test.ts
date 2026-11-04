import { describe, expect, it } from 'vitest'

import { parseUmlValue, type UmlSpec } from '@/lib/uml'
import { alignBoxes, canAlign, clearLayout, setDirection } from '@/lib/uml-arrange'
import { addElement, canDelete, deleteItems } from '@/lib/uml-edit'
import { copyItems, duplicateItems, pasteItems } from '@/lib/uml-edit-clipboard'
import {
  addSection,
  insertAt,
  insertBlock,
  insertMessage,
  insertNote,
  moveStep,
  removeSection,
  setStep,
  stepIds,
  stepOf,
  stepPath,
} from '@/lib/uml-edit-sequence'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'
import { layoutSequence } from '@/lib/uml-sequence'

function read<K extends UmlSpec['kind']>(text: string, kind: K): Extract<UmlSpec, { kind: K }> {
  const result = parseMermaid(text)
  expect(result.problems).toEqual([])
  const d = result.diagram
  if (d?.kind !== kind) throw new Error(`expected a ${kind} diagram`)
  return d as Extract<UmlSpec, { kind: K }>
}

/** Still valid JSON for the schema, and Mermaid that reads back the same. */
function roundTrips(d: UmlSpec) {
  expect(parseUmlValue(JSON.parse(JSON.stringify(d))).problems).toEqual([])
  const again = parseMermaid(toMermaid(d))
  expect(again.problems).toEqual([])
  expect(toMermaid(again.diagram ?? d)).toBe(toMermaid(d))
}

const chat = () =>
  read(
    `sequenceDiagram
  actor User
  participant App
  participant Db
  User->>App: Sign in
  loop every second
    App->>Db: Poll
  end
  App-->>User: Welcome`,
    'sequence',
  )

describe('sequence steps', () => {
  it('names steps by where they are, blocks included', () => {
    const d = chat()
    expect(stepIds(d.steps)).toEqual(['step:0', 'step:1', 'step:1.0.0', 'step:2'])
    expect(stepPath('step:1.0.0')).toEqual([1, 0, 0])
    expect(stepPath('step:1.0')).toBeNull()
    expect(stepPath('note:1')).toBeNull()
    expect(stepOf(d, 'step:1.0.0')).toMatchObject({ type: 'message', text: 'Poll' })
    expect(stepOf(d, 'step:9')).toBeUndefined()
    expect(stepOf(d, 'step:0.0.0')).toBeUndefined()
    // The drawing carries the same ids, so a click picks the step.
    const ids = layoutSequence(d).items.flatMap((i) => ('id' in i ? [i.id] : []))
    expect(ids.sort()).toEqual(['step:0', 'step:1', 'step:1.0.0', 'step:2'])
  })

  it('adds a message after the selected step, or inside a selected block', () => {
    const after = insertMessage(chat(), { from: 'App', to: 'Db', text: 'Query' }, 'step:0')
    expect(after.id).toBe('step:1')
    expect(toMermaid(after.diagram)).toMatch(/Sign in\n {2}App->>Db: Query\n {2}loop/)
    const inside = insertMessage(chat(), { from: 'Db', to: 'App', arrow: 'reply' }, 'step:1')
    expect(inside.id).toBe('step:1.0.1')
    expect(toMermaid(inside.diagram)).toContain('    Db-->>App: \n  end')
    const end = insertMessage(chat(), { from: 'App', to: 'App', text: 'Log' })
    expect(end.id).toBe('step:3')
    const unknown = insertMessage(chat(), { from: 'App', to: 'Nobody' })
    expect(unknown.diagram).toEqual(chat())
    roundTrips(inside.diagram)
  })

  it('adds notes and blocks from the toolbar, a block going round the selected step', () => {
    const note = addElement(chat(), { type: 'note', name: 'Checks the token', near: 'step:0' })
    expect(note.id).toBe('step:1')
    expect(toMermaid(note.diagram)).toContain('Note over User,App: Checks the token')
    const onPerson = insertNote(chat(), 'Waits', 'Db')
    expect(toMermaid(onPerson.diagram)).toContain('Note right of Db: Waits')
    const wrapped = addElement(chat(), { type: 'alt', name: 'Alt', near: 'step:2' })
    expect(wrapped.id).toBe('step:2')
    expect(toMermaid(wrapped.diagram)).toMatch(/alt\n {4}App-->>User: Welcome\n {2}else\n {2}end/)
    roundTrips(wrapped.diagram)
    const empty = insertBlock(chat(), 'opt')
    expect(empty.id).toBe('step:3')
    roundTrips(empty.diagram)
  })

  it('changes, moves and removes steps and sections', () => {
    const d = chat()
    const changed = setStep(d, 'step:1.0.0', {
      type: 'message',
      from: 'App',
      to: 'Db',
      text: 'Poll',
      arrow: 'async',
      activate: true,
    })
    expect(toMermaid(changed)).toContain('App-)+Db: Poll')
    const up = moveStep(d, 'step:2', -1)
    expect(up.id).toBe('step:1')
    expect(toMermaid(up.diagram)).toMatch(/Sign in\n {2}App-->>User: Welcome\n {2}loop/)
    expect(moveStep(d, 'step:0', -1)).toEqual({ diagram: d, id: 'step:0' })
    expect(moveStep(d, 'step:1.0.0', 1).diagram).toEqual(d)

    const alt = insertBlock(d, 'alt', 'step:0').diagram
    const three = addSection(alt, 'step:0')
    expect(stepOf(three, 'step:0')).toMatchObject({ sections: [{}, {}, {}] })
    expect(addSection(insertBlock(d, 'loop', 'step:0').diagram, 'step:0')).toEqual(
      insertBlock(d, 'loop', 'step:0').diagram,
    )
    const merged = removeSection(
      insertAt(
        alt,
        [0, 1, 0],
        [{ type: 'note', position: 'over', participants: ['App'], text: 'x' }],
      ),
      'step:0',
      1,
    )
    // The second section's note joins the first; one section is left.
    expect(stepOf(merged, 'step:0')).toMatchObject({
      sections: [{ steps: [{ type: 'message' }, { type: 'note', text: 'x' }] }],
    })
    expect(removeSection(alt, 'step:0', 0)).toEqual(alt)

    expect(canDelete(d, { elements: ['step:1'], relations: [] })).toBe(true)
    expect(canDelete(d, { elements: ['step:7'], relations: [] })).toBe(false)
    const gone = deleteItems(d, { elements: ['step:1', 'step:0'], relations: [] })
    expect(toMermaid(gone)).not.toMatch(/loop|Sign in/)
    expect(toMermaid(gone)).toContain('App-->>User: Welcome')
    const noDb = deleteItems(d, { elements: ['Db'], relations: [] })
    expect(toMermaid(noDb)).not.toContain('Poll')
    roundTrips(noDb)
  })

  it('reads a block on an empty section back', () => {
    const opt = insertBlock(chat(), 'opt').diagram
    expect(toMermaid(opt)).toContain('  opt\n  end')
    roundTrips(opt)
  })
})

const shop = () =>
  read(
    `classDiagram
  namespace Shop {
    class Order {
      +String id
    }
    class Line
  }
  class Customer
  Customer --> Order : places
  Order *-- Line
  note for Order "Paid upfront"`,
    'class',
  )

describe('copy and paste', () => {
  it('copies elements with the lines between them, and pastes them under new ids', () => {
    const d = { ...shop(), layout: { Customer: { x: 10, y: 20 } } }
    const clip = copyItems(d, { elements: ['Customer', 'Order'], relations: [] })
    expect(clip?.diagram).toMatchObject({
      classes: [{ id: 'Order' }, { id: 'Customer' }],
      relations: [{ from: 'Customer', to: 'Order' }],
    })
    if (!clip) return
    const pasted = pasteItems(d, clip)
    expect(pasted.selection.elements).toEqual(['Order2', 'Customer2'])
    const out = pasted.diagram
    expect(out.kind === 'class' && out.relations.at(-1)).toMatchObject({
      from: 'Customer2',
      to: 'Order2',
      label: 'places',
    })
    expect(out.kind === 'class' && out.layout?.Customer2).toEqual({ x: 42, y: 52 })
    expect(out.kind === 'class' && out.classes.find((c) => c.id === 'Order2')?.namespace).toBe(
      'Shop',
    )
    roundTrips(out)
    // A second paste doesn't clash with the first.
    expect(pasteItems(out, clip).selection.elements).toEqual(['Order3', 'Customer3'])
  })

  it('copies a whole namespace into a new one, and notes with what they point at', () => {
    const clip = copyItems(shop(), { elements: ['namespace:Shop', 'note:0'], relations: [] })
    expect(clip?.namespaces).toEqual(['Shop'])
    if (!clip) return
    const out = pasteItems(shop(), clip)
    expect(out.selection.elements).toEqual(['Order2', 'Line2', 'note:1'])
    expect(toMermaid(out.diagram)).toContain('namespace Shop2 {')
    expect(toMermaid(out.diagram)).toContain('note for Order2 "Paid upfront"')
    roundTrips(out.diagram)
  })

  it('copies states with what a composite holds, and C4 boundaries with their elements', () => {
    const states = read(
      `stateDiagram-v2
  [*] --> Active
  state Active {
    [*] --> Idle
    Idle --> Busy
  }
  Active --> [*]`,
      'state',
    )
    const dup = duplicateItems(states, { elements: ['Active'], relations: [] })
    expect(dup.selection.elements).toEqual(['Active2', 'Idle2', 'Busy2'])
    const text = toMermaid(dup.diagram)
    expect(text).toContain('state Active2 {')
    expect(text).toContain('Idle2 --> Busy2')
    roundTrips(dup.diagram)

    const c4 = read(
      `C4Container
  Person(user, "User")
  System_Boundary(app, "App") {
    Container(web, "Web", "React")
  }
  Rel(user, web, "Uses")`,
      'c4',
    )
    const copy = duplicateItems(c4, { elements: ['app'], relations: [] })
    expect(copy.selection.elements).toEqual(['app2', 'web2'])
    expect(toMermaid(copy.diagram)).toContain('System_Boundary(app2, "App")')
    roundTrips(copy.diagram)
  })

  it('duplicates sequence steps after the last one, and entities', () => {
    const d = chat()
    const dup = duplicateItems(d, { elements: ['step:0', 'step:1'], relations: [] })
    expect(dup.selection.elements).toEqual(['step:2', 'step:3'])
    expect(dup.diagram.kind === 'sequence' && dup.diagram.steps).toHaveLength(5)
    roundTrips(dup.diagram)
    // A step inside a picked block isn't copied twice.
    const block = copyItems(d, { elements: ['step:1', 'step:1.0.0'], relations: [] })
    expect(block?.diagram.kind === 'sequence' && block.diagram.steps).toHaveLength(1)

    const er = read('erDiagram\n  A ||--o{ B : has', 'er')
    const both = duplicateItems(er, { elements: ['A', 'B'], relations: [] })
    expect(toMermaid(both.diagram)).toContain('A2 ||--o{ B2 : "has"')
  })

  it('pastes nothing into another kind of diagram, and copies nothing from nothing', () => {
    const clip = copyItems(shop(), { elements: ['Order'], relations: [] })
    if (!clip) throw new Error('expected a clip')
    expect(pasteItems(chat(), clip).diagram).toEqual(chat())
    expect(copyItems(shop(), { elements: ['Nope'], relations: [0] })).toBeNull()
  })
})

describe('arranging', () => {
  const boxes = [
    { id: 'a', x: 0, y: 0, width: 100, height: 40 },
    { id: 'b', x: 150, y: 30, width: 60, height: 80 },
    { id: 'c', x: 400, y: 10, width: 100, height: 40 },
  ]

  it('lines boxes up on any side or centre', () => {
    expect(alignBoxes(boxes, 'left')).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 0, y: 30 },
      c: { x: 0, y: 10 },
    })
    expect(alignBoxes(boxes, 'right').b).toEqual({ x: 440, y: 30 })
    expect(alignBoxes(boxes, 'center').b).toEqual({ x: 220, y: 30 })
    expect(alignBoxes(boxes, 'top').c).toEqual({ x: 400, y: 0 })
    expect(alignBoxes(boxes, 'middle').a).toEqual({ x: 0, y: 35 })
    expect(alignBoxes(boxes, 'bottom').a).toEqual({ x: 0, y: 70 })
  })

  it('spaces three or more boxes evenly, keeping the outer ones', () => {
    // 500 wide in all, 260 of boxes: two gaps of 120.
    expect(alignBoxes(boxes, 'distributeHorizontally')).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 220, y: 30 },
      c: { x: 400, y: 10 },
    })
    expect(alignBoxes(boxes.slice(0, 2), 'distributeVertically')).toEqual({})
    expect(canAlign('left', 1)).toBe(false)
    expect(canAlign('distributeVertically', 3)).toBe(true)
  })

  it('turns the diagram and drops the dragged positions', () => {
    const d = { ...shop(), layout: { Order: { x: 1, y: 2 } } }
    const lr = setDirection(d, 'LR')
    expect(lr).not.toHaveProperty('layout')
    expect(toMermaid(lr)).toContain('direction LR')
    expect(setDirection(lr, 'TB')).not.toHaveProperty('direction')
    expect(clearLayout(d)).toEqual(shop())
    expect(setDirection(chat(), 'LR')).toEqual(chat())
  })
})
