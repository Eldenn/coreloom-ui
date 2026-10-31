"use client"

// Coreloom UI — AI agents (block). AgentList: the workspace's agents as cards (status, model,
// tools, last run), searchable. AgentEditor: one agent's settings on the form kit (TanStack Form):
// name and description, instructions with their {{variables}}, model, temperature, maximum steps,
// the tools it may call (and which ask first), the knowledge it searches.
import * as React from "react"
import { useStore } from "@tanstack/react-form"
import { BotIcon, PlusIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AiModel } from "@/lib/ai"
import { AppLink } from "@/lib/link"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { VerticalShell, describedBy, useAppForm, useFieldMeta } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useCoreloomI18n } from "@/lib/i18n"

type AgentStatus = "active" | "paused" | "draft"

type AgentSummary = {
  id: string
  name: string
  description?: string
  status: AgentStatus
  /** The model's display name. */
  model: string
  toolCount: number
  lastRunAt?: Date | string
  runsThisWeek?: number
}

const STATUS_VARIANT = { active: "success", paused: "warning", draft: "secondary" } as const

function AgentStatusBadge({ status, className }: { status: AgentStatus; className?: string }) {
  const t = useCoreloomI18n().messages.ai.agents
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      <BadgeDot />
      {t.status[status]}
    </Badge>
  )
}

function relative(date: Date | string, locale: string, now = Date.now()) {
  const s = Math.round((new Date(date).getTime() - now) / 1000)
  const fmt = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  for (const [unit, size] of [["day", 86_400], ["hour", 3_600], ["minute", 60]] as const)
    if (Math.abs(s) >= size) return fmt.format(Math.round(s / size), unit)
  return fmt.format(0, "minute")
}

