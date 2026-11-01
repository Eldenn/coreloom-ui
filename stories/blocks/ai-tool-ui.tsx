// Demo tool components for the generative UI stories: what an app passes to `Chat`'s `tools` (or to
// `ToolCall`'s `render`). A weather card drawn in place of the call, search results inside the card,
// and a booking that asks for approval with its own buttons. App code, so the strings live here.
import {
  CalendarCheckIcon,
  CalendarXIcon,
  CloudIcon,
  CloudRainIcon,
  ExternalLinkIcon,
  SunIcon,
} from 'lucide-react'

import { Badge, BadgeDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import type { ToolComponents, ToolRenderProps } from '@/components/ui/tool-call'
import { useCoreloomI18n } from '@/lib/i18n'

type Sky = 'sun' | 'cloud' | 'rain'

export interface Weather {
  city: string
  celsius: number
  sky: Sky
  /** The next days, by date (YYYY-MM-DD). */
  forecast: { date: string; celsius: number; sky: Sky }[]
}

export interface DocHit {
  title: string
  url: string
  snippet: string
}

export interface Meeting {
  title: string
  start: string
  minutes: number
  with: string[]
}

// The tools as the AI SDK infers them (`InferUITools<typeof tools>`): input and output by name.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- a type alias, like the SDK's UITools
export type DemoTools = {
  getWeather: { input: { city: string }; output: Weather }
  searchDocs: { input: { query: string }; output: DocHit[] }
  bookMeeting: { input: Meeting; output: { id: string } }
}

const COPY = {
  en: {
    sky: { sun: 'Sunny', cloud: 'Cloudy', rain: 'Rain' },
    loadingWeather: (city?: string) =>
      city ? `Getting the weather in ${city}…` : 'Getting the weather…',
    book: 'Book it',
    notNow: 'Not now',
    booking: 'Booking…',
    booked: 'Booked',
    notBooked: 'Not booked',
    with: (names: string) => `With ${names}`,
    opens: 'opens in a new tab',
  },
  fr: {
    sky: { sun: 'Ensoleillé', cloud: 'Nuageux', rain: 'Pluie' },
    loadingWeather: (city?: string) => (city ? `Météo de ${city} en cours…` : 'Météo en cours…'),
    book: 'Réserver',
    notNow: 'Pas maintenant',
    booking: 'Réservation…',
    booked: 'Réservé',
    notBooked: 'Non réservé',
    with: (names: string) => `Avec ${names}`,
    opens: 's’ouvre dans un nouvel onglet',
  },
}

function useCopy() {
  const { locale } = useCoreloomI18n()
  return { copy: locale.startsWith('fr') ? COPY.fr : COPY.en, locale }
}

const SKY_ICON = { sun: SunIcon, cloud: CloudIcon, rain: CloudRainIcon }

function degrees(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'celsius',
    maximumFractionDigits: 0,
  }).format(value)
}

