# @coreloom/showcase

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/hero.tsx

```ts
function Hero
Hero.announcement?: React.ReactNode
Hero.eyebrow?: React.ReactNode
Hero.title: React.ReactNode
Hero.highlight?: React.ReactNode
Hero.highlightStyle?: 'gradient' | 'solid' | undefined
Hero.description?: React.ReactNode
Hero.actions?: React.ReactNode
Hero.command?: string | undefined
Hero.media?: React.ReactNode
Hero.layout?: HeroLayout | undefined
Hero.mediaPosition?: 'end' | 'start' | undefined
Hero.glow?: boolean | undefined
Hero.children?: React.ReactNode
Hero.*: react
type HeroLayout = 'split' | 'centered' | 'cover'
```

## src/components/practitioner-card.tsx

```ts
function initialsOf(name: string) => string
function PractitionerCard
PractitionerCard.name: string
PractitionerCard.profession?: React.ReactNode
PractitionerCard.photo?: React.ReactNode
PractitionerCard.specialties?: string[] | undefined
PractitionerCard.bio?: React.ReactNode
PractitionerCard.facts?: PractitionerFact[] | undefined
PractitionerCard.actions?: React.ReactNode
PractitionerCard.orientation?: 'vertical' | 'horizontal' | undefined
PractitionerCard.headingLevel?: 2 | 4 | 3 | undefined
PractitionerCard.*: react
type PractitionerFact = {}
PractitionerFact.icon?: React.ReactNode
PractitionerFact.label: string
PractitionerFact.value: React.ReactNode
function PractitionerGrid
PractitionerGrid.children: React.ReactNode
PractitionerGrid.eyebrow?: React.ReactNode
PractitionerGrid.title?: React.ReactNode
PractitionerGrid.description?: React.ReactNode
PractitionerGrid.columns?: 2 | 4 | 3 | undefined
PractitionerGrid.*: react
```

## src/components/contact-section.tsx

```ts
function ContactDetails
ContactDetails.address?: React.ReactNode
ContactDetails.directionsHref?: string | undefined
ContactDetails.phone?: string | undefined
ContactDetails.email?: string | undefined
ContactDetails.items?: ContactItem[] | undefined
ContactDetails.*: react
type ContactItem = {}
ContactItem.icon?: React.ReactNode
ContactItem.label: string
ContactItem.value: React.ReactNode
function ContactSection
ContactSection.children: React.ReactNode
ContactSection.eyebrow?: React.ReactNode
ContactSection.title?: React.ReactNode
ContactSection.description?: React.ReactNode
ContactSection.map?: React.ReactNode
ContactSection.*: react
function formatClockTime(locale: string, value: string) => string
type HoursException = {}
HoursException.date: string
HoursException.label?: string | undefined
HoursException.hours?: OpeningRange[] | undefined
function minutesOf(value: string) => number | null
function OpeningHours
OpeningHours.hours: Partial<Record<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday', OpeningRange[]>>
OpeningHours.exceptions?: HoursException[] | undefined
OpeningHours.now?: Date | undefined
OpeningHours.weekStartsOn?: 0 | 1 | undefined
OpeningHours.showStatus?: boolean | undefined
OpeningHours.*: react
type OpeningRange = {}
OpeningRange.open: string
OpeningRange.close: string
type OpeningStatus = { open: true; closes: string; } | { open: false; opens?: { time: string; daysAhead: number; weekday: Weekday; }; }
function openingStatus(hours: WeeklyHours, now: Date, exceptions?: HoursException[]) => OpeningStatus
type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
type WeeklyHours = { sunday?: OpeningRange[] | undefined; monday?: OpeningRange[] | undefined; tuesday?: OpeningRange[] | undefined; wednesday?: OpeningRange[] | undefined; thursday?: OpeningRange[] | undefined; friday?: OpeningRange[] | undefined; saturday?: OpeningRange[] | undefined; }
```

## src/components/media-section.tsx

```ts
function MediaSection
MediaSection.children?: React.ReactNode
MediaSection.eyebrow?: React.ReactNode
MediaSection.title: React.ReactNode
MediaSection.actions?: React.ReactNode
MediaSection.media: React.ReactNode
MediaSection.mediaPosition?: 'end' | 'start' | undefined
MediaSection.mediaAspect?: 'square' | 'portrait' | 'landscape' | undefined
MediaSection.*: react
```

## src/components/quote.tsx

```ts
function Quote
Quote.children: React.ReactNode
Quote.author?: React.ReactNode
Quote.byline?: React.ReactNode
Quote.avatar?: React.ReactNode
Quote.cite?: string | undefined
Quote.variant?: 'card' | 'default' | 'large' | undefined
Quote.align?: 'center' | 'start' | undefined
Quote.*: react
```

## src/components/legal-layout.tsx

```ts
function LegalLayout
LegalLayout.children?: React.ReactNode
LegalLayout.title: React.ReactNode
LegalLayout.updated?: string | Date | undefined
LegalLayout.intro?: React.ReactNode
LegalLayout.sections: LegalSection[]
LegalLayout.numbered?: boolean | undefined
LegalLayout.*: react
type LegalSection = {}
LegalSection.id: string
LegalSection.title: string
LegalSection.content: React.ReactNode
```
