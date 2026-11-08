import type { Meta, StoryObj } from '@storybook/react-vite'
import { LanguagesIcon } from 'lucide-react'

import { Booking, type BookingService, type BookingSlot } from '@/components/booking'
import { PractitionerCard } from '@/components/practitioner-card'

import { practitioners, storyNow, weeklyHours } from './showcase-data'

const TIME_ZONE = 'Europe/Paris'

const services: BookingService[] = [
  {
    id: 'first',
    name: 'First consultation',
    duration: 60,
    price: '€70',
    description: 'History, assessment and a first treatment.',
  },
  { id: 'follow-up', name: 'Follow-up', duration: 45, price: '€60' },
  {
    id: 'infant',
    name: 'Infant consultation',
    duration: 30,
    price: '€55',
    description: 'For babies up to 12 months, with a parent.',
  },
]

const servicesFr: BookingService[] = [
  {
    id: 'first',
    name: 'Première consultation',
    duration: 60,
    price: '70 €',
    description: 'Bilan, examen et un premier traitement.',
  },
  { id: 'follow-up', name: 'Suivi', duration: 45, price: '60 €' },
]

const weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

/** "+02:00": the practice's offset from UTC on that day (summer or winter time). */
function offsetOn(date: string) {
  const name = new Intl.DateTimeFormat('en', { timeZone: TIME_ZONE, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value
  // Paris is never on UTC itself (which would read "GMT" with no offset).
  return name?.replace('GMT', '') ?? '+01:00'
}

/** The practice's diary, faked: its opening hours cut into slots, some of them already taken. */
async function loadSlots({ serviceId, date }: { serviceId: string; date: string }) {
  await wait(500)
  const [y, m, d] = date.split('-').map(Number)
  const day = weekdays[new Date(y, m - 1, d).getDay()]
  const step = services.find((s) => s.id === serviceId)?.duration ?? 45
  const slots: BookingSlot[] = []
  for (const range of weeklyHours[day] ?? []) {
    const [openH, openM] = range.open.split(':').map(Number)
    const [closeH, closeM] = range.close.split(':').map(Number)
    for (let t = openH * 60 + openM; t + step <= closeH * 60 + closeM; t += step) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0')
      const mm = String(t % 60).padStart(2, '0')
      slots.push({ start: `${date}T${hh}:${mm}:00${offsetOn(date)}`, available: (t + d) % 4 !== 0 })
    }
  }
  return slots
}

async function book() {
  await wait(800)
  return { reference: 'RDV-4821' }
}

/** Closed on Sundays and on public holidays. */
const isDateUnavailable = (date: Date) =>
  date.getDay() === 0 || (date.getMonth() === 10 && [1, 11].includes(date.getDate()))

const claire = practitioners[0]

const meta = {
  title: 'Blocks/Booking/Booking',
  component: Booking,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Online appointment booking: a service, a day and a free time, then a recap with the visitor’s details and Confirm; a confirmation with “Add to calendar” follows. The app owns the diary: `onLoadSlots({ serviceId, date })` returns the free times of a day and `onBook(request)` makes the appointment. `aside` takes a PractitionerCard or OpeningHours.',
      },
    },
  },
  args: {
    services,
    onLoadSlots: loadSlots,
    onBook: book,
    isDateUnavailable,
    fromDate: storyNow,
    timeZone: TIME_ZONE,
    location: '12 rue Vauban, 69006 Lyon',
  },
  argTypes: {
    askPhone: { control: 'boolean' },
    timeZone: { control: 'text' },
  },
} satisfies Meta<typeof Booking>
export default meta
type Story = StoryObj<typeof meta>

const aside = (
  <PractitionerCard
    name={claire.name}
    profession={claire.profession}
    photo={<img src={claire.photo} alt="" />}
    specialties={claire.specialties}
    facts={[{ icon: <LanguagesIcon />, label: 'Languages', value: claire.languages }]}
  />
)

/** With the practitioner beside it. */
export const Default: Story = {
  args: { aside },
}

/** One service: the steps start at the calendar. */
export const OneService: Story = {
  args: { services: services.slice(1, 2) },
}

/** The diary can't be reached: the reason and Retry. */
export const SlotsError: Story = {
  args: {
    services: services.slice(1, 2),
    onLoadSlots: async () => {
      await wait(300)
      throw new Error('Service unavailable')
    },
  },
}

/** Nothing free on the first day: the visitor picks another one. */
export const FullyBooked: Story = {
  args: {
    services: services.slice(1, 2),
    onLoadSlots: async ({ date }) => {
      const slots = await loadSlots({ serviceId: 'follow-up', date })
      return slots.map((slot) => ({ ...slot, available: false }))
    },
  },
}

export const French: Story = {
  globals: { locale: 'fr' },
  args: { services: servicesFr, location: '12 rue Vauban, 69006 Lyon' },
}

export const Phone: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
