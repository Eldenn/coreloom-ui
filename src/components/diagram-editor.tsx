'use client'

// Coreloom UI — Diagram editor. Software diagrams as text: Mermaid (class, sequence, state, ER and
// C4) or Coreloom's UML JSON on the left, the drawing on the right, problems marked on their line.
// The drawing has its own tools: add elements, connect them (or drag from one to another), delete,
// change what's selected in the properties panel, undo. Each change is made on the model and the
// text is written again. Elements can be dragged; their positions travel in the JSON. Switch
// formats, start from a template, copy or download. Everything happens in the browser: the app
// keeps the text.
import { CheckIcon, CopyIcon, DownloadIcon, FilePlusIcon } from 'lucide-react'
import * as React from 'react'

import { DiagramProperties } from '@/components/diagram-properties'
import { DiagramTools } from '@/components/diagram-tools'
import { CodeEditor, type CodeEditorDiagnostic } from '@/components/ui/code-editor'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  Toolbar,
  ToolbarButton,
  ToolbarMenu,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from '@/components/ui/toolbar'
import { UmlDiagram } from '@/components/ui/uml-diagram'
import { useDiagramEditing } from '@/components/use-diagram-editing'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import {
  parseUmlJson,
  toUmlJson,
  type UmlDiagramKind,
  umlElementIds,
  type UmlLayout,
  type UmlParseResult,
  type UmlProblem,
  type UmlSpec,
} from '@/lib/uml'
import { parseMermaid, toMermaid } from '@/lib/uml-mermaid'
import { cn } from '@/lib/utils'

type DiagramFormat = 'mermaid' | 'json'

interface DiagramEditorProps {
  /** The text (controlled), in `format`. */
  value?: string
  defaultValue?: string
  onChange?: (text: string) => void
  format?: DiagramFormat
  /** Default: mermaid. */
  defaultFormat?: DiagramFormat
  onFormatChange?: (format: DiagramFormat) => void
  /** Each time the text is read: the diagram (null when nothing could be drawn) and its problems. */
  onDiagramChange?: (result: UmlParseResult) => void
  /** Starting points under "New diagram", as Mermaid. Default: one per diagram type. */
  templates?: readonly { kind: UmlDiagramKind; label?: string; text: string }[]
  /** CSS height of both panes on wide screens (they stack on narrow ones). Default: 560px. */
  height?: string
  /** File name for Download, without the extension. Default: diagram. */
  fileName?: string
  autoFocus?: boolean
  className?: string
}

type EditorText = Messages['diagramEditor']

