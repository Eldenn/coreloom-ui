import type { Meta, StoryObj } from '@storybook/react-vite'
import { NetworkIcon, Share2Icon } from 'lucide-react'
import * as React from 'react'

import { AppShell } from '@/components/app-shell'
import { DIAGRAM_TEMPLATES } from '@/components/diagram-editor'
import { DiagramWorkspace, type DiagramWorkspaceItem } from '@/components/diagram-workspace'
import { Button } from '@/components/ui/button'
import type { SaveState } from '@/components/ui/save-status'
import { useCoreloomI18n } from '@/lib/i18n'
import type { UmlDiagramKind } from '@/lib/uml'

import { classText, sequenceText, stateText } from '../components/uml-data'

// The screenshots freeze the clock at this moment.
const NOW = new Date('2026-10-14T10:00:00+02:00')

const VIEWS: DiagramWorkspaceItem[] = [
  { id: 'classes', title: 'Orders', value: classText, format: 'mermaid' },
  { id: 'checkout', title: 'Checkout', value: sequenceText, format: 'mermaid' },
  { id: 'states', title: 'Order states', value: stateText, format: 'mermaid' },
]

const share = (
  <Button type="button" variant="secondary" size="sm">
    <Share2Icon aria-hidden />
    Share
  </Button>
)

/** The app's side, faked: changes are kept in state and "saved" 800 ms later. */
function Demo({
  views = VIEWS,
  failSaves = false,
  initialState = 'saved',
  height,
}: {
  views?: DiagramWorkspaceItem[]
  failSaves?: boolean
  initialState?: SaveState
  height?: string
}) {
  const kinds = useCoreloomI18n().messages.diagram.kinds
  const [title, setTitle] = React.useState('Checkout architecture')
  const [diagrams, setDiagrams] = React.useState(views)
  const [activeId, setActiveId] = React.useState(views[0]?.id ?? '')
  const [saveState, setSaveState] = React.useState<SaveState>(initialState)
  const [savedAt, setSavedAt] = React.useState(() => new Date(NOW.getTime() - 3 * 60_000))
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const changed = () => {
    setSaveState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setSaveState(failSaves ? 'error' : 'saved')
      if (!failSaves) setSavedAt(new Date())
    }, 800)
  }
  const add = (kind: UmlDiagramKind) => {
    const text = DIAGRAM_TEMPLATES.find((t) => t.kind === kind)?.text ?? ''
    const id = `${kind}-${String(diagrams.length + 1)}`
    const format = text.startsWith('@startuml') ? 'plantuml' : 'mermaid'
    setDiagrams([...diagrams, { id, title: kinds[kind], value: text, format }])
    setActiveId(id)
    changed()
  }
  return (
    <DiagramWorkspace
      title={title}
      onTitleChange={(next) => {
        setTitle(next)
        changed()
      }}
      diagrams={diagrams}
      activeId={activeId}
      onActiveChange={setActiveId}
      onDiagramChange={(id, value, _result, format) => {
        setDiagrams((all) => all.map((d) => (d.id === id ? { ...d, value, format } : d)))
        changed()
      }}
      onAdd={add}
      onRename={(id, next) => {
        setDiagrams((all) => all.map((d) => (d.id === id ? { ...d, title: next } : d)))
        changed()
      }}
      onReorder={(ids) => {
        setDiagrams((all) => ids.flatMap((id) => all.filter((d) => d.id === id)))
        changed()
      }}
      onDelete={(id) => {
        const rest = diagrams.filter((d) => d.id !== id)
        setDiagrams(rest)
        if (id === activeId) setActiveId(rest[0]?.id ?? '')
        changed()
      }}
      saveState={saveState}
      savedAt={savedAt}
      onRetrySave={changed}
      actions={share}
      height={height}
    />
  )
}

const meta = {
  title: 'Blocks/Diagrams/Diagram workspace',
  component: DiagramWorkspace,
  tags: ['autodocs'],
  args: {
    title: 'Checkout architecture',
    onTitleChange: () => undefined,
    diagrams: VIEWS,
    activeId: 'classes',
    onActiveChange: () => undefined,
    onDiagramChange: () => undefined,
    onAdd: () => undefined,
    onRename: () => undefined,
    onReorder: () => undefined,
    onDelete: () => undefined,
    saveState: 'saved',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The editor of a document with several diagrams. The consumer keeps the document: `title` / `onTitleChange`, `diagrams` (`{ id, title, value, format }`), `activeId` / `onActiveChange`, `onDiagramChange(id, value, result, format)`, `onAdd(kind)`, `onRename`, `onReorder(ids)`, `onDelete(id)`, and the save state (`saveState`, `savedAt`, `onRetrySave`). `actions` go at the end of the top bar; `height` sets how tall the whole workspace is on wide screens, the editor taking what is left (`calc(100svh - 7.5rem)` fills the window in AppShell). On a phone, the list of views is in a side sheet.',
      },
    },
  },
} satisfies Meta<typeof DiagramWorkspace>
export default meta
type Story = StoryObj<typeof meta>

/** Add, rename, reorder or delete views; edit one; it "saves" 800 ms later. */
export const Default: Story = {
  render: () => <Demo />,
}

export const SingleView: Story = {
  render: () => <Demo views={VIEWS.slice(0, 1)} />,
}

export const Unsaved: Story = {
  render: () => <Demo initialState="unsaved" />,
}

export const SaveFailed: Story = {
  render: () => <Demo initialState="error" failSaves />,
}

export const French: Story = {
  globals: { locale: 'fr' },
  render: () => <Demo />,
}

/** The whole page: AppShell at full width, and the workspace down to the bottom of the window. */
export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <AppShell
      fullWidth
      workspaces={[{ name: 'Coreloom' }]}
      groups={[
        {
          label: 'Workspace',
          items: [{ title: 'Architectures', url: '#', icon: NetworkIcon, isActive: true }],
        },
      ]}
      user={{ name: 'Matthieu C.', email: 'matthieu@coreloom.dev' }}
      breadcrumbs={[{ label: 'Architectures', href: '#' }, { label: 'Checkout architecture' }]}
    >
      <Demo height="calc(100svh - 7.5rem)" />
    </AppShell>
  ),
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <Demo />,
}
