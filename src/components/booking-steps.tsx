'use client'

// Coreloom UI — Booking steps. The screens of the Booking block: the service, the day and time,
// the recap with the visitor's details, and the confirmation, with the progress above them.
import { ArrowLeftIcon, CalendarPlusIcon, CircleCheckIcon } from 'lucide-react'
import * as React from 'react'

import {
  bookingIcs,
  type BookingSlot,
  formatBookingDuration,
  groupSlots,
} from '@/components/booking-utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { RadioCard, RadioCardGroup } from '@/components/ui/choice-card'
import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface BookingService {
  id: string
  name: string
  /** Minutes. */
  duration: number
  /** As it should read: "€60", "Covered by insurance". */
  price?: string
  description?: string
}

interface BookingContact {
  name: string
  email: string
  /** Empty when not asked or not given. */
  phone: string
  note: string
}

type Step = 'service' | 'time' | 'details' | 'done'

interface BookingState {
  step: Step
  serviceId: string | null
  date: Date
  slot: string | null
  reference?: string
}

type BookingAction =
  | { type: 'service'; id: string }
  | { type: 'date'; date: Date }
  | { type: 'slot'; start: string }
  | { type: 'go'; step: Step }
  | { type: 'booked'; reference?: string }
  | { type: 'restart'; state: BookingState }

type SlotsState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; slots: BookingSlot[] }

/** The free times of one day for one service, loaded through the app's callback. */
function useWhen(timeZone?: string) {
  const { locale } = useCoreloomI18n()
  return React.useMemo(() => {
    const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone })
    const day = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone,
    })
    const zone = timeZone
      ? new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'longGeneric' })
          .formatToParts(new Date())
          .find((part) => part.type === 'timeZoneName')?.value
      : undefined
    return {
      time: (iso: string) => time.format(new Date(iso)),
      day: (date: Date | string) => day.format(typeof date === 'string' ? new Date(date) : date),
      /** A calendar day (no time zone shift: it is the day picked). */
      calendarDay: (date: Date) =>
        new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(
          date,
        ),
      zone,
      locale,
    }
  }, [locale, timeZone])
}

/** The title of a step: focused when the step opens, so screen readers start there. */
function StepTitle({
  children,
  titleRef,
}: {
  children: React.ReactNode
  titleRef: React.Ref<HTMLParagraphElement>
}) {
  return (
    <p
      ref={titleRef}
      tabIndex={-1}
      className="m-0 font-display text-[18px] leading-tight font-semibold tracking-[-0.01em] text-foreground outline-none"
    >
      {children}
    </p>
  )
}

function StepActions({ onBack, children }: { onBack?: () => void; children?: React.ReactNode }) {
  const t = useCoreloomI18n().messages.booking
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      {onBack ? (
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeftIcon />
          {t.back}
        </Button>
      ) : (
        <span />
      )}
      {children}
    </div>
  )
}

function ServiceStep({
  services,
  value,
  onChange,
  onNext,
}: {
  services: readonly BookingService[]
  value: string | null
  onChange: (id: string) => void
  onNext: () => void
}) {
  const i18n = useCoreloomI18n()
  const t = i18n.messages.booking
  return (
    <>
      <RadioCardGroup aria-label={t.steps.service} value={value ?? ''} onValueChange={onChange}>
        {services.map((service) => (
          <RadioCard
            key={service.id}
            value={service.id}
            title={service.name}
            description={service.description}
          >
            <span className="text-[13px] text-fg-secondary">
              {formatBookingDuration(service.duration, i18n.locale)}
              {service.price && ` · ${service.price}`}
            </span>
          </RadioCard>
        ))}
      </RadioCardGroup>
      <StepActions>
        <Button type="button" disabled={!value} onClick={onNext}>
          {t.continue}
        </Button>
      </StepActions>
    </>
  )
}

