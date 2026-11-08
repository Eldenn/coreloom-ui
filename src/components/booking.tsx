'use client'

// Coreloom UI — Booking (block). Online appointment booking in three steps: pick a service, pick
// a day and a time, give your details and confirm; then a confirmation with "Add to calendar".
// The app owns the diary: `onLoadSlots` returns the free times of a day and `onBook` makes the
// appointment. Put a PractitionerCard or OpeningHours in `aside` to show who and where.
//
//   <Booking services={services} timeZone="Europe/Paris"
//     onLoadSlots={({ serviceId, date }) => api.slots(serviceId, date)}
//     onBook={(request) => api.book(request)} />
import * as React from 'react'

import {
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
} from '@/components/booking-steps'
import {
  addDays,
  type BookingSlot,
  dateKey,
  firstOpenDay,
  startOfDay,
} from '@/components/booking-utils'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface BookingRequest {
  serviceId: string
  /** The chosen slot's `start`, as the app gave it. */
  start: string
  contact: BookingContact
}

function reduce(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'service':
      return { ...state, serviceId: action.id, slot: null }
    case 'date':
      return { ...state, date: action.date, slot: null }
    case 'slot':
      return { ...state, slot: action.start }
    case 'go':
      return { ...state, step: action.step }
    case 'booked':
      return { ...state, step: 'done', reference: action.reference }
    case 'restart':
      return action.state
  }
}

function useSlots(
  request: { serviceId: string; date: string } | null,
  load: (request: { serviceId: string; date: string }) => Promise<BookingSlot[]>,
) {
  const key = request ? `${request.serviceId}|${request.date}` : ''
  const [attempt, setAttempt] = React.useState(0)
  const [result, setResult] = React.useState<{ key: string; state: SlotsState }>()
  const loadSlots = React.useEffectEvent(load)
  React.useEffect(() => {
    if (!key) return
    const [serviceId, date] = key.split('|')
    let current = true
    loadSlots({ serviceId, date }).then(
      (slots) => {
        if (current) setResult({ key, state: { status: 'ready', slots } })
      },
      () => {
        if (current) setResult({ key, state: { status: 'error' } })
      },
    )
    return () => {
      current = false
    }
  }, [key, attempt])
  const state: SlotsState = result?.key === key ? result.state : { status: 'loading' }
  return {
    state,
    retry: () => {
      setResult(undefined)
      setAttempt((n) => n + 1)
    },
  }
}

/** Formats instants in the place's time zone and the reader's language. */
/** The days that can be booked: from `from` (default today) to `to` (default 60 days later). */
function bookingWindow(from?: Date, to?: Date, isDateUnavailable?: (date: Date) => boolean) {
  const fromDate = startOfDay(from ?? new Date())
  const toDate = to ?? addDays(fromDate, 60)
  return {
    fromDate,
    toDate,
    disabledDays: (date: Date) =>
      date < fromDate || date > toDate || (isDateUnavailable?.(date) ?? false),
  }
}

/** The recap and details, or the confirmation: the steps that need a service and a time. */
function FinalStep({
  state,
  service,
  timeZone,
  askPhone,
  location,
  onGo,
  onBook,
  onRestart,
}: {
  state: BookingState
  service?: BookingService
  timeZone?: string
  askPhone: boolean
  location?: string
  onGo: (step: 'service' | 'time') => void
  onBook: (request: BookingRequest) => Promise<void>
  onRestart: () => void
}) {
  const slot = state.slot
  if (!service || !slot) return null
  if (state.step === 'details')
    return (
      <DetailsStep
        service={service}
        slot={slot}
        timeZone={timeZone}
        askPhone={askPhone}
        onChange={onGo}
        onBack={() => {
          onGo('time')
        }}
        onBook={(contact) => onBook({ serviceId: service.id, start: slot, contact })}
      />
    )
  if (state.step === 'done')
    return (
      <DoneStep
        service={service}
        slot={slot}
        reference={state.reference}
        timeZone={timeZone}
        location={location}
        onRestart={onRestart}
      />
    )
  return null
}

