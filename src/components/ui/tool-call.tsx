'use client'

// Coreloom UI — ToolCall. One call an agent makes to a tool, as a folded card: the tool's name and
// where it stands (preparing, running, done, failed, waiting for approval), with its input and
// output underneath. Takes an AI SDK tool part as it is. When the call needs approval, the card
// opens with Allow / Deny; wire them to `addToolApprovalResponse`.
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
import { type AiToolPart, toolName } from '@/lib/ai'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

function Json({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <pre className="m-0 max-h-64 overflow-auto rounded-md bg-inset px-3 py-2.5 font-mono text-[12px] leading-[1.6] whitespace-pre-wrap text-foreground">
      {text}
    </pre>
  )
}

function ToolCall({
  part,
  label,
  renderOutput,
  onApprovalResponse,
  defaultOpen,
  className,
}: {
  /** The tool part from the message (`tool-<name>` or `dynamic-tool`). */
  part: AiToolPart
  /** A human name for the tool ("Search the docs"); defaults to its id. */
  label?: React.ReactNode
  /** Draw the output yourself (a chart, a card); return undefined for JSON. A drawn output shows unfolded. */
  renderOutput?: (output: unknown) => React.ReactNode | undefined
  /** Allow / Deny on calls that ask for approval. */
  onApprovalResponse?: (response: { id: string; approved: boolean }) => void
  defaultOpen?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.ai.tool
  const asking = part.state === 'approval-requested'
  const drawn =
    part.state === 'output-available' && renderOutput ? renderOutput(part.output) : undefined
  const isDrawn = drawn !== undefined && drawn !== null
  const [open, setOpen] = React.useState(
    defaultOpen ?? (asking || part.state === 'output-error' || isDrawn),
  )
  React.useEffect(() => {
    if (asking) setOpen(true)
  }, [asking])
  // A result drawn as UI is the answer: show it as soon as it arrives.
  React.useEffect(() => {
    if (isDrawn && defaultOpen === undefined) setOpen(true)
  }, [isDrawn, defaultOpen])

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
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring">
        <WrenchIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 font-mono text-[12.5px] break-words text-foreground">
          {label ?? part.title ?? toolName(part)}
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
          {part.input !== undefined && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.input}
              </p>
              <Json value={part.input} />
            </div>
          )}
          {asking && part.approval && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-subtle px-3 py-2.5">
              <p className="m-0 text-[13px] text-foreground">
                {part.approval.requestReason ?? t.approvalHint}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprovalResponse?.({ id: part.approval!.id, approved: false })}
                >
                  {t.deny}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApprovalResponse?.({ id: part.approval!.id, approved: true })}
                >
                  {t.approve}
                </Button>
              </div>
            </div>
          )}
          {part.state === 'output-available' && (
            <div className="flex flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.output}
              </p>
              {isDrawn ? drawn : <Json value={part.output} />}
            </div>
          )}
          {part.state === 'output-error' && (
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

export { ToolCall }