/** The agents as cards, each a link to its page. */
function AgentList({
  agents,
  href,
  onNew,
  now,
  className,
}: {
  agents: AgentSummary[]
  /** Where a card leads: (id) => `/agents/${id}`. */
  href: (id: string) => string
  onNew?: () => void
  /** "Last run 2 hours ago" is relative to this (default: now). */
  now?: Date
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.ai.agents
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const shown = agents.filter((a) => !q || a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
  return (
    <div data-slot="agent-list" className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-full max-w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} aria-label={t.search} className="h-9 pl-9" />
        </div>
        {onNew && (
          <Button onClick={onNew}>
            <PlusIcon />
            {t.new}
          </Button>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="m-0 rounded-lg border border-dashed border-border px-4 py-10 text-center text-[13.5px] text-muted-foreground">{agents.length ? t.noResults : t.empty}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((a) => (
            <li key={a.id}>
              <AppLink
                href={href(a.id)}
                className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 outline-none transition-[border-color,box-shadow] duration-120 hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <div className="flex items-start gap-3">
                  <div aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary-text">
                    <BotIcon className="size-4.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[14.5px] font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">{a.name}</span>
                    {a.description && <span className="line-clamp-2 text-[13px] text-muted-foreground">{a.description}</span>}
                  </div>
                  <AgentStatusBadge status={a.status} className="shrink-0" />
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-muted-foreground">
                  <span className="text-fg-secondary">{a.model}</span>
                  <span aria-hidden>·</span>
                  <span>{t.tools(a.toolCount)}</span>
                  <span aria-hidden>·</span>
                  <span>{a.lastRunAt ? t.lastRun(relative(a.lastRunAt, locale, now?.getTime())) : t.neverRun}</span>
                  {a.runsThisWeek !== undefined && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{t.runs(formatNumber(a.runsThisWeek))}</span>
                    </>
                  )}
                </div>
              </AppLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type AgentTool = {
  id: string
  name: string
  description?: string
  /** It changes data (sends, deletes, deploys): offered to ask first, and asks by default. */
  sensitive?: boolean
}

type AgentValues = {
  name: string
  description: string
  instructions: string
  model: string
  temperature: number
  maxSteps: number
  /** Ids of the tools it may call. */
  tools: string[]
  /** Ids of the tools that ask a person before running. */
  askFirst: string[]
  /** Ids of the knowledge bases it searches. */
  knowledge: string[]
}

/** The {{variables}} in a prompt, each once, in order. */
function promptVariables(text: string) {
  return [...new Set([...text.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map((m) => m[1]))]
}

function SliderField({ label, description, min, max, step, format }: { label: string; description?: string; min: number; max: number; step: number; format?: (v: number) => string }) {
  const meta = useFieldMeta()
  const field = meta.field
  const value = useStore(field.store, (s) => s.value) as number
  return (
    <VerticalShell
      meta={meta}
      label={label}
      description={description}
      labelAction={<span className="font-mono text-[12px] text-foreground tabular-nums">{format ? format(value) : value}</span>}
    >
      <Slider
        id={meta.id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => field.handleChange(v)}
        onValueCommit={() => field.handleBlur()}
        aria-labelledby={meta.labelId}
        aria-describedby={describedBy(meta, description)}
        className="py-2"
      />
    </VerticalShell>
  )
}

/** An agent's settings. Save calls `onSubmit` with every value; return a promise to keep the button busy. */
function AgentEditor({
  defaultValues,
  models,
  tools,
  knowledgeBases = [],
  onSubmit,
  className,
}: {
  defaultValues: AgentValues
  models: AiModel[]
  tools: AgentTool[]
  knowledgeBases?: { id: string; name: string }[]
  onSubmit: (values: AgentValues) => unknown
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.ai.agents.editor
  const oneDecimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })
  const instructions = useStore(form.store, (s) => s.values.instructions)
  const variables = promptVariables(instructions)
  const uid = React.useId()

  return (
    <form
      noValidate
      data-slot="agent-editor"
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t.identity}</CardTitle>
          <CardDescription>{t.identityHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form.AppField name="name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : t.nameRequired) }}>
            {(field) => <field.TextField label={t.name} autoComplete="off" />}
          </form.AppField>
          <form.AppField name="description">{(field) => <field.TextField label={t.description} autoComplete="off" />}</form.AppField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.behaviour}</CardTitle>
          <CardDescription>{t.behaviourHint}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form.AppField name="instructions" validators={{ onChange: ({ value }) => (value.trim() ? undefined : t.instructionsRequired) }}>
            {(field) => <field.TextareaField label={t.instructions} description={t.instructionsHint} rows={8} className="[&_textarea]:font-mono [&_textarea]:text-[13px]" />}
          </form.AppField>
          {variables.length > 0 && (
            <div className="-mt-1 flex flex-wrap items-center gap-1.5" aria-live="polite">
              <span className="text-[12.5px] text-muted-foreground">{t.variables}</span>
              {variables.map((v) => (
                <code key={v} className="rounded-[5px] bg-primary-subtle px-1.5 py-0.5 font-mono text-[12px] text-primary-text">
                  {v}
                </code>
              ))}
            </div>
          )}
          <form.AppField name="model" validators={{ onChange: ({ value }) => (value ? undefined : t.modelRequired) }}>
            {(field) => <field.SelectField label={t.model} options={models.map((m) => ({ value: m.id, label: m.provider ? `${m.name} · ${m.provider}` : m.name }))} />}
          </form.AppField>
          <div className="grid gap-4 md:grid-cols-2">
            <form.AppField name="temperature">
              {() => <SliderField label={t.temperature} description={t.temperatureHint} min={0} max={2} step={0.1} format={(v) => oneDecimal.format(v)} />}
            </form.AppField>
            <form.AppField name="maxSteps">
              {() => <SliderField label={t.maxSteps} description={t.maxStepsHint} min={1} max={30} step={1} />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle id={`${uid}-tools`}>{t.tools}</CardTitle>
          <CardDescription>{t.toolsHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <form.Subscribe selector={(s) => [s.values.tools, s.values.askFirst] as const}>
            {([enabled, askFirst]) => (
              <ul aria-labelledby={`${uid}-tools`} className="m-0 flex list-none flex-col p-0">
                {tools.map((tool) => {
                  const on = enabled.includes(tool.id)
                  const checkId = `${uid}-tool-${tool.id}`
                  const askId = `${uid}-tool-${tool.id}-ask`
                  return (
                    <li key={tool.id} className="flex items-center gap-3 border-b border-border-subtle py-3 first:pt-0 last:border-b-0 last:pb-0">
                      <Checkbox
                        id={checkId}
                        checked={on}
                        onCheckedChange={(v) => {
                          form.setFieldValue("tools", v ? [...enabled, tool.id] : enabled.filter((id) => id !== tool.id))
                          // A sensitive tool asks first by default when it's turned on.
                          if (v && tool.sensitive && !askFirst.includes(tool.id)) form.setFieldValue("askFirst", [...askFirst, tool.id])
                        }}
                      />
                      <label htmlFor={checkId} className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5">
                        <span className="font-mono text-[13px] text-foreground">{tool.name}</span>
                        {tool.description && <span className="text-[12.5px] text-muted-foreground">{tool.description}</span>}
                      </label>
                      <div className="flex shrink-0 items-center gap-2">
                        <label htmlFor={askId} className={cn("text-[12.5px]", on ? "text-fg-secondary" : "text-faint-foreground")}>
                          {t.askFirst}
                        </label>
                        <Switch
                          id={askId}
                          aria-label={`${t.askFirst}: ${tool.name}`}
                          disabled={!on}
                          checked={on && askFirst.includes(tool.id)}
                          onCheckedChange={(v) => form.setFieldValue("askFirst", v ? [...askFirst, tool.id] : askFirst.filter((id) => id !== tool.id))}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </form.Subscribe>
        </CardContent>
      </Card>

      {knowledgeBases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.knowledge}</CardTitle>
            <CardDescription>{t.knowledgeHint}</CardDescription>
          </CardHeader>
          <CardContent>
            <form.AppField name="knowledge">
              {(field) => <field.MultiSelectField label={t.knowledge} hideLabel placeholder={t.knowledgePlaceholder} options={knowledgeBases.map((k) => ({ value: k.id, label: k.name }))} />}
            </form.AppField>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <form.AppForm>
          <form.SubmitButton pendingLabel={t.saving}>{t.save}</form.SubmitButton>
        </form.AppForm>
      </div>
    </form>
  )
}

export { AgentEditor, AgentList, AgentStatusBadge, promptVariables, type AgentStatus, type AgentSummary, type AgentTool, type AgentValues }
