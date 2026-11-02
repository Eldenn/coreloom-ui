'use client'

// Coreloom UI — Integrations (settings block). The apps a workspace can connect: a card each with
// its logo, what it does and whether it's connected (and as whom), plus search and category
// filters. Connect, Configure and Disconnect are callbacks: run your OAuth flow in `onConnect`.
import { CheckIcon, PlugIcon, SearchIcon, SettingsIcon } from 'lucide-react'
import * as React from 'react'

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
import { ChipGroup } from '@/components/ui/chip-group'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  description: string
  /** The app's logo: an <img> or an SVG. A plug icon without one. */
  logo?: React.ReactNode
  category?: string
  connected?: boolean
  /** Who or what it's connected as ("#deploys", "acme-org"). */
  account?: string
  /** Not available on the current plan, or coming soon: the button is disabled with this note. */
  unavailable?: string
}

const ALL = '__all__'

function IntegrationCard({
  integration: it,
  onConnect,
  onConfigure,
  onDisconnect,
}: {
  integration: Integration
  onConnect?: (id: string) => unknown
  onConfigure?: (id: string) => unknown
  onDisconnect?: (id: string) => unknown
}) {
  const { messages } = useCoreloomI18n()
  const t = messages.integrations
  const [busy, setBusy] = React.useState(false)
  const nameId = React.useId()
  const connect = async () => {
    if (!onConnect) return
    setBusy(true)
    try {
      await onConnect(it.id)
    } finally {
      setBusy(false)
    }
  }
  return (
    <li
      data-slot="integration"
      data-connected={it.connected ? true : undefined}
      aria-labelledby={nameId}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background text-muted-foreground [&_svg]:size-5 [&>img]:size-6"
        >
          {it.logo ?? <PlugIcon />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <span id={nameId} className="text-[14px] font-semibold text-foreground">
              {it.name}
            </span>
            {it.connected && (
              <Badge variant="success">
                <CheckIcon />
                {t.connected}
              </Badge>
            )}
          </span>
          {it.category && <span className="text-[12px] text-muted-foreground">{it.category}</span>}
        </div>
      </div>
      <p className="m-0 flex-1 text-[13px] leading-[1.5] text-fg-secondary">{it.description}</p>
      {it.connected && it.account && (
        <p className="m-0 truncate font-mono text-[12px] text-muted-foreground">
          {t.connectedAs(it.account)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {it.connected ? (
          <>
            {onConfigure && (
              <Button
                variant="outline"
                size="sm"
                aria-label={t.configure(it.name)}
                onClick={() => void onConfigure(it.id)}
              >
                <SettingsIcon />
                {t.configureShort}
              </Button>
            )}
            {onDisconnect && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label={t.disconnect(it.name)}>
                    {t.disconnectShort}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.disconnectTitle(it.name)}</AlertDialogTitle>
                    <AlertDialogDescription>{t.disconnectDescription}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => void onDisconnect(it.id)}
                    >
                      {t.disconnectShort}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : it.unavailable ? (
          <>
            <Button variant="outline" size="sm" disabled>
              {t.connectShort}
            </Button>
            <span className="text-[12px] text-muted-foreground">{it.unavailable}</span>
          </>
        ) : (
          onConnect && (
            <Button
              variant="outline"
              size="sm"
              aria-label={t.connect(it.name)}
              aria-busy={busy || undefined}
              disabled={busy}
              onClick={() => void connect()}
            >
              {busy && <Spinner />}
              {busy ? t.connecting : t.connectShort}
            </Button>
          )
        )}
      </div>
    </li>
  )
}

function Integrations({
  integrations,
  onConnect,
  onConfigure,
  onDisconnect,
  className,
}: {
  integrations: Integration[]
  /** Starts the connection (an OAuth popup, a redirect); return a promise to show progress. */
  onConnect?: (id: string) => unknown
  /** Shows Configure on connected apps. */
  onConfigure?: (id: string) => unknown
  /** Shows Disconnect on connected apps (after a confirmation). */
  onDisconnect?: (id: string) => unknown
  className?: string
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.integrations
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState(ALL)
  const listId = React.useId()
  const categories = [...new Set(integrations.flatMap((i) => (i.category ? [i.category] : [])))]
  const connectedCount = integrations.filter((i) => i.connected).length
  const q = query.trim().toLocaleLowerCase()
  const shown = integrations.filter(
    (i) =>
      (category === ALL || (category === 'connected' ? i.connected : i.category === category)) &&
      (!q || `${i.name} ${i.description} ${i.category ?? ''}`.toLocaleLowerCase().includes(q)),
  )

  return (
    <div data-slot="integrations" className={cn('flex min-w-0 flex-col gap-4', className)}>
      <div className="flex flex-col gap-3">
        <div className="relative w-full max-w-80">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            placeholder={t.search}
            aria-label={t.search}
            aria-controls={listId}
            className="h-9 pl-9"
          />
        </div>
        {(categories.length > 0 || connectedCount > 0) && (
          <ChipGroup
            type="single"
            size="sm"
            aria-label={t.categories}
            value={category}
            onValueChange={(v) => {
              setCategory(v || ALL)
            }}
            options={[
              { value: ALL, label: t.all, count: integrations.length },
              ...(connectedCount
                ? [{ value: 'connected', label: t.connected, count: connectedCount }]
                : []),
              ...categories.map((c) => ({
                value: c,
                label: c,
                count: integrations.filter((i) => i.category === c).length,
              })),
            ]}
          />
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {q || category !== ALL ? t.results(shown.length, formatNumber(shown.length)) : ''}
      </p>
      {shown.length ? (
        <ul
          id={listId}
          aria-label={t.title}
          className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-3 p-0"
        >
          {shown.map((i) => (
            <IntegrationCard
              key={i.id}
              integration={i}
              onConnect={onConnect}
              onConfigure={onConfigure}
              onDisconnect={onDisconnect}
            />
          ))}
        </ul>
      ) : (
        <p
          id={listId}
          className="m-0 rounded-xl border border-dashed border-border px-5 py-10 text-center text-[13px] text-muted-foreground"
        >
          {t.empty}
        </p>
      )}
    </div>
  )
}

export { type Integration, Integrations }