function SlotList({
  state,
  selected,
  onSelect,
  onRetry,
  timeZone,
}: {
  state: SlotsState
  selected: string | null
  onSelect: (start: string) => void
  onRetry: () => void
  timeZone?: string
}) {
  const t = useCoreloomI18n().messages.booking
  const when = useWhen(timeZone)
  if (state.status === 'loading')
    return (
      <div aria-busy className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-9 rounded-md" />
        ))}
      </div>
    )
  if (state.status === 'error')
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex flex-wrap items-center gap-3">
          {t.slotsFailed}
          <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
            {t.retry}
          </Button>
        </AlertDescription>
      </Alert>
    )
  const groups = groupSlots(state.slots, timeZone)
  if (groups.length === 0)
    return <p className="m-0 text-[13.5px] text-muted-foreground">{t.noSlots}</p>
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.period} role="group" aria-label={t.periods[group.period]}>
          <p className="m-0 mb-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {t.periods[group.period]}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {group.slots.map((slot) => {
              const taken = slot.available === false
              return (
                <Button
                  key={slot.start}
                  type="button"
                  variant="secondary"
                  aria-pressed={selected === slot.start}
                  disabled={taken}
                  aria-label={taken ? t.taken(when.time(slot.start)) : undefined}
                  className={cn(
                    'tabular-nums aria-pressed:border-primary aria-pressed:bg-primary-subtle aria-pressed:text-foreground',
                    taken && 'line-through',
                  )}
                  onClick={() => {
                    onSelect(slot.start)
                  }}
                >
                  {when.time(slot.start)}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function slotsAnnouncement(
  t: ReturnType<typeof useCoreloomI18n>['messages']['booking'],
  state: SlotsState,
  day: string,
) {
  switch (state.status) {
    case 'loading':
      return ''
    case 'error':
      return t.slotsFailed
    case 'ready': {
      const free = state.slots.filter((slot) => slot.available !== false).length
      return free === 0 ? t.noSlots : t.slotsAvailable(free, day)
    }
  }
}

function TimeStep({
  state,
  dispatch,
  slots,
  onRetry,
  disabledDays,
  fromDate,
  toDate,
  timeZone,
  onBack,
}: {
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
  slots: SlotsState
  onRetry: () => void
  disabledDays: (date: Date) => boolean
  fromDate: Date
  toDate: Date
  timeZone?: string
  onBack?: () => void
}) {
  const t = useCoreloomI18n().messages.booking
  const when = useWhen(timeZone)
  return (
    <>
      <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
        <Calendar
          mode="single"
          required
          selected={state.date}
          defaultMonth={state.date}
          startMonth={fromDate}
          endMonth={toDate}
          disabled={disabledDays}
          onSelect={(date: Date | undefined) => {
            if (date) dispatch({ type: 'date', date })
          }}
          className="mx-auto rounded-lg border border-border md:mx-0"
        />
        <div className="flex min-w-0 flex-col gap-3">
          <p className="m-0 text-[14px] font-medium text-foreground first-letter:uppercase">
            {when.calendarDay(state.date)}
          </p>
          <SlotList
            state={slots}
            selected={state.slot}
            timeZone={timeZone}
            onRetry={onRetry}
            onSelect={(start) => {
              dispatch({ type: 'slot', start })
            }}
          />
          {when.zone && (
            <p className="m-0 text-[12.5px] text-muted-foreground">{t.timesIn(when.zone)}</p>
          )}
        </div>
      </div>
      <StepActions onBack={onBack}>
        <Button
          type="button"
          disabled={!state.slot}
          onClick={() => {
            dispatch({ type: 'go', step: 'details' })
          }}
        >
          {t.continue}
        </Button>
      </StepActions>
    </>
  )
}

/** What is being booked, with links back to change it. */
function Recap({
  service,
  slot,
  timeZone,
  onChange,
}: {
  service: BookingService
  slot: string
  timeZone?: string
  onChange?: (step: 'service' | 'time') => void
}) {
  const i18n = useCoreloomI18n()
  const t = i18n.messages.booking
  const when = useWhen(timeZone)
  const rows: { label: string; value: string; step?: 'service' | 'time' }[] = [
    { label: t.recap.service, value: service.name, step: 'service' },
    { label: t.recap.when, value: `${when.day(slot)}, ${when.time(slot)}`, step: 'time' },
    { label: t.recap.duration, value: formatBookingDuration(service.duration, i18n.locale) },
    ...(service.price ? [{ label: t.recap.price, value: service.price }] : []),
  ]
  return (
    <dl className="m-0 grid gap-2.5 rounded-lg border border-border bg-inset p-4 text-[13.5px]">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <dt className="w-24 shrink-0 text-muted-foreground">{row.label}</dt>
          <dd className="m-0 flex min-w-0 flex-1 items-baseline gap-3">
            <span className="min-w-0 flex-1 text-foreground first-letter:uppercase">
              {row.value}
            </span>
            {onChange && row.step && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0"
                aria-label={t.changeLabel(row.label)}
                onClick={() => {
                  if (row.step) onChange(row.step)
                }}
              >
                {t.change}
              </Button>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function DetailsStep({
  service,
  slot,
  timeZone,
  askPhone,
  onBook,
  onChange,
  onBack,
}: {
  service: BookingService
  slot: string
  timeZone?: string
  askPhone: boolean
  onBook: (contact: BookingContact) => Promise<void>
  onChange: (step: 'service' | 'time') => void
  onBack: () => void
}) {
  const t = useCoreloomI18n().messages
  const b = t.booking
  const [failed, setFailed] = React.useState(false)
  const form = useAppForm({
    defaultValues: { name: '', email: '', phone: '', note: '' },
    onSubmit: async ({ value }) => {
      setFailed(false)
      try {
        await onBook({
          name: value.name.trim(),
          email: value.email.trim(),
          phone: value.phone.trim(),
          note: value.note.trim(),
        })
      } catch {
        setFailed(true)
      }
    },
  })
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <Recap service={service} slot={slot} timeZone={timeZone} onChange={onChange} />
      {failed && (
        <Alert variant="destructive">
          <AlertDescription>{b.bookFailed}</AlertDescription>
        </Alert>
      )}
      <FieldGroup className="gap-4">
        <form.AppField
          name="name"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : b.nameRequired) }}
        >
          {(field) => <field.TextField label={b.name} autoComplete="name" />}
        </form.AppField>
        <form.AppField
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return t.auth.emailRequired
              return EMAIL.test(value.trim()) ? undefined : t.auth.emailInvalid
            },
          }}
        >
          {(field) => <field.TextField label={b.email} type="email" autoComplete="email" />}
        </form.AppField>
        {askPhone && (
          <form.AppField name="phone">
            {(field) => (
              <field.TextField
                label={b.phone}
                type="tel"
                autoComplete="tel"
                description={b.optional}
              />
            )}
          </form.AppField>
        )}
        <form.AppField name="note">
          {(field) => (
            <field.TextareaField label={b.note} description={b.noteHint} rows={3} maxCount={500} />
          )}
        </form.AppField>
      </FieldGroup>
      <StepActions onBack={onBack}>
        <form.AppForm>
          <form.SubmitButton pendingLabel={b.confirming}>{b.confirm}</form.SubmitButton>
        </form.AppForm>
      </StepActions>
    </form>
  )
}

