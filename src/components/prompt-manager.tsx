'use client'

// Coreloom UI — PromptManager (AI block). One prompt and its versions: edit the text (its
// {{variables}} are found as you type), save a new version with a message, compare any two
// versions as a diff, deploy a version to a label ("production"), and try it with values for its
// variables. Saving, deploying and running are your callbacks; `onTest` returns text, a promise or
// a stream (an async iterable of chunks), and gets an AbortSignal for Stop.
import { PlayIcon, RocketIcon, SquareIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RelativeTime } from '@/components/ui/relative-time'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface PromptVersion {
  id: string
  /** 1, 2, 3…: shown as v1, v2, v3. */
  version: number
  text: string
  /** What changed, like a commit message. */
  message?: string
  author?: string
  createdAt: Date
  /** Where this version is deployed ("production", "staging"). */
  labels?: string[]
}

interface PromptTestInput {
  text: string
  /** The prompt with the variables replaced. */
  filled: string
  variables: Record<string, string>
  /** The version it was based on (the draft may differ). */
  versionId: string
  signal: AbortSignal
}

type PromptTestResult = string | Promise<string> | AsyncIterable<string>

const VARIABLE = /\{\{\s*([A-Za-z_][\w.-]*)\s*\}\}/g

/** The {{variables}} of a prompt, each once, in the order they first appear. */
function templateVariables(text: string): string[] {
  return [...new Set(Array.from(text.matchAll(VARIABLE), (m) => m[1]))].filter(Boolean)
}

/** The prompt with each {{variable}} replaced by its value; unknown ones stay as they are. */
function fillTemplate(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(VARIABLE, (whole, name: string) =>
    Object.hasOwn(values, name) ? (values[name] ?? '') : whole,
  )
}

const isIterable = (value: unknown): value is AsyncIterable<string> =>
  typeof value === 'object' && value !== null && Symbol.asyncIterator in value

