import { describe, expect, it } from 'vitest'

import type { ClassDiagram, SequenceDiagram, UmlSpec } from '@/lib/uml'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'
import { parsePlantUml, toPlantUml } from '@/lib/uml-plantuml'

const classes: ClassDiagram = {
  kind: 'class',
  classes: [{ id: 'Order' }, { id: 'Customer' }],
  relations: [{ from: 'Customer', to: 'Order', kind: 'association' }],
  layout: { Order: { x: 120, y: 40 }, Customer: { x: -8.5, y: 300 } },
}

describe('positions in Mermaid and PlantUML text', () => {
  it('Mermaid keeps dragged positions in a comment line and reads them back', () => {
    const text = toMermaid(classes)
    expect(text.trimEnd().split('\n').at(-1)).toBe(
      '%% coreloom-layout {"Order":{"x":120,"y":40},"Customer":{"x":-8.5,"y":300}}',
    )
    const back = parseMermaid(text)
    expect(back.problems).toEqual([])
    expect(back.diagram).toEqual(classes)
  })

  it('PlantUML keeps them in a comment line before @enduml and reads them back', () => {
    const text = toPlantUml(classes)
    const lines = text.trimEnd().split('\n')
    expect(lines.at(-1)).toBe('@enduml')
    expect(lines.at(-2)).toBe(
      '\' coreloom-layout {"Order":{"x":120,"y":40},"Customer":{"x":-8.5,"y":300}}',
    )
    const back = parsePlantUml(text)
    expect(back.problems).toEqual([])
    expect(back.diagram).toEqual(classes)
  })

  it('writes no line when nothing was dragged', () => {
    const { layout: _none, ...plain } = classes
    expect(toMermaid(plain)).not.toContain('coreloom-layout')
    expect(toPlantUml(plain)).not.toContain('coreloom-layout')
  })

  it('keeps only positions of elements the text still has', () => {
    const text = `classDiagram\n  class Order\n%% coreloom-layout {"Order":{"x":1,"y":2},"Gone":{"x":3,"y":4}}`
    expect(parseMermaid(text).diagram).toMatchObject({ layout: { Order: { x: 1, y: 2 } } })
    expect(
      parseMermaid(text).diagram?.kind === 'class' && parseMermaid(text).diagram,
    ).not.toHaveProperty('layout.Gone')
  })

  it('ignores a broken or hostile line instead of failing the diagram', () => {
    for (const bad of [
      '%% coreloom-layout {not json',
      '%% coreloom-layout {"Order":{"x":"1","y":2}}',
      '%% coreloom-layout []',
      '%% coreloom-layout {"__proto__":{"x":1,"y":2}}',
      '%% coreloom-layout {"Order":{"x":1e999,"y":2}}',
    ]) {
      const result = parseMermaid(`classDiagram\n  class Order\n${bad}`)
      expect(result.problems).toEqual([])
      expect(result.diagram).toEqual({ kind: 'class', classes: [{ id: 'Order' }], relations: [] })
    }
  })

  it('a sequence diagram has no positions to keep', () => {
    const seq: SequenceDiagram = {
      kind: 'sequence',
      participants: [{ id: 'A' }],
      steps: [],
    }
    expect(toMermaid(seq)).not.toContain('coreloom-layout')
    const read = parseMermaid(
      'sequenceDiagram\n  participant A\n%% coreloom-layout {"A":{"x":1,"y":2}}',
    )
    expect(read.diagram).not.toHaveProperty('layout')
  })

  it('a kind Mermaid writes as a flowchart keeps its positions too', () => {
    const usecase: UmlSpec = {
      kind: 'usecase',
      elements: [
        { id: 'u', kind: 'actor', label: 'User' },
        { id: 'buy', kind: 'usecase', label: 'Buy' },
      ],
      relations: [{ from: 'u', to: 'buy' }],
      layout: { u: { x: 0, y: 0 }, buy: { x: 200, y: 0 } },
    }
    expect(parseMermaid(toMermaid(usecase)).diagram).toMatchObject({
      layout: { u: { x: 0, y: 0 }, buy: { x: 200, y: 0 } },
    })
    expect(parsePlantUml(toPlantUml(usecase)).diagram).toMatchObject({
      layout: { u: { x: 0, y: 0 }, buy: { x: 200, y: 0 } },
    })
  })
})