const DIAGRAM_TEMPLATES: readonly { kind: UmlDiagramKind; text: string }[] = [
  {
    kind: 'class',
    text: `classDiagram
  class Order {
    +String id
    +place() void
  }
  class LineItem {
    +int quantity
  }
  Order *-- LineItem`,
  },
  {
    kind: 'sequence',
    text: `sequenceDiagram
  actor User
  participant App
  User->>App: Sign in
  App-->>User: Welcome`,
  },
  {
    kind: 'state',
    text: `stateDiagram-v2
  [*] --> Draft
  Draft --> Published : publish
  Published --> [*]`,
  },
  {
    kind: 'er',
    text: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string id PK
    string email
  }`,
  },
  {
    kind: 'c4',
    text: `C4Context
  Person(user, "User")
  System(app, "Our app", "What we build")
  Rel(user, app, "Uses")`,
  },
]

/** Reads text in either format. */
function parseDiagram(text: string, format: DiagramFormat): UmlParseResult {
  return format === 'json' ? parseUmlJson(text) : parseMermaid(text)
}

/** The diagram as text in `format`, with the positions people dragged (JSON keeps them). */
function writeDiagram(diagram: UmlSpec, format: DiagramFormat): string {
  return format === 'json' ? toUmlJson(diagram) : toMermaid(diagram)
}

/** Positions only for elements the diagram still has. */
function withLayout(diagram: UmlSpec, layout: UmlLayout | null): UmlSpec {
  if (diagram.kind === 'sequence' || !layout) return diagram
  const ids = new Set(umlElementIds(diagram))
  const kept = Object.fromEntries(Object.entries(layout).filter(([id]) => ids.has(id)))
  const { layout: _old, ...rest } = diagram
  return Object.keys(kept).length ? { ...rest, layout: kept } : rest
}

function problemText(p: UmlProblem, t: EditorText): string {
  const what = t.problem[p.code]
  const where = p.line > 0 ? `${t.line(p.line)} · ` : ''
  // JSON and schema problems carry the parser's own detail; the rest quote the line.
  const detail = p.code === 'json' || p.code === 'schema' ? p.text : undefined
  return `${where}${what}${detail ? ` ${detail}` : ''}`
}

/** What the editor shows about a reading: the diagram, its name, the status line, the marks. */
function readout(result: UmlParseResult, layout: UmlLayout | null, messages: Messages) {
  const t = messages.diagramEditor
  const diagram = result.diagram ? withLayout(result.diagram, layout) : null
  const kindName = diagram ? messages.diagram.kinds[diagram.kind] : null
  const count = result.problems.length
  const status =
    diagram && kindName && !count
      ? t.status(kindName, umlElementIds(diagram).length)
      : t.problems(count)
  const diagnostics: CodeEditorDiagnostic[] = result.problems
    .filter((p) => p.line > 0)
    .map((p) => ({ line: p.line, severity: p.severity, message: t.problem[p.code] }))
  const invalid = result.problems.some((p) => p.severity === 'error')
  return { diagram, kindName, status, diagnostics, invalid }
}

function useControlled<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [own, setOwn] = React.useState(initial)
  const current = value ?? own
  const set = (next: T) => {
    if (value === undefined) setOwn(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function FileTools({
  t,
  format,
  onFormat,
  onTemplate,
  onCopy,
  copied,
  onDownload,
  templates,
  status,
  kinds,
}: {
  t: EditorText
  format: DiagramFormat
  onFormat: (f: DiagramFormat) => void
  onTemplate: (text: string) => void
  onCopy: () => void
  copied: boolean
  onDownload: () => void
  templates: readonly { kind: UmlDiagramKind; label?: string; text: string }[]
  status: string
  kinds: Messages['diagram']['kinds']
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border px-2 py-1.5">
      <Toolbar aria-label={t.fileTools} variant="plain" className="flex-wrap">
        <ToolbarToggleGroup
          type="single"
          value={format}
          aria-label={t.format}
          onValueChange={(v) => {
            if (v === 'mermaid' || v === 'json') onFormat(v)
          }}
        >
          <ToolbarToggleItem value="mermaid">Mermaid</ToolbarToggleItem>
          <ToolbarToggleItem value="json">JSON</ToolbarToggleItem>
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarMenu label={t.newDiagram} icon={<FilePlusIcon aria-hidden />}>
          {templates.map((tpl) => (
            <DropdownMenuItem
              key={tpl.label ?? tpl.kind}
              onSelect={() => {
                onTemplate(tpl.text)
              }}
            >
              {tpl.label ?? kinds[tpl.kind]}
            </DropdownMenuItem>
          ))}
        </ToolbarMenu>
        <ToolbarSeparator className="max-sm:hidden" />
        <ToolbarButton onClick={onCopy}>
          {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
          <span className="max-sm:sr-only">{copied ? t.copied : t.copy}</span>
        </ToolbarButton>
        <ToolbarButton onClick={onDownload}>
          <DownloadIcon aria-hidden />
          <span className="max-sm:sr-only">{t.download}</span>
        </ToolbarButton>
      </Toolbar>
      <p
        role="status"
        className="order-last w-full min-w-0 truncate px-1 text-[12.5px] text-muted-foreground sm:order-none sm:w-auto sm:flex-1 sm:text-right"
      >
        {status}
      </p>
    </div>
  )
}

function ProblemList({ problems, t }: { problems: readonly UmlProblem[]; t: EditorText }) {
  if (!problems.length) return null
  return (
    <ul className="max-h-28 shrink-0 overflow-auto border-t border-border bg-inset px-3 py-2 text-[12.5px]">
      {problems.map((p, i) => (
        <li
          // eslint-disable-next-line @eslint-react/no-array-index-key -- a line can have several problems
          key={i}
          className={cn(
            'truncate',
            p.severity === 'error' ? 'text-destructive' : 'text-fg-secondary',
          )}
          title={p.text}
        >
          {problemText(p, t)}
        </li>
      ))}
    </ul>
  )
}

type Editing = ReturnType<typeof useDiagramEditing>

/** Ctrl or ⌘ + Z (and + Shift, or Y) on the drawing undoes and redoes the tools' changes. */
function undoKeys(editing: Editing) {
  return (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return
    if (!(event.metaKey || event.ctrlKey)) return
    const key = event.key.toLowerCase()
    if (key === 'z' && !event.shiftKey) editing.undo()
    else if (key === 'y' || (key === 'z' && event.shiftKey)) editing.redo()
    else return
    event.preventDefault()
  }
}

function Drawing({
  diagram,
  label,
  locked,
  editing,
  onLayoutChange,
}: {
  diagram: UmlSpec | null
  label: string
  locked: boolean
  editing: Editing
  onLayoutChange: (layout: UmlLayout) => void
}) {
  const empty = useCoreloomI18n().messages.diagram.empty
  const pane = React.useRef<HTMLDivElement>(null)
  const remove = () => {
    editing.remove()
    // The Delete button is about to be disabled: keep focus on the drawing.
    requestAnimationFrame(() => {
      pane.current?.querySelector<HTMLElement>('[role="application"], [role="region"]')?.focus()
    })
  }
  return (
    // The keys are a shortcut for the Undo and Redo tools, which stay the way to reach them.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- shortcut only
    <div ref={pane} className="flex min-h-0 min-w-0 flex-col" onKeyDown={undoKeys(editing)}>
      <DiagramTools
        diagram={diagram}
        locked={locked}
        selected={editing.selection.elements}
        canDelete={editing.canDelete}
        canUndo={editing.canUndo}
        canRedo={editing.canRedo}
        onAdd={editing.add}
        onConnect={editing.connect}
        onDelete={remove}
        onUndo={editing.undo}
        onRedo={editing.redo}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-[340px] min-h-0 min-w-0 p-3 lg:h-auto lg:flex-1">
          {diagram ? (
            <UmlDiagram
              diagram={diagram}
              editable
              onLayoutChange={onLayoutChange}
              selection={editing.selection}
              onSelectionChange={editing.select}
              {...(locked ? {} : { onConnect: editing.connectDragged, onDelete: editing.remove })}
              height="100%"
              label={label}
              className="h-full"
            />
          ) : (
            <p className="grid h-full place-items-center rounded-lg border border-dashed border-border text-[13px] text-muted-foreground">
              {empty}
            </p>
          )}
        </div>
        {diagram && diagram.kind !== 'sequence' && (
          <DiagramProperties
            diagram={diagram}
            selection={editing.selection}
            locked={locked}
            onElementChange={editing.changeElement}
            onRelationChange={editing.changeRelation}
            onReverse={editing.reverse}
            nameRef={editing.nameRef}
            className="border-t border-border lg:w-60 lg:shrink-0 lg:border-t-0 lg:border-l"
          />
        )}
      </div>
    </div>
  )
}

function DiagramEditor({
  value,
  defaultValue = DIAGRAM_TEMPLATES[0]?.text ?? '',
  onChange,
  format: formatProp,
  defaultFormat = 'mermaid',
  onFormatChange,
  onDiagramChange,
  templates = DIAGRAM_TEMPLATES,
  height = '560px',
  fileName = 'diagram',
  autoFocus = false,
  className,
}: DiagramEditorProps) {
  const { messages } = useCoreloomI18n()
  const t = messages.diagramEditor
  const [text, setText] = useControlled(value, defaultValue, onChange)
  const [format, setFormat] = useControlled(formatProp, defaultFormat, onFormatChange)
  // Positions dragged on the canvas; null until someone drags (the JSON's own layout applies).
  const [layout, setLayout] = React.useState<UmlLayout | null>(null)
  const [copied, setCopied] = React.useState(false)
  const id = React.useId()

  // Text the tools wrote is read at once (the panels follow the new ids); typing is read when
  // there's time.
  const [written, setWritten] = React.useState<string | null>(null)
  const deferred = React.useDeferredValue(text)
  const source = text === written ? text : deferred
  const result = React.useMemo(() => parseDiagram(source, format), [source, format])
  const { diagram, kindName, status, diagnostics, invalid } = readout(result, layout, messages)
  const editing = useDiagramEditing({
    diagram,
    text,
    layout,
    write: (d) => writeDiagram(d, format),
    setText: (next) => {
      setWritten(next)
      setText(next)
    },
    setLayout,
    t: messages.diagramTools,
  })

  const reported = React.useRef<UmlParseResult | null>(null)
  React.useEffect(() => {
    // Tell the app once per reading, not once per render.
    if (reported.current === result) return
    reported.current = result
    onDiagramChange?.(result)
  }, [result, onDiagramChange])

  const exported = () => (diagram ? writeDiagram(diagram, format) : text)

  const switchFormat = (next: DiagramFormat) => {
    if (next === format) return
    editing.reset()
    // Convert what could be read; text that couldn't stays as it is.
    if (diagram) setText(writeDiagram(diagram, next))
    setFormat(next)
  }

  const applyTemplate = (mermaid: string) => {
    editing.reset()
    setLayout(null)
    const read = parseMermaid(mermaid).diagram
    setText(format === 'json' && read ? toUmlJson(read) : mermaid)
  }

  const copy = () => {
    void navigator.clipboard.writeText(exported()).then(() => {
      setCopied(true)
      window.setTimeout(() => {
        setCopied(false)
      }, 1600)
    })
  }

  const download = () => {
    const blob = new Blob([exported()], {
      type: format === 'json' ? 'application/json' : 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.${format === 'json' ? 'json' : 'mmd'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section
      data-slot="diagram-editor"
      aria-label={t.label}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      style={{ '--diagram-editor-h': height } as React.CSSProperties}
    >
      <FileTools
        t={t}
        format={format}
        onFormat={switchFormat}
        onTemplate={applyTemplate}
        onCopy={copy}
        copied={copied}
        onDownload={download}
        templates={templates}
        status={editing.notice ? `${editing.notice} · ${status}` : status}
        kinds={messages.diagram.kinds}
      />
      <div className="grid min-h-0 lg:h-(--diagram-editor-h) lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex min-h-0 min-w-0 flex-col border-b border-border lg:border-r lg:border-b-0">
          <p id={`${id}-source`} className="sr-only">
            {t.source}
          </p>
          <div className="h-[280px] min-h-0 lg:h-auto lg:flex-1">
            <CodeEditor
              value={text}
              onChange={(next) => {
                editing.reset()
                setText(next)
              }}
              language={format === 'json' ? 'json' : 'text'}
              path={`${fileName}.${format}`}
              diagnostics={diagnostics}
              height="100%"
              className="h-full"
              autoFocus={autoFocus}
              aria-labelledby={`${id}-source`}
              {...(invalid ? { 'aria-invalid': true } : {})}
            />
          </div>
          <ProblemList problems={result.problems} t={t} />
        </div>
        <Drawing
          diagram={diagram}
          label={kindName ? `${t.preview}: ${kindName}` : t.preview}
          locked={result.problems.length > 0}
          editing={editing}
          onLayoutChange={setLayout}
        />
      </div>
    </section>
  )
}

export {
  DIAGRAM_TEMPLATES,
  DiagramEditor,
  type DiagramEditorProps,
  type DiagramFormat,
  parseDiagram,
  writeDiagram,
}
