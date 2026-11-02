'use client'

// Coreloom UI — Workflow builder (block). An automation's page, n8n-style: its name, Save and Run,
// and the NodeEditor with the node kinds your app offers. Nothing runs here: `onRun` hands the graph
// to your app, which reports back through `runs`; `onSave` stores it.
import { CircleAlertIcon, PlayIcon } from 'lucide-react'
import * as React from 'react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NodeEditor,
  type NodeEditorProps,
  type NodeKind,
  type NodeRun,
  validateWorkflow,
  type Workflow,
} from '@/components/ui/node-editor'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/** The workflow's page: a header with its name, Save and Run, then the editor. */
function WorkflowBuilder({
  kinds,
  value,
  defaultValue,
  onValueChange,
  name: nameProp,
  defaultName = '',
  onNameChange,
  onSave,
  onRun,
  running = false,
  runs,
  readOnly,
  actions,
  height,
  className,
  editorProps,
}: {
  kinds: NodeKind[]
  value?: Workflow
  defaultValue?: Workflow
  onValueChange?: (workflow: Workflow) => void
  name?: string
  defaultName?: string
  onNameChange?: (name: string) => void
  /** Stores the workflow. A rejected promise shows "Couldn't save". Without it, no Save button. */
  onSave?: (workflow: Workflow, name: string) => Promise<unknown> | undefined
  /** Starts a run in your app. Without it, no Run button. Disabled while nodes need attention. */
  onRun?: (workflow: Workflow) => void
  /** A run is in progress (the Run button is busy). */
  running?: boolean
  /** What your run reports for each node, by id. */
  runs?: Partial<Record<string, NodeRun>>
  readOnly?: boolean
  /** More buttons before Save and Run. */
  actions?: React.ReactNode
  /** The canvas's height in px. */
  height?: number
  className?: string
  /** Anything else for the NodeEditor (selection, `showIssues`, `inspector`). */
  editorProps?: Omit<
    NodeEditorProps,
    | 'kinds'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'runs'
    | 'readOnly'
    | 'actions'
    | 'height'
  >
}) {
  const t = useCoreloomI18n().messages.workflow
  const nameId = React.useId()
  const statusId = React.useId()
  const [state, setState] = React.useState<Workflow>(defaultValue ?? { nodes: [], edges: [] })
  const workflow = value ?? state
  const [nameState, setNameState] = React.useState(defaultName)
  const name = nameProp ?? nameState
  const [save, setSave] = React.useState<SaveState>('idle')
  const [dirty, setDirty] = React.useState(false)

  const change = (next: Workflow) => {
    setState(next)
    setDirty(true)
    if (save !== 'saving') setSave('idle')
    onValueChange?.(next)
  }

  const issues = React.useMemo(() => validateWorkflow(workflow, kinds), [workflow, kinds])
  const issueNodes = new Set(issues.map((i) => i.nodeId)).size

  const doSave = async () => {
    if (!onSave) return
    setSave('saving')
    try {
      await onSave(workflow, name)
      setSave('saved')
      setDirty(false)
    } catch {
      setSave('error')
    }
  }

  const status =
    save === 'saving'
      ? t.saving
      : save === 'error'
        ? t.saveFailed
        : save === 'saved' && !dirty
          ? t.saved
          : dirty
            ? t.unsaved
            : ''

  return (
    <div data-slot="workflow-builder" className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <label htmlFor={nameId} className="sr-only">
            {t.name}
          </label>
          <Input
            id={nameId}
            value={name}
            placeholder={t.untitled}
            readOnly={readOnly}
            autoComplete="off"
            aria-describedby={status ? statusId : undefined}
            onChange={(e) => {
              setNameState(e.target.value)
              setDirty(true)
              onNameChange?.(e.target.value)
            }}
            className="h-9 max-w-80 min-w-40 flex-1 border-transparent bg-transparent font-display text-[16px] font-semibold shadow-none hover:border-border focus-visible:border-border"
          />
          <p id={statusId} role="status" className="m-0 shrink-0">
            {status && (
              <Badge variant={save === 'error' ? 'destructive' : dirty ? 'warning' : 'secondary'}>
                <BadgeDot />
                {status}
              </Badge>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {onSave && !readOnly && (
            <Button
              variant="outline"
              size="sm"
              disabled={save === 'saving'}
              aria-busy={save === 'saving' || undefined}
              onClick={() => {
                void doSave()
              }}
            >
              {save === 'saving' && <Spinner aria-hidden />}
              {t.save}
            </Button>
          )}
          {onRun && (
            <Button
              size="sm"
              disabled={running || issueNodes > 0}
              aria-busy={running || undefined}
              aria-describedby={issueNodes > 0 ? `${statusId}-issues` : undefined}
              onClick={() => {
                onRun(workflow)
              }}
            >
              {running ? <Spinner aria-hidden /> : <PlayIcon aria-hidden />}
              {running ? t.running : t.run}
            </Button>
          )}
        </div>
      </div>
      {onRun && issueNodes > 0 && (
        <p
          id={`${statusId}-issues`}
          className="m-0 -mt-1 flex items-center gap-1.5 text-[12.5px] text-fg-secondary"
        >
          <CircleAlertIcon aria-hidden className="size-3.5 text-warning" />
          {t.fixFirst(issueNodes)}
        </p>
      )}
      <NodeEditor
        kinds={kinds}
        value={workflow}
        onValueChange={change}
        {...(runs ? { runs } : {})}
        {...(readOnly !== undefined ? { readOnly } : {})}
        {...(height !== undefined ? { height } : {})}
        {...editorProps}
      />
    </div>
  )
}

export { WorkflowBuilder }
