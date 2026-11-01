'use client'

// Coreloom UI — ToolCall. One call an agent makes to a tool, as a folded card: the tool's name and
// where it stands (preparing, running, done, failed, waiting for approval), with its input and
// output underneath. Takes an AI SDK tool part as it is. When the call needs approval, the card
// opens with Allow / Deny; wire them to `addToolApprovalResponse`.
//
// Generative UI: `tool` draws the call as your own component (a skeleton while `getWeather` runs,
// a weather card once it answers), inside the card or, with `display: 'inline'`, in place of it:
//
//   const weather: ToolComponent<{ city: string }, Weather> = { label: 'Weather', display: 'inline',
//     render: (call) => call.state === 'output-available' ? <WeatherCard {...call.output} /> : <WeatherSkeleton /> }
//   <ToolCall part={part} tool={weather} />
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleAlertIcon,
  ShieldQuestionIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Spinner } from '@/components/ui/spinner'
import { type AiToolPart, type AiToolState, toolName } from '@/lib/ai'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** States in which the tool hasn't answered yet. */
const RUNNING = new Set<AiToolState>(['input-streaming', 'input-available', 'approval-responded'])

/** The part's state, input and output, in the narrowed shape a tool's component reads. */
function renderState(part: AiToolPart) {
  if (part.state === 'output-error')
    return { state: part.state, input: part.input, errorText: part.errorText ?? '' }
  // The part is the SDK's discriminated union, flattened: put it back together by state.
  return { state: part.state, input: part.input, output: part.output } as ToolRenderState<
    unknown,
    unknown
  >
}

function Json({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <pre className="m-0 max-h-64 overflow-auto rounded-md bg-inset px-3 py-2.5 font-mono text-[12px] leading-[1.6] whitespace-pre-wrap text-foreground">
      {text}
    </pre>
  )
}

/** An object with every field optional, all the way down: a tool's input while it streams in. */
type PartialDeep<T> = T extends readonly (infer Item)[]
  ? readonly PartialDeep<Item>[]
  : T extends object
    ? { [K in keyof T]?: PartialDeep<T[K]> }
    : T

/** What happens to the call: the input arrives, it runs, maybe asks first, then answers or fails. */
type ToolRenderState<Input, Output> =
  | { state: 'input-streaming'; input: PartialDeep<Input> | undefined; output?: undefined }
  | {
      state: 'input-available' | 'approval-requested' | 'approval-responded' | 'output-denied'
      input: Input
      output?: undefined
    }
  | { state: 'output-available'; input: Input; output: Output }
  | { state: 'output-error'; input: Input | undefined; output?: undefined; errorText: string }

/**
 * What a tool's component gets: the call as it stands, narrowed by `state` — `output` is there
 * once the state is 'output-available', the input is partial while it's 'input-streaming'.
 */
type ToolRenderProps<Input = unknown, Output = unknown> = ToolRenderState<Input, Output> & {
  toolCallId: string
  /** The part as it came, for anything else (`title`, `approval`, provider fields). */
  part: AiToolPart
  /** Answer an approval from your own buttons; there while the state is 'approval-requested'. */
  respond?: (approved: boolean) => void
}

/** How one tool draws: a name, a component, and whether it sits inside the card or replaces it. */
interface ToolComponent<Input = unknown, Output = unknown> {
  /** A human name ("Weather"), on the card and for screen readers; defaults to the tool's id. */
  label?: React.ReactNode
  /** Draw the call (any state). Return undefined to keep the card's own view for that state. */
  render(props: ToolRenderProps<Input, Output>): React.ReactNode
  /** 'card' (default): inside the folded card, unfolded. 'inline': in place of the card. */
  display?: 'card' | 'inline'
}

/**
 * Components by tool name, typed from the app's tools:
 * `const tools: ToolComponents<InferUITools<typeof myTools>> = { getWeather: { render: … } }`.
 */
type ToolComponents<
  Tools extends { [K in keyof Tools]: { input: unknown; output: unknown } } = Record<
    string,
    { input: unknown; output: unknown }
  >,
> = { [K in keyof Tools]?: ToolComponent<Tools[K]['input'], Tools[K]['output']> }

