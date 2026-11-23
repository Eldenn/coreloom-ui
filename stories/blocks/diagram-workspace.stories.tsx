import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageSquarePlusIcon, NetworkIcon, Share2Icon, XIcon } from 'lucide-react'
import * as React from 'react'

import { AppShell } from '@/components/app-shell'
import { DIAGRAM_TEMPLATES } from '@/components/diagram-editor'
import {
  type DiagramContextTarget,
  DiagramWorkspace,
  type DiagramWorkspaceImport,
  type DiagramWorkspaceItem,
  type DiagramWorkspaceProps,
} from '@/components/diagram-workspace'
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

// The findings of a review against the code, on the class diagram's elements.
const ANNOTATED_VIEWS: DiagramWorkspaceItem[] = VIEWS.map((view) =>
  view.id === 'classes'
    ? {
        ...view,
        annotations: [
          { element: 'Order', status: 'warning', count: 2, label: 'Differs from the code' },
          { element: 'Payment', status: 'error', label: 'Missing from the code' },
          { element: 'Customer', status: 'ok' },
        ],
      }
    : view,
)

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
  onAnnotationSelect,
  contextActions,
}: {
  views?: DiagramWorkspaceItem[]
  failSaves?: boolean
  initialState?: SaveState
  height?: string
  onAnnotationSelect?: (element: string, viewId: string) => void
  contextActions?: DiagramWorkspaceProps['contextActions']
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
  // A file picked with "Import a file…" or dropped on the workspace: a new view, opened. Several
  // dropped files arrive one call each, in the same event: the updates build on each other.
  const imported = React.useRef(0)
  const importView = (view: DiagramWorkspaceImport) => {
    imported.current += 1
    const id = `file-${String(imported.current)}`
    const { title: name, value, format } = view
    setDiagrams((all) => [...all, { id, title: name, value, format }])
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
      onImport={importView}
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
      onAnnotationSelect={onAnnotationSelect}
      contextActions={contextActions}
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
          'The editor of a document with several diagrams. The consumer keeps the document: `title` / `onTitleChange`, `diagrams` (`{ id, title, value, format }`), `activeId` / `onActiveChange`, `onDiagramChange(id, value, result, format)`, `onAdd(kind)`, `onImport({ title, value, result, format })` (a file picked in the Add menu or dropped on the workspace, read in the browser; without it there is no import), `onRename`, `onReorder(ids)`, `onDelete(id)`, and the save state (`saveState`, `savedAt`, `onRetrySave`). Each view’s `annotations` mark its elements in the drawing and `onAnnotationSelect(element, viewId)` makes their badges buttons. `actions` go at the end of the top bar; `height` sets how tall the whole workspace is on wide screens, the editor taking what is left (`calc(100svh - 7.5rem)` fills the window in AppShell). On a phone, the list of views is in a side sheet.',
      },
    },
  },
} satisfies Meta<typeof DiagramWorkspace>
export default meta
type Story = StoryObj<typeof meta>

/** Add views (or import files: pick one in the Add menu, or drop them on the workspace), rename, reorder or delete them; edit one; it "saves" 800 ms later. */
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

/**
 * A view's `annotations`: the findings of a review against the code, as rings and badges on the
 * open view's drawing. `onAnnotationSelect` gets the element and its view.
 */
export const Annotated: Story = {
  render: function Render() {
    const [picked, setPicked] = React.useState<string | null>(null)
    return (
      <div className="grid gap-3">
        <Demo
          views={ANNOTATED_VIEWS}
          onAnnotationSelect={(element, viewId) => {
            // The app opens the findings of that element beside the workspace.
            setPicked(`${element} (${viewId})`)
          }}
        />
        <p role="status" className="text-[13px] text-fg-secondary">
          {picked ? `Showing the findings for ${picked}` : 'Press a badge to see its findings.'}
        </p>
      </div>
    )
  },
}

/**
 * `contextActions`: a right-click (a long press, or the context-menu key or Shift+F10 on a
 * focused view or element) on a view of the list, or on an element, a member, a relation or a
 * sequence step of the open view, opens a menu: the workspace's own entries, then the app's. Here
 * the app's entry adds what was clicked to an assistant's context, shown as chips below.
 */
export const ContextMenu: Story = {
  render: function Render() {
    const [context, setContext] = React.useState<DiagramContextTarget[]>([])
    const key = (target: DiagramContextTarget) => `${target.viewId}:${target.type}:${target.label}`
    return (
      <div className="grid gap-3">
        <Demo
          contextActions={(target) => [
            {
              label: 'Add to the assistant’s context',
              icon: <MessageSquarePlusIcon aria-hidden />,
              disabled: context.some((t) => key(t) === key(target)),
              onSelect: () => {
                setContext((all) => [...all, target])
              },
            },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-[13px] text-fg-secondary">Assistant’s context:</p>
          {context.length === 0 && (
            <p className="m-0 text-[13px] text-muted-foreground">
              Right-click a view, or a part of the drawing.
            </p>
          )}
          <ul aria-label="Assistant’s context" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {context.map((target) => (
              <li
                key={key(target)}
                data-type={target.type}
                className="flex items-center gap-1.5 rounded-md border border-border bg-secondary py-0.5 pr-0.5 pl-2 text-[12.5px] text-secondary-foreground"
              >
                <span className="font-mono text-[11px] text-fg-secondary">{target.type}</span>
                {target.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${target.label}`}
                  onClick={() => {
                    setContext((all) => all.filter((t) => key(t) !== key(target)))
                  }}
                >
                  <XIcon aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  },
}
