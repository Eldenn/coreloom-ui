'use client'

// Coreloom UI — AI playground (block). One prompt, up to three variants side by side — each its own
// model and temperature — to compare answers, latency, tokens and cost. You run the models: the
// block calls `onRun` with the prompt and the variants, and shows the `results` you stream back.
import { PlayIcon, PlusIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Markdown } from '@/components/ui/markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { type AiModel, formatCost, formatDuration } from '@/lib/ai'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface PlaygroundVariant {
  id: string
  model: string
  temperature: number
}

interface PlaygroundResult {
  status: 'idle' | 'running' | 'done' | 'error'
  /** The answer so far (Markdown). */
  text?: string
  latencyMs?: number
  tokens?: number
  cost?: number
  error?: string
}

function Playground({
  models,
  defaultVariants,
  defaultSystem = '',
  defaultPrompt = '',
  results = {},
  onRun,
  maxVariants = 3,
  className,
}: {
  models: AiModel[]
  defaultVariants: PlaygroundVariant[]
  defaultSystem?: string
  defaultPrompt?: string
  /** Each variant's result, by variant id. Update it as tokens arrive. */
  results?: Record<string, PlaygroundResult | undefined>
  onRun: (request: { system: string; prompt: string; variants: PlaygroundVariant[] }) => void
  maxVariants?: number
  className?: string
}) {
  const { messages, locale, formatNumber } = useCoreloomI18n()
  const t = messages.ai.playground
  const [system, setSystem] = React.useState(defaultSystem)
  const [prompt, setPrompt] = React.useState(defaultPrompt)
  const [variants, setVariants] = React.useState(defaultVariants)
  const running = variants.some((v) => results[v.id]?.status === 'running')
  const uid = React.useId()
  const oneDecimal = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  const update = (id: string, patch: Partial<PlaygroundVariant>) => {
    setVariants((all) => all.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  return (
    <div data-slot="playground" className={cn('flex flex-col gap-4', className)}>
      <form
        className="grid gap-4 rounded-lg border border-border bg-card p-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (prompt.trim() && !running) onRun({ system, prompt: prompt.trim(), variants })
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-system`}>{t.system}</Label>
          <Textarea
            id={`${uid}-system`}
            value={system}
            onChange={(e) => {
              setSystem(e.target.value)
            }}
            placeholder={t.systemPlaceholder}
            className="min-h-28 font-mono text-[13px]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${uid}-prompt`}>{t.prompt}</Label>
          <Textarea
            id={`${uid}-prompt`}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
            }}
            placeholder={t.promptPlaceholder}
            className="min-h-28"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
                e.currentTarget.form?.requestSubmit()
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            disabled={variants.length >= maxVariants}
            onClick={() => {
              const last = variants[variants.length - 1]
              setVariants([
                ...variants,
                {
                  id: `v${Date.now()}`,
                  model: last?.model ?? models[0]?.id ?? '',
                  temperature: last?.temperature ?? 0.7,
                },
              ])
            }}
          >
            <PlusIcon />
            {t.addVariant}
          </Button>
          <Button type="submit" disabled={!prompt.trim() || running}>
            {running ? (
              <Spinner className="text-primary-foreground" aria-hidden role="presentation" />
            ) : (
              <PlayIcon />
            )}
            {running ? t.running : t.run}
          </Button>
        </div>
      </form>

      <div
        className={cn(
          'grid gap-4',
          variants.length === 2 && 'lg:grid-cols-2',
          variants.length >= 3 && 'lg:grid-cols-3',
        )}
      >
        {variants.map((v, i) => {
          const r = results[v.id]
          const headingId = `${uid}-variant-${v.id}`
          return (
            <section
              key={v.id}
              aria-labelledby={headingId}
              aria-busy={r?.status === 'running' || undefined}
              className="flex min-w-0 flex-col rounded-lg border border-border bg-card"
            >
              <header className="flex flex-col gap-3 border-b border-border-subtle p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 id={headingId} className="m-0 text-[13.5px] font-semibold text-foreground">
                    {t.variant(i + 1)}
                  </h3>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.removeVariant(i + 1)}
                      onClick={() => {
                        setVariants(variants.filter((x) => x.id !== v.id))
                      }}
                    >
                      <XIcon />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] items-end gap-3">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor={`${headingId}-model`} className="text-[12.5px]">
                      {t.model}
                    </Label>
                    <Select
                      value={v.model}
                      onValueChange={(model) => {
                        update(v.id, { model })
                      }}
                    >
                      <SelectTrigger id={`${headingId}-model`} size="sm" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label id={`${headingId}-temp`} className="text-[12.5px]">
                        {t.temperature}
                      </Label>
                      <span className="font-mono text-[12px] text-foreground tabular-nums">
                        {oneDecimal.format(v.temperature)}
                      </span>
                    </div>
                    <Slider
                      aria-labelledby={`${headingId}-temp`}
                      min={0}
                      max={2}
                      step={0.1}
                      value={[v.temperature]}
                      onValueChange={([temperature]) => {
                        update(v.id, { temperature })
                      }}
                      className="py-2"
                    />
                  </div>
                </div>
              </header>
              <div className="min-h-40 flex-1 p-4">
                {!r || r.status === 'idle' ? (
                  <p className="m-0 text-[13px] text-muted-foreground">{t.empty}</p>
                ) : r.status === 'error' ? (
                  <p className="m-0 rounded-md bg-destructive-subtle px-3 py-2 text-[13px] text-foreground">
                    {r.error}
                  </p>
                ) : r.text ? (
                  <Markdown streaming={r.status === 'running'}>{r.text}</Markdown>
                ) : (
                  <Spinner />
                )}
              </div>
              {r?.status === 'done' && (
                <footer className="grid grid-cols-3 gap-2 border-t border-border-subtle px-4 py-2.5 font-mono text-[11.5px]">
                  {[
                    [
                      t.latency,
                      r.latencyMs !== undefined ? formatDuration(r.latencyMs, locale) : '—',
                    ],
                    [t.tokens, r.tokens !== undefined ? formatNumber(r.tokens) : '—'],
                    [t.cost, r.cost !== undefined ? formatCost(r.cost, locale) : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </footer>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export { Playground, type PlaygroundResult, type PlaygroundVariant }