function DoneStep({
  service,
  slot,
  reference,
  timeZone,
  location,
  onRestart,
}: {
  service: BookingService
  slot: string
  reference?: string
  timeZone?: string
  location?: string
  onRestart: () => void
}) {
  const t = useCoreloomI18n().messages.booking
  const ics = bookingIcs({
    uid: reference ?? `${service.id}-${slot}`,
    title: service.name,
    start: slot,
    minutes: service.duration,
    location,
    description: reference ? `${t.reference}: ${reference}` : undefined,
  })
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <CircleCheckIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
        <p className="m-0 text-[14px] text-fg-secondary">
          {t.doneDescription}
          {reference && (
            <>
              {' '}
              {t.reference}: <span className="font-mono text-foreground">{reference}</span>
            </>
          )}
        </p>
      </div>
      <Recap service={service} slot={slot} timeZone={timeZone} />
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <a
            href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`}
            download={`${service.name}.ics`}
          >
            <CalendarPlusIcon />
            {t.addToCalendar}
          </a>
        </Button>
        <Button type="button" variant="ghost" onClick={onRestart}>
          {t.bookAnother}
        </Button>
      </div>
    </div>
  )
}

/** The steps as a short list: where you are and what's left. */
function Progress({ steps, current }: { steps: readonly Step[]; current: Step }) {
  const t = useCoreloomI18n().messages.booking
  const index = current === 'done' ? steps.length : steps.indexOf(current)
  return (
    <ol aria-label={t.progress} className="m-0 flex list-none gap-1.5 p-0">
      {steps.map((step, i) => (
        <li
          key={step}
          aria-current={i === index ? 'step' : undefined}
          className="flex min-w-0 flex-1 flex-col gap-1.5"
        >
          <span
            aria-hidden
            className={cn('h-1 rounded-pill', i <= index ? 'bg-primary' : 'bg-accent')}
          />
          <span
            className={cn(
              'truncate text-[12px]',
              i === index ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {t.steps[step === 'done' ? 'details' : step]}
            {i < index && <span className="sr-only"> ({t.completed})</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export {
  type BookingAction,
  type BookingContact,
  type BookingService,
  type BookingState,
  DetailsStep,
  DoneStep,
  Progress,
  ServiceStep,
  slotsAnnouncement,
  type SlotsState,
  type Step,
  StepTitle,
  TimeStep,
  useWhen,
}
