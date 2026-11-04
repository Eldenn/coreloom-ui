import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { UmlDiagram } from '@/components/ui/uml-diagram'
import type { UmlLayout, UmlSpec } from '@/lib/uml'
import { addRelation, deleteItems, type UmlSelection } from '@/lib/uml-edit'
import { renameElement } from '@/lib/uml-edit-fields'

import {
  c4ContainerText,
  c4ContextText,
  classText,
  erText,
  fromMermaid,
  sequenceText,
  stateText,
} from './uml-data'

const meta = {
  title: 'Components/Diagrams/UML diagram',
  component: UmlDiagram,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Software diagrams from Coreloom’s UML model: class, state, entity–relationship and C4 diagrams on a canvas laid out automatically (zoom, fit, focus each element and relation from the keyboard), sequence diagrams as an SVG with the steps as a list for screen readers. Pass a `diagram` read with `parseMermaid` or checked with `parseUmlJson`; with `editable`, elements can be dragged and `onLayoutChange` gets their positions to store in `layout`. `selection` / `onSelectionChange`, `onConnect` (drag from an element’s dot to another) and `onDelete` (Delete key) let an app edit the diagram with the functions in `@/lib/uml-edit`.',
      },
    },
  },
  args: { diagram: fromMermaid(classText), height: 520 },
  argTypes: {
    editable: { control: 'boolean' },
    controls: { control: 'boolean' },
    height: { control: 'number' },
    diagram: { control: 'object' },
  },
} satisfies Meta<typeof UmlDiagram>
export default meta
type Story = StoryObj<typeof meta>

/** Classes with members, stereotypes, inheritance, composition, aggregation, multiplicities and a note. */
export const Class: Story = {}

/** Participants and an actor, numbered calls and replies, an activation, an alt block and a note. */
export const Sequence: Story = { args: { diagram: fromMermaid(sequenceText) } }

/** A review workflow: start and end, a choice, a composite state and a note. */
export const State: Story = { args: { diagram: fromMermaid(stateText) } }

/** Tables with keys and types, related in crow's foot notation. */
export const EntityRelationship: Story = { args: { diagram: fromMermaid(erText) } }

/** C4 level 1: the system, the people who use it and the systems around it. */
export const C4Context: Story = { args: { diagram: fromMermaid(c4ContextText) } }

/** C4 level 2: the containers inside the system's boundary, with their technology. */
export const C4Container: Story = { args: { diagram: fromMermaid(c4ContainerText), height: 600 } }

/** `direction LR`: the same classes laid out left to right. */
export const LeftToRight: Story = {
  args: { diagram: fromMermaid(classText.replace('classDiagram', 'classDiagram\n  direction LR')) },
}

/** `editable`: drag elements (or select one and use the arrow keys); "Arrange" lays them out again. */
export const Editable: Story = {
  render: function Render(args) {
    const [layout, setLayout] = React.useState<UmlLayout>({})
    const diagram = { ...fromMermaid(stateText), layout }
    if (diagram.kind === 'sequence') return <UmlDiagram {...args} diagram={diagram} />
    return (
      <UmlDiagram {...args} diagram={{ ...diagram, layout }} editable onLayoutChange={setLayout} />
    )
  },
}

/**
 * Drag the dot under a class onto another to connect them; select and press Delete to remove.
 * The app keeps the diagram and changes it with `addRelation` and `deleteItems`.
 */
export const Connecting: Story = {
  render: function Render(args) {
    const [diagram, setDiagram] = React.useState<UmlSpec>(() => fromMermaid(classText))
    const [selection, setSelection] = React.useState<UmlSelection>({ elements: [], relations: [] })
    return (
      <UmlDiagram
        {...args}
        diagram={diagram}
        editable
        selection={selection}
        onSelectionChange={setSelection}
        onConnect={(from, to) => {
          setDiagram((d) => addRelation(d, { type: 'association', from, to }))
        }}
        onDelete={(picked) => {
          setDiagram((d) => deleteItems(d, picked))
          setSelection({ elements: [], relations: [] })
        }}
      />
    )
  },
}

/**
 * Editing on the canvas: F2 or a double-click renames the selected class, "Select an area" (or
 * Shift-drag) picks several, and the bar at the bottom lines them up or spaces them evenly.
 */
export const EditingOnCanvas: Story = {
  render: function Render(args) {
    const [diagram, setDiagram] = React.useState<UmlSpec>(() => fromMermaid(classText))
    const [selection, setSelection] = React.useState<UmlSelection>({
      elements: ['Payment', 'CardPayment', 'BankTransfer'],
      relations: [],
    })
    return (
      <UmlDiagram
        {...args}
        diagram={diagram}
        editable
        selection={selection}
        onSelectionChange={setSelection}
        onLayoutChange={(layout) => {
          setDiagram((d) => (d.kind === 'sequence' ? d : { ...d, layout }))
        }}
        onRename={(id, name) => {
          const renamed = renameElement(diagram, id, name)
          setDiagram(renamed.diagram)
          setSelection({ elements: [renamed.id], relations: [] })
        }}
      />
    )
  },
}

/** A sequence diagram with a step selected: a click picks a participant, message, note or block. */
export const SequenceSelection: Story = {
  render: function Render(args) {
    const [selection, setSelection] = React.useState<UmlSelection>({
      elements: ['step:1'],
      relations: [],
    })
    return (
      <UmlDiagram
        {...args}
        diagram={fromMermaid(sequenceText)}
        selection={selection}
        onSelectionChange={setSelection}
      />
    )
  },
}

/** Nothing to draw. */
export const Empty: Story = {
  args: { diagram: { kind: 'class', classes: [], relations: [] }, height: 240 },
}

export const French: Story = {
  args: { diagram: fromMermaid(c4ContainerText) },
  globals: { locale: 'fr' },
}

export const FrenchSequence: Story = {
  args: { diagram: fromMermaid(sequenceText) },
  globals: { locale: 'fr' },
}
