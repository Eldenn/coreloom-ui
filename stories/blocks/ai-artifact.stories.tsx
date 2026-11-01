/* eslint-disable jsx-a11y/no-autofocus -- every autoFocus here is autoFocus={false}: it turns Chat's own focus off. */
import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import {
  type Artifact,
  ArtifactCard,
  ArtifactLayout,
  ArtifactPanel,
} from '@/components/ai-artifact'
import { Chat } from '@/components/ai-chat'
import type { AiMessage } from '@/lib/ai'

const notesV1 = `# Release notes — 0.9

This release adds a review step to the editor.

## Added

- **Review changes**: accept or reject each passage a model rewrote.
- A primary button for rewrites in the AI panel.

## Fixed

- The slash menu closes when its anchor scrolls out of view.`

const notesV2 = `# Release notes — 0.9

Coreloom 0.9 lets people review what a model changed before it lands in their text.

## Added

- **Review changes**: accept or reject each passage a model rewrote, one at a time or all at once.
- A primary button for rewrites in the AI panel.
- \`ai.review: false\` turns the review off for an editor.

## Fixed

- The slash menu closes when its anchor scrolls out of view.`

const notesV3 = `# Release notes — 0.9

Coreloom 0.9 lets people review what a model changed before it lands in their text.

## Added

- **Review changes**: accept or reject each passage a model rewrote, one at a time or all at once.
- A primary button for rewrites in the AI panel.
- \`ai.review: false\` turns the review off for an editor.

## Fixed

- The slash menu closes when its anchor scrolls out of view.
- Safari's Enter during IME composition no longer picks a command.

## Upgrading

Nothing to do: the review is on by default and leaves the document untouched until **Accept**.`

const notes: Artifact = {
  id: 'notes',
  title: 'Release notes — 0.9',
  kind: 'markdown',
  versions: [
    { id: 'n1', content: notesV1, label: 'First draft', createdAt: '2026-10-14T09:12:00' },
    { id: 'n2', content: notesV2, label: 'Warmer intro', createdAt: '2026-10-14T09:15:00' },
    { id: 'n3', content: notesV3, label: 'Added Upgrading', createdAt: '2026-10-14T09:21:00' },
  ],
}

const debounceV1 = `import * as React from 'react'

export function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}`

const debounceV2 = `import * as React from 'react'

/** The value, once it has stopped changing for \`delay\` ms. */
export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    if (delay <= 0) {
      setDebounced(value)
      return
    }
    const id = setTimeout(() => {
      setDebounced(value)
    }, delay)
    return () => {
      clearTimeout(id)
    }
  }, [value, delay])
  return debounced
}`

const debounce: Artifact = {
  id: 'debounce',
  title: 'useDebounce hook',
  kind: 'code',
  language: 'tsx',
  filename: 'use-debounce.ts',
  versions: [
    { id: 'd1', content: debounceV1, label: 'First version' },
    { id: 'd2', content: debounceV2, label: 'Default delay, no-delay case' },
  ],
}

const meta = {
  title: 'Blocks/AI/Artifact',
  component: ArtifactPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A document or a piece of code a model wrote, opened in a panel beside the chat: its versions (‹ v2 ›), Preview / Source for Markdown, **Changes** against the previous version (a line diff with folded unchanged lines), Copy, Download and Restore. The app keeps the versions — from a tool’s output or `data-*` parts — and passes `artifact`; `onRestore` adds an older version back as the latest. `ArtifactCard` is the chip a message shows (draw it with the Chat’s `tools`), and `ArtifactLayout` puts the chat and the panel side by side, resizable, or the panel over the chat when space is narrow.',
      },
    },
  },
  args: {
    artifact: notes,
    streaming: false,
  },
  argTypes: {
    view: { control: 'inline-radio', options: ['preview', 'source', 'changes'] },
    streaming: { control: 'boolean' },
    artifact: { control: false },
    onRestore: { control: false },
    onClose: { control: false },
  },
} satisfies Meta<typeof ArtifactPanel>
export default meta
type Story = StoryObj<typeof meta>

function Frame({ children, frozen }: { children: React.ReactNode; frozen?: boolean }) {
  return (
    <div className="h-[720px] bg-background" data-frozen={frozen ? true : undefined}>
      {children}
    </div>
  )
}

const ask: AiMessage = {
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text: 'Draft the release notes for 0.9 from the changesets.' }],
}

const reply = (versions: number): AiMessage => ({
  id: 'a1',
  role: 'assistant',
  parts: [
    { type: 'text', text: 'Here is a draft. I kept the house style: Added, Fixed, Upgrading.' },
    {
      type: 'tool-writeDocument',
      toolCallId: 'w1',
      state: 'output-available',
      input: { title: notes.title },
      output: { id: notes.id, versions },
    },
  ],
})

