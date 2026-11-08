# @coreloom/booking

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/booking.tsx

```ts
function Booking
Booking.services: readonly BookingService[]
Booking.onLoadSlots: (request: { serviceId: string; date: string; }) => Promise<BookingSlot[]>
Booking.onBook: (request: BookingRequest) => Promise<{ reference?: string; } | undefined>
Booking.isDateUnavailable?: ((date: Date) => boolean) | undefined
Booking.fromDate?: Date | undefined
Booking.toDate?: Date | undefined
Booking.timeZone?: string | undefined
Booking.defaultServiceId?: string | undefined
Booking.askPhone?: boolean | undefined
Booking.location?: string | undefined
Booking.aside?: React.ReactNode
Booking.className?: string | undefined
type BookingContact = {}
BookingContact.name: string
BookingContact.email: string
BookingContact.phone: string
BookingContact.note: string
type BookingRequest = {}
BookingRequest.serviceId: string
BookingRequest.start: string
BookingRequest.contact: BookingContact
type BookingService = {}
BookingService.id: string
BookingService.name: string
BookingService.duration: number
BookingService.price?: string | undefined
BookingService.description?: string | undefined
type BookingSlot = {}
BookingSlot.start: string
BookingSlot.available?: boolean | undefined
function bookingIcs({ uid, title, start, minutes, location, description, stamp, }: { uid: string; title: string; start: string; minutes: number; location?: string; description?: string; stamp?: Date; }) => string
function dateKey(date: Date) => string
function firstOpenDay(from: Date, to: Date, isUnavailable?: (date: Date) => boolean) => Date
function formatBookingDuration(minutes: number, locale: string) => string
function groupSlots(slots: readonly BookingSlot[], timeZone?: string) => { period: DayPeriod; slots: BookingSlot[]; }[]
```

## src/components/booking-steps.tsx

```ts
type BookingAction = { type: 'service'; id: string; } | { type: 'date'; date: Date; } | { type: 'slot'; start: string; } | { type: 'go'; step: Step; } | { type: 'booked'; reference?: string; } | { type: 'restart'; state: BookingState; }
type BookingContact = {}
BookingContact.name: string
BookingContact.email: string
BookingContact.phone: string
BookingContact.note: string
type BookingService = {}
BookingService.id: string
BookingService.name: string
BookingService.duration: number
BookingService.price?: string | undefined
BookingService.description?: string | undefined
type BookingState = {}
BookingState.step: Step
BookingState.serviceId: string | null
BookingState.date: Date
BookingState.slot: string | null
BookingState.reference?: string | undefined
function DetailsStep
DetailsStep.service: BookingService
DetailsStep.slot: string
DetailsStep.timeZone?: string | undefined
DetailsStep.askPhone: boolean
DetailsStep.onBook: (contact: BookingContact) => Promise<void>
DetailsStep.onChange: (step: 'service' | 'time') => void
DetailsStep.onBack: () => void
function DoneStep
DoneStep.service: BookingService
DoneStep.slot: string
DoneStep.reference?: string | undefined
DoneStep.timeZone?: string | undefined
DoneStep.location?: string | undefined
DoneStep.onRestart: () => void
function Progress
Progress.steps: readonly Step[]
Progress.current: Step
function ServiceStep
ServiceStep.services: readonly BookingService[]
ServiceStep.value: string | null
ServiceStep.onChange: (id: string) => void
ServiceStep.onNext: () => void
function slotsAnnouncement(t: ReturnType<typeof useCoreloomI18n>['messages']['booking'], state: SlotsState, day: string) => string
type SlotsState = { status: 'loading'; } | { status: 'error'; } | { status: 'ready'; slots: BookingSlot[]; }
type Step = 'done' | 'time' | 'details' | 'service'
function StepTitle
StepTitle.children: React.ReactNode
StepTitle.titleRef: React.Ref<HTMLParagraphElement>
function TimeStep
TimeStep.state: BookingState
TimeStep.dispatch: React.Dispatch<BookingAction>
TimeStep.slots: SlotsState
TimeStep.onRetry: () => void
TimeStep.disabledDays: (date: Date) => boolean
TimeStep.fromDate: Date
TimeStep.toDate: Date
TimeStep.timeZone?: string | undefined
TimeStep.onBack?: (() => void) | undefined
function useWhen(timeZone?: string) => { time: (iso: string) => string; day: (date: Date | string) => string; calendarDay: (date: Date) => string; zone: string | undefined; locale: string; }
```

## src/components/booking-utils.ts

```ts
function addDays(date: Date, days: number) => Date
function bookingIcs({ uid, title, start, minutes, location, description, stamp, }: { uid: string; title: string; start: string; minutes: number; location?: string; description?: string; stamp?: Date; }) => string
type BookingSlot = {}
BookingSlot.start: string
BookingSlot.available?: boolean | undefined
function dateKey(date: Date) => string
type DayPeriod = 'morning' | 'afternoon' | 'evening'
function firstOpenDay(from: Date, to: Date, isUnavailable?: (date: Date) => boolean) => Date
function formatBookingDuration(minutes: number, locale: string) => string
function groupSlots(slots: readonly BookingSlot[], timeZone?: string) => { period: DayPeriod; slots: BookingSlot[]; }[]
function periodOf(start: string, timeZone?: string) => DayPeriod
function startOfDay(date: Date) => Date
```
