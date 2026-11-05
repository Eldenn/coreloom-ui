import type { Meta, StoryObj } from '@storybook/react-vite'
import { Share2Icon } from 'lucide-react'
import * as React from 'react'

import { DiagramEditor } from '@/components/diagram-editor'
import { DiagramProperties } from '@/components/diagram-properties'
import { SequenceOutline } from '@/components/diagram-sequence'
import { Button } from '@/components/ui/button'
import { useCoreloomI18n } from '@/lib/i18n'
import { type SequenceStep, toUmlJson, type UmlSpec } from '@/lib/uml'
import type { UmlSelection } from '@/lib/uml-edit'
import { setElementFields } from '@/lib/uml-edit-fields'
import { addSection, moveStep, removeSection, setStep } from '@/lib/uml-edit-sequence'

import {
  activityText,
  c4ContainerText,
  classText,
  componentText,
  deploymentText,
  fromMermaid,
  packageText,
  sequenceText,
  usecaseText,
} from '../components/uml-data'

const meta = {
  title: 'Blocks/Diagrams/Diagram editor',
  component: DiagramEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Software diagrams as text: Mermaid, PlantUML (class, sequence, state, ER, C4, use case, activity, deployment) or Coreloom’s UML JSON on the left, the drawing on the right, problems marked on their line. Drag elements to place them (the positions go in the JSON); switch formats, start from a template, copy or download. Wire `value`/`onChange` to store the text, and `onDiagramChange` for the parsed diagram. `view` shows the text and drawing side by side, or one of them; `actions` adds the app’s buttons to the bar; `readOnly` keeps the text as it is.',
      },
    },
  },
  args: { defaultValue: classText, autoFocus: false },
} satisfies Meta<typeof DiagramEditor>
export default meta
type Story = StoryObj<typeof meta>

/** A class diagram in Mermaid. */
export const Default: Story = {}

export const Sequence: Story = { args: { defaultValue: sequenceText } }

/** The C4 container diagram as Coreloom JSON. */
export const Json: Story = {
  args: {
    defaultFormat: 'json',
    defaultValue: toUmlJson(fromMermaid(c4ContainerText)),
  },
}

/** Lines the editor can't read are marked, and the rest still draws. */
export const WithProblems: Story = {
  args: {
    defaultValue: `classDiagram
  class Order
  Order --> Customer : placed by
  this line is not UML
  style Order fill:#f00
  class Draft {`,
  },
}

/** Text that isn't a supported diagram type. */
export const UnknownType: Story = {
  args: { defaultValue: 'pie title Pets\n  "Dogs" : 386\n  "Cats" : 85' },
}

/** PlantUML: a use case diagram, with the format set from the text. */
export const PlantUml: Story = { args: { defaultFormat: 'plantuml', defaultValue: usecaseText } }

/** A deployment diagram in PlantUML: nodes holding what's deployed on them. */
export const Deployment: Story = {
  args: { defaultFormat: 'plantuml', defaultValue: deploymentText },
}

/** A Mermaid flowchart, read as an activity diagram: actions, a decision, fork and join. */
export const Activity: Story = { args: { defaultValue: activityText } }

/** A component diagram in PlantUML: Mermaid has none, so its format is off. */
export const Component: Story = {
  args: { defaultFormat: 'plantuml', defaultValue: componentText },
}

/** A package diagram in PlantUML. */
export const Package: Story = {
  args: { defaultFormat: 'plantuml', defaultValue: packageText },
}

export const FrenchPlantUml: Story = {
  args: { defaultFormat: 'plantuml', defaultValue: usecaseText },
  globals: { locale: 'fr' },
}

export const French: Story = { globals: { locale: 'fr' } }

export const FrenchSequence: Story = {
  args: { defaultValue: sequenceText },
  globals: { locale: 'fr' },
}

const NOTHING: UmlSelection = { elements: [], relations: [] }

