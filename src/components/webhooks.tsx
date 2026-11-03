'use client'

// Coreloom UI — Webhooks (settings block). The endpoints your app sends events to: their URL, the
// events they listen to, on / off, the signing secret, and each endpoint's recent deliveries with
// the payload, the response and Redeliver. Add, toggle, delete, redeliver and "send a test event"
// are callbacks: the block calls nothing itself.
import {
  ChevronDownIcon,
  PlusIcon,
  RotateCcwIcon,
  SendIcon,
  Trash2Icon,
  WebhookIcon,
} from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppForm } from '@/components/ui/form'
import { JsonViewer } from '@/components/ui/json-viewer'
import { RelativeTime } from '@/components/ui/relative-time'
import { SecretValue } from '@/components/ui/secret-value'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Spinner } from '@/components/ui/spinner'
import { StatusDot } from '@/components/ui/status-indicator'
import { Switch } from '@/components/ui/switch'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface WebhookEndpoint {
  id: string
  url: string
  description?: string
  /** Event values (see `events`). */
  events: string[]
  enabled: boolean
  /** The signing secret, shown masked with Show and Copy. */
  secret?: string
}

interface WebhookEventType {
  value: string
  label: string
  description?: string
}

interface WebhookDelivery {
  id: string
  endpointId: string
  event: string
  status: 'succeeded' | 'failed' | 'pending'
  /** The HTTP status the endpoint answered with. */
  statusCode?: number
  at: Date
  durationMs?: number
  /** 1 for the first try. */
  attempt?: number
  /** The JSON body that was sent. */
  payload?: unknown
  /** What the endpoint answered (text). */
  response?: string
}

interface WebhookInput {
  url: string
  description: string
  events: string[]
}

const deliveryVariant = {
  succeeded: 'success',
  failed: 'destructive',
  pending: 'secondary',
} as const

