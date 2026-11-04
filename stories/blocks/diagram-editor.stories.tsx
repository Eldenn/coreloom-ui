import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiagramEditor } from '@/components/diagram-editor'
import { toUmlJson } from '@/lib/uml'

import { c4ContainerText, classText, fromMermaid, sequenceText } from '../components/uml-data'

const meta = {
  title: 'Blocks/Diagrams/Diagram editor',
  component: DiagramEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Software diagrams as text: Mermaid (class, sequence, state, ER and C4) or Coreloom’s UML JSON on the left, the drawing on the right, problems marked on their line. Drag elements to place them (the positions go in the JSON); switch formats, start from a template, copy or download. Wire `value`/`onChange` to store the text, and `onDiagramChange` for the parsed diagram.',
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
export const UnknownType: Story = { args: { defaultValue: 'flowchart TD\n  A --> B' } }

export const French: Story = { globals: { locale: 'fr' } }

export const Phone: Story = { parameters: { viewport: { defaultViewport: 'mobile1' } } }