/** Splits the text so the {{variables}} can be tinted in the editor's backdrop. */
function highlight(text: string) {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(VARIABLE)) {
    out.push(text.slice(last, m.index))
    out.push(
      <mark key={m.index} className="rounded-[3px] bg-primary-subtle text-transparent">
        {m[0]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  // A trailing newline needs a character after it, or the backdrop is a line short.
  out.push(`${text.slice(last)} `)
  return out
}

function PromptManager({
  name,
  versions,
  defaultVersionId,
  labels = ['production'],
  defaultValues = {},
  onSave,
  onDeploy,
  onTest,
  className,
}: {
  /** The prompt's name, shown at the top. */
  name: React.ReactNode
  versions: PromptVersion[]
  /** The version open at first: the newest by default. */
  defaultVersionId?: string
  /** Where a version can be deployed. ["production"] by default. */
  labels?: string[]
  /** Values for the test's variables at first. */
  defaultValues?: Record<string, string>
  /** Saves the draft as a new version; return it to open it. A rejected promise keeps the draft. */
  onSave?: (input: {
    text: string
    message: string
    baseVersionId: string
  }) => PromptVersion | undefined | Promise<PromptVersion | undefined>
  /** Shows Deploy: moves the label to this version. */
  onDeploy?: (versionId: string, label: string) => unknown
  /** Shows the Test tab. */
  onTest?: (input: PromptTestInput) => PromptTestResult
  className?: string
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.promptManager
  const sorted = [...versions].sort((a, b) => b.version - a.version)
  const [selectedId, setSelectedId] = React.useState(defaultVersionId ?? sorted.at(0)?.id)
  const selected = versions.find((v) => v.id === selectedId) ?? sorted.at(0)
  const [drafts, setDrafts] = React.useState<Partial<Record<string, string>>>({})
  const [message, setMessage] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [tab, setTab] = React.useState('edit')
  const [compareFrom, setCompareFrom] = React.useState<string | undefined>()
  const [view, setView] = React.useState<'unified' | 'split'>('unified')
  const [values, setValues] = React.useState(defaultValues)
  const [output, setOutput] = React.useState('')
  const [running, setRunning] = React.useState(false)
  const [status, setStatus] = React.useState('')
  const abort = React.useRef<AbortController | null>(null)
  const backdrop = React.useRef<HTMLDivElement>(null)
  const editorId = React.useId()
  const messageId = React.useId()
  const versionsId = React.useId()

  if (!selected) {
    return (
      <div
        data-slot="prompt-manager"
        className={cn('rounded-xl border border-border bg-card px-5 py-10 text-center', className)}
      >
        <p className="m-0 text-[13px] text-muted-foreground">{t.empty}</p>
      </div>
    )
  }

  const draft = drafts[selected.id] ?? selected.text
  const dirty = draft !== selected.text
  const variables = templateVariables(draft)
  const newest = sorted.at(0)?.version ?? 0
  const previous = sorted.find((v) => v.version < selected.version)
  const fromVersion =
    versions.find((v) => v.id === compareFrom) ?? (dirty ? selected : (previous ?? selected))

  const save = async () => {
    if (!onSave || !dirty) return
    setSaving(true)
    try {
      const created = await onSave({
        text: draft,
        message: message.trim(),
        baseVersionId: selected.id,
      })
      setDrafts(({ [selected.id]: _, ...rest }) => rest)
      setMessage('')
      if (created) setSelectedId(created.id)
      setStatus(t.saved(created?.version ?? newest + 1))
    } finally {
      setSaving(false)
    }
  }

  const run = async () => {
    if (!onTest) return
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setOutput('')
    setRunning(true)
    setStatus('')
    try {
      const result = onTest({
        text: draft,
        filled: fillTemplate(draft, values),
        variables: Object.fromEntries(variables.map((v) => [v, values[v] ?? ''])),
        versionId: selected.id,
        signal: controller.signal,
      })
      if (isIterable(result)) {
        for await (const chunk of result) {
          if (controller.signal.aborted) break
          setOutput((o) => o + chunk)
        }
      } else {
        const text = await result
        if (!controller.signal.aborted) setOutput(text)
      }
      setStatus(controller.signal.aborted ? t.stopped : t.done)
    } catch {
      setStatus(controller.signal.aborted ? t.stopped : t.failed)
      if (!controller.signal.aborted) setOutput((o) => o || t.failed)
    } finally {
      if (abort.current === controller) abort.current = null
      setRunning(false)
    }
  }

  const versionLabel = (v: PromptVersion) => `v${String(v.version)}`
  const sectionLabel =
    'm-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'

  return (
    <div
      data-slot="prompt-manager"
      className={cn(
        'grid min-w-0 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[260px_minmax(0,1fr)]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col border-b border-border md:border-r md:border-b-0">
        <div className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
          <p className="m-0 truncate font-display text-[15px] font-semibold text-foreground">
            {name}
          </p>
          <p className="m-0 text-[12.5px] text-muted-foreground">
            {t.versionCount(versions.length)}
          </p>
        </div>
        <p id={versionsId} className="sr-only">
          {t.versions}
        </p>
        <ul
          aria-labelledby={versionsId}
          className="m-0 flex max-h-56 list-none flex-col overflow-y-auto p-1.5 md:max-h-[520px]"
        >
          {sorted.map((v) => {
            const current = v.id === selected.id
            return (
              <li key={v.id}>
                <button
                  type="button"
                  aria-current={current || undefined}
                  onClick={() => {
                    setSelectedId(v.id)
                    setCompareFrom(undefined)
                  }}
                  className={cn(
                    'flex w-full cursor-pointer flex-col gap-1 rounded-md px-3 py-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring',
                    current && 'bg-accent',
                  )}
                >
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[12.5px] font-semibold text-foreground">
                      {versionLabel(v)}
                    </span>
                    {v.labels?.map((l) => (
                      <Badge key={l} variant={l === labels[0] ? 'success' : 'secondary'}>
                        {l}
                      </Badge>
                    ))}
                    {drafts[v.id] !== undefined && drafts[v.id] !== v.text && (
                      <Badge variant="warning">{t.draft}</Badge>
                    )}
                  </span>
                  {v.message && (
                    <span className="line-clamp-2 text-[12.5px] text-fg-secondary">
                      {v.message}
                    </span>
                  )}
                  <span className="text-[11.5px] text-muted-foreground">
                    {v.author ? `${v.author} · ` : ''}
                    <RelativeTime date={v.createdAt} />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="min-w-0 gap-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <TabsList>
            <TabsTrigger value="edit">{t.edit}</TabsTrigger>
            <TabsTrigger value="compare">{t.compare}</TabsTrigger>
            {onTest && <TabsTrigger value="test">{t.test}</TabsTrigger>}
          </TabsList>
          {onDeploy && (
            <div className="flex flex-wrap items-center gap-2">
              {labels.map((label) =>
                selected.labels?.includes(label) ? null : (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    disabled={dirty}
                    onClick={() => {
                      void onDeploy(selected.id, label)
                      setStatus(t.deployed(versionLabel(selected), label))
                    }}
                  >
                    <RocketIcon />
                    {t.deploy(versionLabel(selected), label)}
                  </Button>
                ),
              )}
            </div>
          )}
        </div>

        <TabsContent value="edit" className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={editorId}>{t.textOf(versionLabel(selected))}</Label>
            {dirty && <Badge variant="warning">{t.unsaved}</Badge>}
          </div>
          {/* The textarea sits over a backdrop that tints the {{variables}} at the same place. */}
          <div className="relative grid rounded-md border border-border bg-inset focus-within:ring-[3px] focus-within:ring-ring">
            <div
              ref={backdrop}
              aria-hidden
              className="pointer-events-none col-start-1 row-start-1 overflow-hidden px-3 py-2.5 font-mono text-[13px] leading-[1.6] break-words whitespace-pre-wrap text-transparent"
            >
              {highlight(draft)}
            </div>
            <Textarea
              id={editorId}
              value={draft}
              spellCheck={false}
              readOnly={!onSave}
              onChange={(e) => {
                setDrafts((d) => ({ ...d, [selected.id]: e.target.value }))
              }}
              onScroll={(e) => {
                if (backdrop.current) backdrop.current.scrollTop = e.currentTarget.scrollTop
              }}
              className="col-start-1 row-start-1 min-h-64 resize-y border-0 bg-transparent px-3 py-2.5 font-mono text-[13px] leading-[1.6] break-words shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12.5px] text-muted-foreground">{t.variables}</span>
            {variables.length ? (
              variables.map((v) => (
                <code
                  key={v}
                  className="rounded-sm bg-primary-subtle px-1.5 py-0.5 font-mono text-[12px] text-primary-text"
                >
                  {v}
                </code>
              ))
            ) : (
              <span className="text-[12.5px] text-muted-foreground">{t.noVariables}</span>
            )}
          </div>
          {onSave && (
            <form
              className="flex flex-wrap items-end gap-2 border-t border-border-subtle pt-3"
              onSubmit={(e) => {
                e.preventDefault()
                void save()
              }}
            >
              <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                <Label htmlFor={messageId}>{t.message}</Label>
                <Input
                  id={messageId}
                  value={message}
                  placeholder={t.messagePlaceholder}
                  autoComplete="off"
                  onChange={(e) => {
                    setMessage(e.target.value)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={!dirty || saving}
                onClick={() => {
                  setDrafts(({ [selected.id]: _, ...rest }) => rest)
                }}
              >
                {t.discard}
              </Button>
              <Button type="submit" disabled={!dirty || saving} aria-busy={saving || undefined}>
                {saving && <Spinner className="text-current" />}
                {t.saveAs(`v${String(newest + 1)}`)}
              </Button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="compare" className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-fg-secondary">
            <Select
              value={fromVersion.id === selected.id && dirty ? '' : fromVersion.id}
              onValueChange={setCompareFrom}
            >
              <SelectTrigger size="sm" className="w-28" aria-label={t.compareFrom}>
                <SelectValue placeholder={versionLabel(selected)} />
              </SelectTrigger>
              <SelectContent>
                {sorted.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {versionLabel(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span aria-hidden>→</span>
            <span className="font-mono text-[12.5px] text-foreground">
              {dirty ? t.draftOf(versionLabel(selected)) : versionLabel(selected)}
            </span>
            <SegmentedControl
              size="sm"
              className="ml-auto"
              aria-label={t.layout}
              value={view}
              onValueChange={(v) => setView(v as 'unified' | 'split')}
              options={[
                { value: 'unified', label: t.unified },
                { value: 'split', label: t.split },
              ]}
            />
          </div>
          <DiffViewer
            before={fromVersion.text}
            after={draft}
            view={view}
            wrap
            beforeLabel={versionLabel(fromVersion)}
            afterLabel={dirty ? t.draftOf(versionLabel(selected)) : versionLabel(selected)}
            emptyText={t.same}
          />
        </TabsContent>

        {onTest && (
          <TabsContent value="test" className="flex flex-col gap-4 p-4">
            {variables.length > 0 ? (
              <fieldset className="m-0 grid gap-3 border-0 p-0 sm:grid-cols-2">
                <legend className={cn(sectionLabel, 'mb-2')}>{t.variables}</legend>
                {variables.map((v) => (
                  <VariableInput
                    key={v}
                    name={v}
                    value={values[v] ?? ''}
                    onChange={(value) => {
                      setValues((all) => ({ ...all, [v]: value }))
                    }}
                  />
                ))}
              </fieldset>
            ) : (
              <p className="m-0 text-[13px] text-muted-foreground">{t.noVariables}</p>
            )}
            <div className="flex items-center gap-2">
              {running ? (
                <Button variant="outline" onClick={() => abort.current?.abort()}>
                  <SquareIcon />
                  {t.stop}
                </Button>
              ) : (
                <Button onClick={() => void run()}>
                  <PlayIcon />
                  {t.run}
                </Button>
              )}
              {dirty && <span className="text-[12.5px] text-muted-foreground">{t.testsDraft}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className={sectionLabel}>{t.output}</p>
              <div
                aria-busy={running || undefined}
                className="min-h-28 rounded-md border border-border bg-inset px-3 py-2.5 text-[13.5px] leading-[1.6] whitespace-pre-wrap text-foreground"
              >
                {output ||
                  (running ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner />
                      {t.running}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t.outputEmpty}</span>
                  ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  )
}

function VariableInput({
  name,
  value,
  onChange,
}: {
  name: string
  value: string
  onChange: (value: string) => void
}) {
  const id = React.useId()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="font-mono text-[12.5px]">
        {name}
      </Label>
      <Textarea
        id={id}
        value={value}
        rows={2}
        className="min-h-0 text-[13px]"
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
    </div>
  )
}

export {
  fillTemplate,
  PromptManager,
  type PromptTestInput,
  type PromptTestResult,
  type PromptVersion,
  templateVariables,
}