/** https URLs only: a webhook that goes out in clear leaks its payloads. */
const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function AddEndpointDialog({
  events,
  onCreate,
}: {
  events: WebhookEventType[]
  onCreate: (input: WebhookInput) => unknown
}) {
  const t = useCoreloomI18n().messages.webhooks
  const [open, setOpen] = React.useState(false)
  const form = useAppForm({
    defaultValues: { url: '', description: '', events: [] as string[] },
    validators: {
      onChange: z.object({
        url: z.string().refine(isHttpsUrl, t.urlInvalid),
        description: z.string(),
        events: z.array(z.string()).min(1, t.eventsRequired),
      }),
    },
    onSubmit: async ({ value }) => {
      await onCreate({ ...value, url: value.url.trim(), description: value.description.trim() })
      setOpen(false)
    },
  })
  React.useEffect(() => {
    if (open) form.reset()
  }, [open, form])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          {t.add}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{t.addTitle}</DialogTitle>
            <DialogDescription>{t.addDescription}</DialogDescription>
          </DialogHeader>
          <form.AppField name="url">
            {(field) => (
              <field.TextField
                label={t.url}
                type="url"
                inputMode="url"
                placeholder="https://example.com/webhooks"
                autoComplete="off"
              />
            )}
          </form.AppField>
          <form.AppField name="description">
            {(field) => <field.TextField label={t.endpointDescription} autoComplete="off" />}
          </form.AppField>
          <form.AppField name="events">
            {(field) => (
              <field.MultiSelectField
                label={t.events}
                options={events}
                placeholder={t.pickEvents}
              />
            )}
          </form.AppField>
          <DialogFooter>
            <form.AppForm>
              <form.SubmitButton pendingLabel={t.adding}>{t.add}</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeliveryRow({
  delivery,
  eventLabel,
  onRedeliver,
}: {
  delivery: WebhookDelivery
  eventLabel: string
  onRedeliver?: (delivery: WebhookDelivery) => unknown
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.webhooks
  const [busy, setBusy] = React.useState(false)
  const redeliver = async () => {
    if (!onRedeliver) return
    setBusy(true)
    try {
      await onRedeliver(delivery)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Collapsible asChild>
      <li data-slot="webhook-delivery" className="border-b border-border-subtle last:border-b-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group/trigger flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ChevronDownIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
              />
              <Badge variant={deliveryVariant[delivery.status]} className="min-w-14">
                {delivery.statusCode ?? t.status[delivery.status]}
                {delivery.statusCode !== undefined && (
                  <span className="sr-only"> {t.status[delivery.status]}</span>
                )}
              </Badge>
              <span className="min-w-0 truncate font-mono text-[12.5px] text-foreground">
                {eventLabel}
              </span>
            </button>
          </CollapsibleTrigger>
          <span className="flex items-center gap-3 font-mono text-[11.5px] text-muted-foreground">
            {delivery.attempt !== undefined && delivery.attempt > 1 && (
              <span>{t.attempt(delivery.attempt)}</span>
            )}
            {delivery.durationMs !== undefined && (
              <span>{t.duration(formatNumber(delivery.durationMs))}</span>
            )}
            <RelativeTime date={delivery.at} style="short" />
          </span>
          {onRedeliver && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={t.redeliverOne(eventLabel)}
              aria-busy={busy || undefined}
              disabled={busy}
              onClick={() => void redeliver()}
            >
              {busy ? <Spinner /> : <RotateCcwIcon />}
              {t.redeliver}
            </Button>
          )}
        </div>
        <CollapsibleContent>
          <div className="grid gap-3 border-t border-border-subtle bg-surface/50 px-4 py-3 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.request}
              </p>
              {delivery.payload === undefined ? (
                <p className="m-0 text-[12.5px] text-muted-foreground">{t.noBody}</p>
              ) : (
                <JsonViewer value={delivery.payload} maxHeight="240px" aria-label={t.request} />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="m-0 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {t.response}
              </p>
              {delivery.response ? (
                <pre className="m-0 max-h-60 overflow-auto rounded-md border border-border bg-inset p-3 font-mono text-[12px] whitespace-pre-wrap text-fg-secondary">
                  {delivery.response}
                </pre>
              ) : (
                <p className="m-0 text-[12.5px] text-muted-foreground">{t.noBody}</p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  )
}

function EndpointPanel({
  endpoint,
  deliveries,
  eventLabel,
  onRedeliver,
  onSendTest,
  onRevealSecret,
}: {
  endpoint: WebhookEndpoint
  deliveries: WebhookDelivery[]
  eventLabel: (value: string) => string
  onRedeliver?: (delivery: WebhookDelivery) => unknown
  onSendTest?: (endpointId: string) => unknown
  onRevealSecret?: (endpointId: string) => void
}) {
  const t = useCoreloomI18n().messages.webhooks
  const [filter, setFilter] = React.useState<'all' | 'failed'>('all')
  const [sending, setSending] = React.useState(false)
  const shown = deliveries
    .filter((d) => filter === 'all' || d.status === 'failed')
    .sort((a, b) => b.at.getTime() - a.at.getTime())
  const sendTest = async () => {
    if (!onSendTest) return
    setSending(true)
    try {
      await onSendTest(endpoint.id)
    } finally {
      setSending(false)
    }
  }
  return (
    <div className="flex flex-col gap-4 border-t border-border-subtle bg-surface/40 px-5 py-4">
      {endpoint.secret && (
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-[13px] font-medium text-foreground">{t.secret}</p>
          <SecretValue
            value={endpoint.secret}
            visibleStart={6}
            label={t.secretName}
            onReveal={onRevealSecret ? () => onRevealSecret(endpoint.id) : undefined}
            className="w-full max-w-md"
          />
          <p className="m-0 text-[12.5px] text-muted-foreground">{t.secretHint}</p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-[13px] font-medium text-foreground">{t.deliveries}</p>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            size="sm"
            aria-label={t.filter}
            value={filter}
            onValueChange={(v) => setFilter(v as 'all' | 'failed')}
            options={[
              { value: 'all', label: t.all },
              { value: 'failed', label: t.failedOnly },
            ]}
          />
          {onSendTest && (
            <Button
              variant="outline"
              size="sm"
              aria-busy={sending || undefined}
              disabled={sending}
              onClick={() => void sendTest()}
            >
              {sending ? <Spinner /> : <SendIcon />}
              {t.sendTest}
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {shown.length ? (
          <ul aria-label={t.deliveriesOf(endpoint.url)} className="m-0 list-none p-0">
            {shown.map((d) => (
              <DeliveryRow
                key={d.id}
                delivery={d}
                eventLabel={eventLabel(d.event)}
                onRedeliver={onRedeliver}
              />
            ))}
          </ul>
        ) : (
          <p className="m-0 px-4 py-6 text-center text-[13px] text-muted-foreground">
            {filter === 'failed' ? t.noFailures : t.noDeliveries}
          </p>
        )}
      </div>
    </div>
  )
}

function Webhooks({
  endpoints,
  deliveries = [],
  events,
  defaultOpenId,
  onCreate,
  onToggle,
  onDelete,
  onRedeliver,
  onSendTest,
  onRevealSecret,
  title,
  description,
  className,
}: {
  endpoints: WebhookEndpoint[]
  /** Recent deliveries of every endpoint; each endpoint shows its own. */
  deliveries?: WebhookDelivery[]
  /** The events an endpoint can listen to. */
  events: WebhookEventType[]
  /** The endpoint whose details are open at first. */
  defaultOpenId?: string
  /** Shows Add endpoint. A rejected promise keeps the dialog open. */
  onCreate?: (input: WebhookInput) => unknown
  /** Shows the on / off switch. */
  onToggle?: (id: string, enabled: boolean) => unknown
  onDelete?: (id: string) => unknown
  /** Sends a delivery again; return a promise to show progress. */
  onRedeliver?: (delivery: WebhookDelivery) => unknown
  /** Shows "Send test event" on each endpoint. */
  onSendTest?: (endpointId: string) => unknown
  /** Called when someone shows a signing secret, for your audit log. */
  onRevealSecret?: (endpointId: string) => void
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.webhooks
  const [openId, setOpenId] = React.useState(defaultOpenId)
  const eventLabel = (v: string) => events.find((e) => e.value === v)?.label ?? v

  return (
    <Card className={cn('gap-0 p-0', className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle asChild>
          <h2 className="m-0">{title ?? t.title}</h2>
        </CardTitle>
        <CardDescription>{description ?? t.description}</CardDescription>
        {onCreate && (
          <CardAction>
            <AddEndpointDialog events={events} onCreate={onCreate} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {endpoints.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-5">
              <WebhookIcon aria-hidden />
            </span>
            <p className="m-0 text-[14px] font-medium text-foreground">{t.empty}</p>
            <p className="m-0 text-[13px] text-muted-foreground">{t.emptyHint}</p>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {endpoints.map((ep) => {
              const own = deliveries.filter((d) => d.endpointId === ep.id)
              const failed = own.filter((d) => d.status === 'failed').length
              const open = openId === ep.id
              return (
                <li
                  key={ep.id}
                  data-slot="webhook-endpoint"
                  className="border-b border-border last:border-b-0"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                    <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <StatusDot tone={ep.enabled ? 'success' : 'neutral'} />
                        <span className="truncate font-mono text-[13px] text-foreground">
                          {ep.url}
                        </span>
                        {!ep.enabled && <Badge variant="secondary">{t.disabled}</Badge>}
                      </span>
                      {ep.description && (
                        <span className="truncate text-[12.5px] text-muted-foreground">
                          {ep.description}
                        </span>
                      )}
                      <span className="text-[12.5px] text-fg-secondary">
                        {t.listensTo(ep.events.length)}
                        {failed > 0 && (
                          <span className="text-destructive"> · {t.failures(failed)}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {onToggle && (
                        <Switch
                          checked={ep.enabled}
                          aria-label={t.enable(ep.url)}
                          onCheckedChange={(v) => void onToggle(ep.id, v)}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        aria-expanded={open}
                        aria-label={t.details(ep.url)}
                        onClick={() => {
                          setOpenId(open ? undefined : ep.id)
                        }}
                      >
                        {t.detailsShort}
                        <ChevronDownIcon
                          className={cn(
                            'transition-transform motion-reduce:transition-none',
                            open && 'rotate-180',
                          )}
                        />
                      </Button>
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={t.delete(ep.url)}>
                              <Trash2Icon />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.deleteDescription(ep.url)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => void onDelete(ep.id)}
                              >
                                {t.deleteConfirm}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  {open && (
                    <EndpointPanel
                      endpoint={ep}
                      deliveries={own}
                      eventLabel={eventLabel}
                      onRedeliver={onRedeliver}
                      onSendTest={onSendTest}
                      onRevealSecret={onRevealSecret}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export {
  isHttpsUrl,
  type WebhookDelivery,
  type WebhookEndpoint,
  type WebhookEventType,
  type WebhookInput,
  Webhooks,
}