function Booking({
  services,
  onLoadSlots,
  onBook,
  isDateUnavailable,
  fromDate: fromDateProp,
  toDate: toDateProp,
  timeZone,
  defaultServiceId,
  askPhone = true,
  location,
  aside,
  className,
}: {
  /** What can be booked. With one, the service step is skipped. */
  services: readonly BookingService[]
  /** The free times of a day ("2026-10-15") for a service. Reject to show an error and Retry. */
  onLoadSlots: (request: { serviceId: string; date: string }) => Promise<BookingSlot[]>
  /** Makes the appointment. Resolve with its reference to show it; reject to show an error. */
  onBook: (request: BookingRequest) => Promise<{ reference?: string } | undefined>
  /** Days that can't be booked at all (closed days, holidays): greyed out in the calendar. */
  isDateUnavailable?: (date: Date) => boolean
  /** The first day that can be booked. Default: today. */
  fromDate?: Date
  /** The last day that can be booked. Default: 60 days after `fromDate`. */
  toDate?: Date
  /** The place's IANA time zone ("Europe/Paris"): times are shown in it, and it is named. */
  timeZone?: string
  defaultServiceId?: string
  /** Ask for a phone number (optional for the visitor). Default `true`. */
  askPhone?: boolean
  /** The address, written into the calendar file. */
  location?: string
  /** Beside the steps from 1024px (above them on phones): a PractitionerCard, OpeningHours. */
  aside?: React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages.booking
  const { fromDate, toDate, disabledDays } = bookingWindow(
    fromDateProp,
    toDateProp,
    isDateUnavailable,
  )
  const single = services.length === 1 ? services[0] : undefined
  const steps: readonly Step[] = single ? ['time', 'details'] : ['service', 'time', 'details']
  const initial = (): BookingState => ({
    step: steps[0],
    serviceId: single?.id ?? defaultServiceId ?? null,
    date: firstOpenDay(fromDate, toDate, isDateUnavailable),
    slot: null,
  })
  const [state, dispatch] = React.useReducer(reduce, undefined, initial)
  const service = services.find((s) => s.id === state.serviceId)
  const slots = useSlots(
    state.step === 'time' && service ? { serviceId: service.id, date: dateKey(state.date) } : null,
    onLoadSlots,
  )
  const when = useWhen(timeZone)

  // A new step replaces the old one: its title takes focus (not on the first render).
  const title = React.useRef<HTMLParagraphElement>(null)
  const shownStep = React.useRef(state.step)
  React.useEffect(() => {
    if (shownStep.current === state.step) return
    shownStep.current = state.step
    title.current?.focus()
  }, [state.step])

  const go = (step: Step) => {
    dispatch({ type: 'go', step })
  }
  const back = (step: Step) => (steps.includes(step) ? () => go(step) : undefined)
  const stepTitle = state.step === 'done' ? t.doneTitle : t.titles[state.step]

  return (
    <div
      data-slot="booking"
      className={cn(
        'grid items-start gap-6',
        aside && 'lg:grid-cols-[minmax(0,300px)_1fr]',
        className,
      )}
    >
      {aside}
      <section
        aria-label={t.label}
        className="flex min-w-0 flex-col gap-5 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-hairline sm:p-6"
      >
        <Progress steps={steps} current={state.step} />
        <StepTitle titleRef={title}>{stepTitle}</StepTitle>
        {state.step === 'service' && (
          <ServiceStep
            services={services}
            value={state.serviceId}
            onChange={(id) => {
              dispatch({ type: 'service', id })
            }}
            onNext={() => {
              go('time')
            }}
          />
        )}
        {state.step === 'time' && (
          <TimeStep
            state={state}
            dispatch={dispatch}
            slots={slots.state}
            onRetry={slots.retry}
            disabledDays={disabledDays}
            fromDate={fromDate}
            toDate={toDate}
            timeZone={timeZone}
            onBack={back('service')}
          />
        )}
        <FinalStep
          state={state}
          service={service}
          timeZone={timeZone}
          askPhone={askPhone}
          location={location}
          onGo={(step) => {
            go(steps.includes(step) ? step : 'time')
          }}
          onBook={async (request) => {
            const result = await onBook(request)
            dispatch({ type: 'booked', reference: result?.reference })
          }}
          onRestart={() => {
            dispatch({ type: 'restart', state: initial() })
          }}
        />
        <p role="status" className="sr-only">
          {state.step === 'time' && slotsAnnouncement(t, slots.state, when.calendarDay(state.date))}
        </p>
      </section>
    </div>
  )
}

export { Booking, type BookingContact, type BookingRequest, type BookingService, type BookingSlot }
export {
  bookingIcs,
  dateKey,
  firstOpenDay,
  formatBookingDuration,
  groupSlots,
} from '@/components/booking-utils'