/** The whole thing: the chat with the artifact's card in its answer, and the panel beside it.
 *  Restore adds the older text back as a new version, as an app would. */
export const WithChat: Story = {
  name: 'With the chat',
  render: function Render() {
    const [open, setOpen] = React.useState(true)
    const [doc, setDoc] = React.useState(notes)
    return (
      <Frame>
        <ArtifactLayout
          open={open}
          panel={
            <ArtifactPanel
              artifact={doc}
              onClose={() => {
                setOpen(false)
              }}
              onRestore={(version) => {
                setDoc((d) => ({
                  ...d,
                  versions: [
                    ...d.versions,
                    {
                      id: `n${d.versions.length + 1}`,
                      content: version.content,
                      label: `Restored ${version.label ?? ''}`.trim(),
                    },
                  ],
                }))
              }}
            />
          }
        >
          <Chat
            autoFocus={false}
            onSend={() => {}}
            messages={[ask, reply(doc.versions.length)]}
            tools={{
              writeDocument: {
                label: 'Write a document',
                display: 'inline',
                render: () => (
                  <ArtifactCard
                    title={doc.title}
                    kind={doc.kind}
                    versions={doc.versions.length}
                    active={open}
                    onOpen={() => {
                      setOpen(true)
                    }}
                  />
                ),
              },
            }}
          />
        </ArtifactLayout>
      </Frame>
    )
  },
}

/** A Markdown document on its latest version, rendered. */
export const Document: Story = {
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} onClose={() => {}} />
    </Frame>
  ),
}

/** Code, on the Changes view: what the last version added and removed, line by line. */
export const CodeChanges: Story = {
  name: 'Code, changes',
  args: { artifact: debounce, defaultView: 'changes' },
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} onClose={() => {}} />
    </Frame>
  ),
}

/** Long document, Changes view: unchanged runs fold into "Show 12 unchanged lines". */
export const LongChanges: Story = {
  name: 'Changes with folded lines',
  args: {
    artifact: {
      id: 'long',
      title: 'Deployment checklist',
      kind: 'text',
      versions: [
        {
          id: 'l1',
          content: Array.from({ length: 30 }, (_, i) => `Step ${i + 1}: check item ${i + 1}`).join(
            '\n',
          ),
        },
        {
          id: 'l2',
          content: Array.from({ length: 30 }, (_, i) =>
            i === 14
              ? 'Step 15: run the smoke tests on staging'
              : `Step ${i + 1}: check item ${i + 1}`,
          ).join('\n'),
          label: 'Smoke tests',
        },
      ],
    },
    defaultView: 'changes',
  },
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} />
    </Frame>
  ),
}

/** An older version: a bar says so and offers Restore and Show latest. */
export const OlderVersion: Story = {
  name: 'Older version',
  args: { defaultVersion: 'n1', onRestore: () => {} },
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} onClose={() => {}} />
    </Frame>
  ),
}

/** The model is still writing the latest version: a caret and "Writing…". Frozen, so it can be tested. */
export const Writing: Story = {
  args: {
    streaming: true,
    artifact: {
      ...notes,
      versions: [
        ...notes.versions.slice(0, 2),
        { id: 'n3', content: notesV3.slice(0, 420), label: 'Adding Upgrading' },
      ],
    },
  },
  render: (args) => (
    <Frame frozen>
      <ArtifactPanel {...args} onClose={() => {}} />
    </Frame>
  ),
}

/** One version, nothing to compare yet; the version arrows are hidden. */
export const FirstVersion: Story = {
  name: 'First version',
  args: {
    artifact: { ...debounce, versions: debounce.versions.slice(0, 1) },
    defaultView: 'changes',
  },
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} />
    </Frame>
  ),
}

/** The cards a message shows: closed, open in the panel, and still being written. */
export const Cards: Story = {
  render: () => (
    <div className="flex flex-col gap-3 bg-background p-6">
      <ArtifactCard title={notes.title} kind="markdown" versions={3} onOpen={() => {}} />
      <ArtifactCard
        title={debounce.title}
        kind="code"
        language="tsx"
        versions={2}
        active
        onOpen={() => {}}
      />
      <div data-frozen>
        <ArtifactCard title="Onboarding email" kind="text" streaming onOpen={() => {}} />
      </div>
    </div>
  ),
}

/** In French, on the Changes view. */
export const French: Story = {
  name: 'French',
  globals: { locale: 'fr' },
  args: { defaultView: 'changes', onRestore: () => {} },
  render: (args) => (
    <Frame>
      <ArtifactPanel {...args} onClose={() => {}} />
    </Frame>
  ),
}