/**
 * The properties panel on its own, with a class selected: its members one per row, each with a
 * menu for visibility, static, abstract, moving and removing.
 */
export const ClassProperties: Story = {
  render: function Render() {
    const [diagram, setDiagram] = React.useState<UmlSpec>(() => fromMermaid(classText))
    const [selection, setSelection] = React.useState<UmlSelection>({
      elements: ['Order'],
      relations: [],
    })
    return (
      <DiagramProperties
        diagram={diagram}
        selection={selection}
        locked={false}
        onElementChange={(id, fields) => {
          const changed = setElementFields(diagram, id, fields)
          setDiagram(changed.diagram)
          setSelection({ elements: [changed.id], relations: [] })
        }}
        onRelationChange={() => {
          setSelection(NOTHING)
        }}
        onReverse={() => {
          setSelection(NOTHING)
        }}
        className="max-w-xs"
      />
    )
  },
}

/** A sequence diagram's participants and steps as a list, and the selected message's form. */
export const SequenceSteps: Story = {
  render: function Render() {
    const t = useCoreloomI18n().messages.diagramTools
    const buttons = React.useRef(new Map<string, HTMLButtonElement>())
    const [diagram, setDiagram] = React.useState(() => {
      const d = fromMermaid(sequenceText)
      if (d.kind !== 'sequence') throw new Error('Expected a sequence diagram')
      return d
    })
    const [selected, setSelected] = React.useState<string[]>(['step:1'])
    const steps = {
      onChange: (id: string, step: SequenceStep) => {
        setDiagram((d) => setStep(d, id, step))
      },
      onMove: (id: string, delta: -1 | 1) => {
        const moved = moveStep(diagram, id, delta)
        setDiagram(moved.diagram)
        setSelected([moved.id])
      },
      onAddSection: (id: string) => {
        setDiagram((d) => addSection(d, id))
      },
      onRemoveSection: (id: string, index: number) => {
        setDiagram((d) => removeSection(d, id, index))
      },
    }
    return (
      <div className="flex max-w-xs flex-col gap-4">
        <SequenceOutline
          diagram={diagram}
          selected={selected}
          onSelect={setSelected}
          buttons={buttons}
          t={t}
        />
        <DiagramProperties
          diagram={diagram}
          selection={{ elements: selected, relations: [] }}
          locked={false}
          onElementChange={() => undefined}
          onRelationChange={() => undefined}
          onReverse={() => undefined}
          steps={steps}
          className="p-0"
        />
      </div>
    )
  },
}

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }

/** `defaultView: 'drawing'`: the drawing alone; the switch in the bar brings the text back. */
export const DrawingView: Story = { args: { defaultView: 'drawing' } }

/** `defaultView: 'text'`: the text alone (image downloads are off until the drawing shows). */
export const TextView: Story = { args: { defaultView: 'text' } }

/**
 * `readOnly`, with the app's own button in `actions`: the text can't change, the drawing tools and
 * properties are off and nothing drags; Copy, Download, zoom and full screen stay.
 */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    actions: (
      <Button size="sm" variant="outline">
        <Share2Icon aria-hidden />
        Share
      </Button>
    ),
  },
}

/** A read-only sequence diagram: the step list still selects, the step form stays off. */
export const ReadOnlySequence: Story = { args: { readOnly: true, defaultValue: sequenceText } }

export const FrenchReadOnly: Story = {
  args: {
    readOnly: true,
    defaultView: 'drawing',
    actions: (
      <Button size="sm" variant="outline">
        <Share2Icon aria-hidden />
        Partager
      </Button>
    ),
  },
  globals: { locale: 'fr' },
}

/** Read only at phone width, with an action. */
export const PhoneReadOnly: Story = {
  args: {
    readOnly: true,
    actions: (
      <Button size="sm" variant="outline">
        <Share2Icon aria-hidden />
        Share
      </Button>
    ),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
