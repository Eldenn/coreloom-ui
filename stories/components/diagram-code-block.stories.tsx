import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiagramCodeBlock, diagramCodeBlocks } from '@/components/ui/diagram-code-block'
import { Markdown, MarkdownCodeBlocksContext } from '@/components/ui/markdown'

import { activityText, classText, sequenceText, usecaseText } from './uml-data'

/** A model's answer with one fenced block in `language`. */
function answer(language: string, code: string, after = 'Ask me to change any of it.') {
  return `Here is the diagram you asked for.\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n${after}`
}

const meta = {
  title: 'Components/Diagrams/Diagram code block',
  component: DiagramCodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Draws the ```mermaid and ```plantuml blocks of a Markdown answer as diagrams, with a switch back to the source. Register it once around a chat with `<MarkdownCodeBlocksContext value={diagramCodeBlocks}>` (or pass `codeBlocks` to one `Markdown`). While the answer streams, and when the text can’t be read, the plain code block shows.',
      },
    },
  },
  args: { code: sequenceText, language: 'mermaid', streaming: false, children: null, height: 340 },
  argTypes: {
    code: { control: 'text' },
    language: { control: 'select', options: ['mermaid', 'plantuml', 'puml'] },
    streaming: { control: 'boolean' },
    height: { control: 'number' },
    children: { control: false },
  },
  render: ({ code, language, streaming }) => (
    <div className="max-w-2xl">
      <MarkdownCodeBlocksContext value={diagramCodeBlocks}>
        <Markdown streaming={streaming}>{answer(language, code)}</Markdown>
      </MarkdownCodeBlocksContext>
    </div>
  ),
} satisfies Meta<typeof DiagramCodeBlock>
export default meta
type Story = StoryObj<typeof meta>

/** A sequence diagram in a ```mermaid block. */
export const Default: Story = {}

/** A class diagram. */
export const Class: Story = { args: { code: classText } }

/** A Mermaid flowchart, drawn as an activity diagram. */
export const Flowchart: Story = { args: { code: activityText } }

/** A ```plantuml block: use cases. */
export const PlantUml: Story = { args: { code: usecaseText, language: 'plantuml' } }

/** While the answer is written, the block stays code: half a diagram would flicker. */
export const Streaming: Story = {
  args: { code: 'sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>', streaming: true },
  render: ({ code, language, streaming }) => (
    <div className="max-w-2xl" data-frozen>
      <MarkdownCodeBlocksContext value={diagramCodeBlocks}>
        <Markdown streaming={streaming}>{answer(language, code, '')}</Markdown>
      </MarkdownCodeBlocksContext>
    </div>
  ),
}

/** Text that can't be drawn: a note, then the code as written. */
export const Unreadable: Story = {
  args: { code: 'pie title Pets\n  "Dogs" : 386\n  "Cats" : 85' },
}

/** `codeBlocks` on one Markdown, without the context. */
export const OneAnswer: Story = {
  render: ({ code, language }) => (
    <div className="max-w-2xl">
      <Markdown codeBlocks={diagramCodeBlocks}>{answer(language, code)}</Markdown>
    </div>
  ),
}

/** Phone width: the drawing fits, the switch stays beside the label. */
export const Phone: Story = {
  args: { code: activityText },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const French: Story = {
  args: { code: usecaseText, language: 'plantuml' },
  globals: { locale: 'fr' },
}