function ToolCall({
  part,
  label,
  tool,
  renderOutput,
  onApprovalResponse,
  defaultOpen,
  className,
}: {
  /** The tool part from the message (`tool-<name>` or `dynamic-tool`). */
  part: AiToolPart
  /** A human name for the tool ("Search the docs"); defaults to its id. */
  label?: React.ReactNode
  /** Generative UI: draw the call as your own component (`render`), in the card or in place of it. */
  tool?: ToolComponent
  /** Draw the output only (a chart, a card); return undefined for JSON. `tool` takes precedence. */
  renderOutput?: (output: unknown) => React.ReactNode | undefined
  /** Allow / Deny on calls that ask for approval. */
  onApprovalResponse?: (response: { id: string; approved: boolean }) => void
  defaultOpen?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.tool
  const labelId = React.useId()
  const asking = part.state === 'approval-requested'
  const { approval } = part
  // Answering removes the buttons that had focus: remember it, and move focus to the call (below).
  const answered = React.useRef(false)
  const root = React.useRef<HTMLDivElement>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const answer = (approved: boolean) => {
    if (!approval || !onApprovalResponse) return
    answered.current = true
    onApprovalResponse({ id: approval.id, approved })
  }
  const respond = asking && approval && onApprovalResponse ? answer : undefined
  // eslint-disable-next-line react-hooks/refs -- `respond` writes a ref when clicked, never during render.
  const custom = tool?.render({ ...renderState(part), toolCallId: part.toolCallId, part, respond })
  const isCustom = custom !== undefined && custom !== null && custom !== false
  const drawn = isCustom
    ? custom
    : part.state === 'output-available' && renderOutput
      ? renderOutput(part.output)
      : undefined
  const isDrawn = drawn !== undefined && drawn !== null
  const [open, setOpen] = React.useState(
    defaultOpen ?? (asking || part.state === 'output-error' || isDrawn),
  )
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- unfolds when the call starts asking for approval.
    if (asking) setOpen(true)
  }, [asking])
  // A result drawn as UI is the answer: show it as soon as it arrives.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- unfolds when a drawn result arrives.
    if (isDrawn && defaultOpen === undefined) setOpen(true)
  }, [isDrawn, defaultOpen])

  React.useEffect(() => {
    if (asking || !answered.current) return
    answered.current = false
    const focused = document.activeElement
    if (focused && focused !== document.body && root.current?.contains(focused)) return
    ;(trigger.current ?? root.current)?.focus()
  }, [asking])

  const name = label ?? tool?.label ?? part.title ?? toolName(part)

  // Inline: the component is the call. It's labelled with the tool's name for screen readers, and
  // busy while the input streams in or the tool runs.
  if (tool?.display === 'inline' && isCustom)
    return (
      <div
        ref={root}
        role="group"
        aria-labelledby={labelId}
        tabIndex={-1}
        aria-busy={RUNNING.has(part.state) || undefined}
        data-slot="tool-call"
        data-display="inline"
        data-state-name={part.state}
        className={cn(
          'min-w-0 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
          className,
        )}
      >
        <p id={labelId} className="sr-only">
          {name}
        </p>
        {custom}
      </div>
    )

  const status = {
    'input-streaming': {
      icon: <Spinner className="size-3.5" aria-hidden role="presentation" />,
      tone: 'text-muted-foreground',
    },
    'input-available': {
      icon: <Spinner className="size-3.5" aria-hidden role="presentation" />,
      tone: 'text-muted-foreground',
    },
    'approval-requested': {
      icon: <ShieldQuestionIcon className="size-3.5" />,
      tone: 'text-warning',
    },
    'approval-responded': {
      icon: <Spinner className="size-3.5" aria-hidden role="presentation" />,
      tone: 'text-muted-foreground',
    },
    'output-available': { icon: <CheckCircle2Icon className="size-3.5" />, tone: 'text-success' },
    'output-error': { icon: <CircleAlertIcon className="size-3.5" />, tone: 'text-destructive' },
    'output-denied': { icon: <XCircleIcon className="size-3.5" />, tone: 'text-muted-foreground' },
  }[part.state]

  return (
    <Collapsible
      ref={root}
      open={open}
      onOpenChange={setOpen}
      data-slot="tool-call"
      data-state-name={part.state}
      className={cn(
        'rounded-md border border-border bg-card text-[13px]',
        asking && 'border-warning/60',
        className,
      )}
    >
      <CollapsibleTrigger
        ref={trigger}
        className="group flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <WrenchIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 font-mono text-[12.5px] break-words text-foreground">
          {name}
        </span>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 text-right text-[12px]',
            status.tone,
          )}
        >
          {status.icon}
          {t.states[part.state]}
        </span>
        <ChevronRightIcon
          className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-180 group-data-[state=open]:rotate-90"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 border-t border-border-subtle px-3 pt-2.5 pb-3">
          {isCustom && custom}
          {!isCustom && part.input !== undefined && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.input}
              </p>
              <Json value={part.input} />
            </div>
          )}
          {asking && approval && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-subtle px-3 py-2.5">
              <p className="m-0 text-[13px] text-foreground">
                {approval.requestReason ?? t.approvalHint}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    answer(false)
                  }}
                >
                  {t.deny}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    answer(true)
                  }}
                >
                  {t.approve}
                </Button>
              </div>
            </div>
          )}
          {!isCustom && part.state === 'output-available' && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.output}
              </p>
              {isDrawn ? drawn : <Json value={part.output} />}
            </div>
          )}
          {!isCustom && part.state === 'output-error' && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-destructive uppercase">
                {t.error}
              </p>
              <p className="m-0 rounded-md bg-destructive-subtle px-3 py-2 text-[13px] text-foreground">
                {part.errorText}
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export {
  ToolCall,
  type ToolComponent,
  type ToolComponents,
  type ToolRenderProps,
  type ToolRenderState,
}
