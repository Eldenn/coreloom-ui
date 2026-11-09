'use client'

// Coreloom UI — NotificationPreferences (settings block). Which notifications someone gets, and
// where: a grid of events (grouped) by channels (e-mail, push, in-app…), a checkbox per cell and a
// checkbox per channel to switch it for every event. Some channels can be required for an event
// (security alerts by e-mail) or not offered. The value is `{ [eventId]: channelIds[] }`: save it
// in `onValueChange` (autosave) or from your own Save button.
import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface NotificationChannel {
  id: string
  label: string
}

interface NotificationEvent {
  id: string
  label: string
  description?: string
  /** A heading the event is listed under ("Projects", "Billing"). */
  group?: string
  /** Channels always on for this event: shown ticked and locked. */
  required?: string[]
  /** Channels this event is never sent on: no checkbox. */
  unavailable?: string[]
}

/** The channels each event is sent on, by event id. */
type NotificationPreferenceValue = Record<string, string[]>

type CellState = 'on' | 'off' | 'required' | 'unavailable'

function cellState(
  value: NotificationPreferenceValue,
  event: NotificationEvent,
  channel: string,
): CellState {
  if (event.unavailable?.includes(channel)) return 'unavailable'
  if (event.required?.includes(channel)) return 'required'
  return Object.hasOwn(value, event.id) && value[event.id].includes(channel) ? 'on' : 'off'
}

/** Turns one channel on or off for one event. Required and unavailable cells don't move. */
function setNotificationChannel(
  value: NotificationPreferenceValue,
  event: NotificationEvent,
  channel: string,
  on: boolean,
): NotificationPreferenceValue {
  const state = cellState(value, event, channel)
  if (state === 'required' || state === 'unavailable' || (state === 'on') === on) return value
  const current = value[event.id] ?? []
  return {
    ...value,
    [event.id]: on ? [...current, channel] : current.filter((c) => c !== channel),
  }
}

/** Turns a channel on or off for every event that offers it. */
function setNotificationChannelForAll(
  value: NotificationPreferenceValue,
  events: readonly NotificationEvent[],
  channel: string,
  on: boolean,
): NotificationPreferenceValue {
  return events.reduce((acc, e) => setNotificationChannel(acc, e, channel, on), value)
}

/** Whether a channel is on for every event that can change, none, or some. */
function channelSummary(
  value: NotificationPreferenceValue,
  events: readonly NotificationEvent[],
  channel: string,
): 'all' | 'none' | 'some' | 'locked' {
  const states = events
    .map((e) => cellState(value, e, channel))
    .filter((s) => s === 'on' || s === 'off')
  if (!states.length) return 'locked'
  const on = states.filter((s) => s === 'on').length
  if (on === states.length) return 'all'
  return on === 0 ? 'none' : 'some'
}

function groupEvents(events: readonly NotificationEvent[]) {
  const groups: { name: string | undefined; events: NotificationEvent[] }[] = []
  for (const e of events) {
    const last = groups.at(-1)
    if (last && last.name === e.group) last.events.push(e)
    else groups.push({ name: e.group, events: [e] })
  }
  return groups
}

function Cell({
  state,
  event,
  channel,
  disabled,
  onChange,
}: {
  state: CellState
  event: NotificationEvent
  channel: NotificationChannel
  disabled?: boolean
  onChange: (on: boolean) => void
}) {
  const t = useCoreloomI18n().messages.notificationPreferences
  if (state === 'unavailable')
    return (
      <>
        <span aria-hidden className="text-muted-foreground">
          —
        </span>
        <span className="sr-only">{t.unavailable(event.label, channel.label)}</span>
      </>
    )
  return (
    <Checkbox
      checked={state !== 'off'}
      disabled={disabled === true || state === 'required'}
      aria-label={
        state === 'required'
          ? t.required(event.label, channel.label)
          : t.cell(event.label, channel.label)
      }
      onCheckedChange={(checked) => {
        onChange(checked === true)
      }}
    />
  )
}

function NotificationPreferences({
  events,
  channels,
  value: valueProp,
  defaultValue = {},
  onValueChange,
  disabled,
  title,
  description,
  className,
}: {
  events: NotificationEvent[]
  channels: NotificationChannel[]
  /** The channels each event is sent on, by event id (controlled). */
  value?: NotificationPreferenceValue
  defaultValue?: NotificationPreferenceValue
  /** Every change, with the whole value: save it here, or keep it for a Save button. */
  onValueChange?: (value: NotificationPreferenceValue) => void
  disabled?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.notificationPreferences
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const update = (next: NotificationPreferenceValue) => {
    if (next === value) return
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }
  const groups = groupEvents(events)
  const headId = React.useId()

  return (
    <Card data-slot="notification-preferences" className={cn('gap-0 p-0', className)}>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle asChild>
          <h2 id={headId} className="m-0">
            {title ?? t.title}
          </h2>
        </CardTitle>
        <CardDescription>{description ?? t.description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table aria-labelledby={headId} className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-5 py-2.5 text-left font-medium text-muted-foreground">
                {t.event}
              </th>
              {channels.map((c) => {
                const summary = channelSummary(value, events, c.id)
                return (
                  <th
                    key={c.id}
                    scope="col"
                    className="w-16 px-1 py-2.5 font-medium sm:w-28 sm:px-2"
                  >
                    <span className="flex flex-col items-center gap-1.5">
                      <span className="text-fg-secondary">{c.label}</span>
                      <Checkbox
                        checked={summary === 'some' ? 'indeterminate' : summary !== 'none'}
                        disabled={disabled === true || summary === 'locked'}
                        aria-label={t.allEvents(c.label)}
                        onCheckedChange={() => {
                          update(
                            setNotificationChannelForAll(value, events, c.id, summary !== 'all'),
                          )
                        }}
                      />
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          {groups.map((g, gi) => (
            <tbody key={g.name ?? `group-${String(gi)}`}>
              {g.name && (
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={channels.length + 1}
                    className="bg-inset px-5 py-1.5 text-left font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                  >
                    {g.name}
                  </th>
                </tr>
              )}
              {g.events.map((e) => (
                <tr key={e.id} className="border-b border-border-subtle last:border-b-0">
                  <th scope="row" className="px-5 py-3 text-left align-top font-normal">
                    <span className="block font-medium text-foreground">{e.label}</span>
                    {e.description && (
                      <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                        {e.description}
                      </span>
                    )}
                  </th>
                  {channels.map((c) => (
                    <td key={c.id} className="px-1 py-3 text-center align-middle sm:px-2">
                      <span className="inline-flex justify-center">
                        <Cell
                          state={cellState(value, e, c.id)}
                          event={e}
                          channel={c}
                          disabled={disabled}
                          onChange={(on) => {
                            update(setNotificationChannel(value, e, c.id, on))
                          }}
                        />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
        {events.some((e) => e.required?.length) && (
          <p className="m-0 border-t border-border px-5 py-3 text-[12.5px] text-muted-foreground">
            {t.requiredHint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export {
  type NotificationChannel,
  type NotificationEvent,
  NotificationPreferences,
  type NotificationPreferenceValue,
  setNotificationChannel,
  setNotificationChannelForAll,
}