export function WeatherCard({ weather }: { weather: Weather }) {
  const { copy, locale } = useCopy()
  const Icon = SKY_ICON[weather.sky]
  return (
    <div className="flex max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="m-0 text-[13px] text-muted-foreground">{weather.city}</p>
          <p className="m-0 font-display text-[32px] leading-none font-semibold text-foreground">
            {degrees(weather.celsius, locale)}
          </p>
          <p className="m-0 text-[13px] text-fg-secondary">{copy.sky[weather.sky]}</p>
        </div>
        <Icon className="size-10 text-primary-text" aria-hidden />
      </div>
      <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
        {weather.forecast.map((d) => {
          const DayIcon = SKY_ICON[d.sky]
          return (
            <li
              key={d.date}
              className="flex flex-col items-center gap-1 rounded-md bg-inset px-2 py-2 text-[12.5px]"
            >
              <span className="text-muted-foreground">
                {new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
                  new Date(d.date),
                )}
              </span>
              <DayIcon className="size-4 text-fg-secondary" aria-hidden />
              <span className="sr-only">{copy.sky[d.sky]}</span>
              <span className="font-medium text-foreground">{degrees(d.celsius, locale)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** While the tool runs: the card's shape, and what's happening in words for screen readers. */
export function WeatherSkeleton({ city }: { city?: string }) {
  const { copy } = useCopy()
  return (
    <div className="flex max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <p className="sr-only">{copy.loadingWeather(city)}</p>
      <div aria-hidden className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3.5 w-14" />
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div aria-hidden className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[68px]" />
        ))}
      </div>
    </div>
  )
}

export function DocResults({ hits }: { hits: DocHit[] }) {
  const { copy } = useCopy()
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-border-subtle rounded-md border border-border p-0">
      {hits.map((hit) => (
        <li key={hit.url} className="flex flex-col gap-0.5 px-3 py-2.5">
          <a
            href={hit.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 self-start rounded-sm text-[13px] font-medium text-primary-text underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {hit.title}
            <ExternalLinkIcon className="size-3" aria-hidden />
            <span className="sr-only">({copy.opens})</span>
          </a>
          <p className="m-0 text-[12.5px] text-muted-foreground">{hit.snippet}</p>
        </li>
      ))}
    </ul>
  )
}

/** A booking the tool asks to make: the meeting, then Book / Not now, then what happened. */
export function MeetingCard(props: ToolRenderProps<Meeting, { id: string }>) {
  const { copy, locale } = useCopy()
  if (props.state === 'input-streaming' || props.state === 'output-error') return null
  const meeting = props.input
  const when = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(meeting.start))
  const Icon = props.state === 'output-denied' ? CalendarXIcon : CalendarCheckIcon
  return (
    <div className="flex max-w-md flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-primary-text" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="m-0 text-[14px] font-medium text-foreground">{meeting.title}</p>
          <p className="m-0 text-[13px] text-fg-secondary">{when}</p>
          <p className="m-0 text-[12.5px] text-muted-foreground">
            {copy.with(new Intl.ListFormat(locale).format(meeting.with))}
          </p>
        </div>
        {props.state === 'output-available' && (
          <Badge variant="success">
            <BadgeDot />
            {copy.booked}
          </Badge>
        )}
        {props.state === 'output-denied' && <Badge variant="secondary">{copy.notBooked}</Badge>}
        {(props.state === 'approval-responded' || props.state === 'input-available') && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Spinner className="size-3.5" aria-hidden role="presentation" />
            {copy.booking}
          </span>
        )}
      </div>
      {props.respond && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => props.respond?.(false)}>
            {copy.notNow}
          </Button>
          <Button size="sm" onClick={() => props.respond?.(true)}>
            {copy.book}
          </Button>
        </div>
      )}
    </div>
  )
}

/** The map an app passes to `Chat`: one entry per tool it draws itself. */
export const demoTools: ToolComponents<DemoTools> = {
  getWeather: {
    label: 'Weather',
    display: 'inline',
    // Skeleton while the input arrives and the tool runs, the card once it answers; a failure
    // returns nothing, so the chat shows its usual error card.
    render: (call) =>
      call.state === 'output-available' ? (
        <WeatherCard weather={call.output} />
      ) : call.state === 'output-error' ? undefined : (
        <WeatherSkeleton city={call.input?.city} />
      ),
  },
  searchDocs: {
    label: 'Search the docs',
    // Inside the folded card: the results replace the JSON once they're in.
    render: (call) =>
      call.state === 'output-available' ? <DocResults hits={call.output} /> : undefined,
  },
  bookMeeting: {
    label: 'Book a meeting',
    display: 'inline',
    render: (call) =>
      call.state === 'input-streaming' || call.state === 'output-error' ? undefined : (
        <MeetingCard {...call} />
      ),
  },
}

export const lyon: Weather = {
  city: 'Lyon',
  celsius: 14,
  sky: 'rain',
  forecast: [
    { date: '2026-10-15', celsius: 16, sky: 'cloud' },
    { date: '2026-10-16', celsius: 19, sky: 'sun' },
    { date: '2026-10-17', celsius: 17, sky: 'sun' },
  ],
}

export const docHits: DocHit[] = [
  {
    title: 'Roll back a deployment',
    url: 'https://coreloom.dev/docs/deployments/rollback',
    snippet: 'Put production back on an earlier build in one step, without a new release.',
  },
  {
    title: 'Deployment protection',
    url: 'https://coreloom.dev/docs/deployments/protection',
    snippet: 'Require an approval before anything reaches production.',
  },
]

export const meeting: Meeting = {
  title: 'Rollback review',
  start: '2026-10-15T14:30:00+02:00',
  minutes: 30,
  with: ['Ana', 'Malik', 'Jo'],
}
