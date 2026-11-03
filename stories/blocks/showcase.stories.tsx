import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AccessibilityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  CarIcon,
  LanguagesIcon,
  PhoneIcon,
  TramFrontIcon,
} from 'lucide-react'

import { ContactDetails, ContactSection, OpeningHours } from '@/components/contact-section'
import { Hero } from '@/components/hero'
import { LegalLayout } from '@/components/legal-layout'
import { MediaSection } from '@/components/media-section'
import { PractitionerCard, PractitionerGrid } from '@/components/practitioner-card'
import { Quote } from '@/components/quote'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

import {
  hoursExceptions,
  mapPicture,
  practitioners,
  roomPhoto,
  roomPhotoDusk,
  storyNow,
  weeklyHours,
} from './showcase-data'

const brand = (
  <a href="#" className="font-display text-[19px] font-semibold tracking-[-0.02em] text-foreground">
    Atelier <span className="text-primary-text">Ostéo</span>
  </a>
)

const header = (
  <SiteHeader
    brand={brand}
    links={[
      { label: 'The practice', href: '#practice' },
      { label: 'Team', href: '#team' },
      { label: 'Contact', href: '#contact' },
    ]}
    actions={
      <Button size="sm" asChild>
        <a href="#book">Book a visit</a>
      </Button>
    }
  />
)

const team = practitioners.map((p) => (
  <PractitionerCard
    key={p.name}
    headingLevel={3}
    name={p.name}
    profession={p.profession}
    photo={<img src={p.photo} alt="" />}
    specialties={p.specialties}
    bio={p.bio}
    facts={[
      { icon: <LanguagesIcon />, label: 'Languages', value: p.languages },
      { icon: <BadgeCheckIcon />, label: 'Approved', value: 'Registered osteopath' },
    ]}
    actions={
      <Button size="sm" variant="secondary" asChild>
        <a href="#book">
          <CalendarCheckIcon />
          Book with {p.name.split(' ')[0]}
        </a>
      </Button>
    }
  />
))

const contact = (
  <>
    <ContactDetails
      address={
        <>
          24 rue Vendôme
          <br />
          69006 Lyon
        </>
      }
      directionsHref="https://www.openstreetmap.org/"
      phone="04 78 00 00 00"
      email="contact@atelier-osteo.example"
      items={[
        { icon: <TramFrontIcon />, label: 'Access', value: 'Metro A, Foch · Bus C6' },
        { icon: <CarIcon />, label: 'Parking', value: 'Morand car park, 3 min on foot' },
        {
          icon: <AccessibilityIcon />,
          label: 'Wheelchair access',
          value: 'Ground floor, step-free',
        },
      ]}
    />
    <OpeningHours hours={weeklyHours} exceptions={hoursExceptions} now={storyNow} />
  </>
)

const footer = (
  <SiteFooter
    brand={
      <>
        {brand}
        <p className="m-0 max-w-[36ch]">
          Osteopathy for babies, athletes and everyone in between, in Lyon 6e since 2014.
        </p>
      </>
    }
    columns={[
      {
        title: 'The practice',
        links: [
          { label: 'Our approach', href: '#practice' },
          { label: 'The team', href: '#team' },
          { label: 'Prices', href: '#prices' },
          { label: 'FAQ', href: '#faq' },
        ],
      },
      {
        title: 'Care',
        links: [
          { label: 'Infants', href: '#infants' },
          { label: 'Pregnancy', href: '#pregnancy' },
          { label: 'Sports', href: '#sports' },
        ],
      },
      {
        title: 'Visit us',
        content: (
          <>
            24 rue Vendôme, 69006 Lyon
            <br />
            <a href="tel:+33478000000" className="hover:text-foreground">
              04 78 00 00 00
            </a>
            <br />
            Mon–Sat, see opening hours
          </>
        ),
      },
    ]}
    social={[
      {
        label: 'Phone',
        href: 'tel:+33478000000',
        icon: <PhoneIcon />,
      },
    ]}
    note="© 2026 Atelier Ostéo"
    links={[
      { label: 'Legal notice', href: '#legal' },
      { label: 'Privacy', href: '#privacy' },
    ]}
  />
)

const meta = {
  title: 'Blocks/Showcase',
  component: Hero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sections for the public site of a practice, a studio or a firm: `Hero` with an image (`layout="split"` or `"cover"`), `PractitionerCard` in a `PractitionerGrid`, `ContactSection` with `ContactDetails` and `OpeningHours`, `MediaSection`, `Quote`, `LegalLayout`, and `SiteFooter` with columns. Backgrounds come from `surfaces.css`: `data-surface="bone"` on the page, `data-theme="dark" data-surface="mineral"` on a band. The consumer provides the content, the images and the links; nothing is fetched.',
      },
    },
  },
  args: {
    eyebrow: 'Osteopathy · Lyon 6e',
    title: 'Move freely,',
    highlight: 'at every age.',
    description:
      'Three osteopaths for babies, athletes and everyone in between. Appointments within the week, six days out of seven.',
    layout: 'split',
  },
} satisfies Meta<typeof Hero>
export default meta
type Story = StoryObj<typeof meta>

/** A whole page on the bone surface, with a mineral-blue band. */
export const PracticePage: Story = {
  render: (args) => (
    <div data-surface="bone" className="bg-background">
      {header}
      <Hero
        {...args}
        media={<img src={roomPhoto} alt="The treatment room, a table by a tall window" />}
        actions={
          <>
            <Button size="lg" asChild>
              <a href="#book">
                Book a visit
                <ArrowRightIcon />
              </a>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="tel:+33478000000">
                <PhoneIcon />
                04 78 00 00 00
              </a>
            </Button>
          </>
        }
      />
      <MediaSection
        id="practice"
        eyebrow="Our approach"
        title="A first visit takes an hour"
        media={<img src={roomPhoto} alt="" />}
        mediaPosition="start"
      >
        <p>
          We listen first: your history, your daily life, what hurts and since when. Then a gentle
          examination and the treatment itself.
        </p>
        <ul>
          <li>Reimbursed by most complementary health insurers</li>
          <li>Babies from their first weeks</li>
        </ul>
      </MediaSection>
      <div data-theme="dark" data-surface="mineral" className="bg-background">
        <PractitionerGrid id="team" eyebrow="The team" title="Three osteopaths, one practice">
          {team}
        </PractitionerGrid>
      </div>
      <section className="px-5 py-20">
        <Quote variant="large" align="center" author="Sophie L." byline="Patient since 2021">
          I came for my back after my second pregnancy, and came back with my daughter a few weeks
          later. Calm, precise, and always on time.
        </Quote>
      </section>
      <ContactSection
        id="contact"
        eyebrow="Contact"
        title="Come and see us"
        className="border-t border-border-subtle"
        map={<img src={mapPicture} alt="Map: the practice is on rue Vendôme, near Foch metro" />}
      >
        {contact}
      </ContactSection>
      {footer}
    </div>
  ),
}

export const French: Story = {
  ...PracticePage,
  globals: { locale: 'fr' },
}

/** `layout="cover"`: the photo fills the section, under a scrim, in the dark theme. */
export const HeroCover: Story = {
  render: (args) => (
    <Hero
      {...args}
      layout="cover"
      data-surface="mineral"
      media={<img src={roomPhotoDusk} alt="" />}
      actions={
        <Button size="lg" asChild>
          <a href="#book">
            Book a visit
            <ArrowRightIcon />
          </a>
        </Button>
      }
    />
  ),
}

/** The image on the start side, the highlight in solid accent text. */
export const HeroSplitStart: Story = {
  args: { mediaPosition: 'start', highlightStyle: 'solid' },
  render: (args) => <Hero {...args} media={<img src={roomPhoto} alt="" />} />,
}

export const Practitioners: Story = {
  render: () => (
    <PractitionerGrid eyebrow="The team" title="Three osteopaths, one practice">
      {team}
    </PractitionerGrid>
  ),
}

/** Portrait beside the text; no photo shows the initials. */
export const PractitionerHorizontal: Story = {
  render: () => (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5 p-5">
      <PractitionerCard
        orientation="horizontal"
        name={practitioners[0].name}
        profession={practitioners[0].profession}
        photo={<img src={practitioners[0].photo} alt="" />}
        specialties={practitioners[0].specialties}
        bio={practitioners[0].bio}
        actions={<Button size="sm">Book an appointment</Button>}
      />
      <PractitionerCard
        orientation="horizontal"
        name="Dr Paul Lefèvre"
        profession="General practitioner"
        bio="On Tuesdays and Thursdays, for patients the osteopaths refer."
        facts={[{ icon: <LanguagesIcon />, label: 'Languages', value: 'French, Italian' }]}
      />
    </div>
  ),
}

export const ContactAndHours: Story = {
  render: () => (
    <ContactSection
      eyebrow="Contact"
      title="Come and see us"
      description="By phone or online, appointments within the week."
      map={<img src={mapPicture} alt="Map: the practice is on rue Vendôme, near Foch metro" />}
    >
      {contact}
    </ContactSection>
  ),
}

/** Saturday evening: it opens again on Monday. */
export const HoursClosed: Story = {
  render: () => (
    <div className="mx-auto max-w-[420px] p-5">
      <OpeningHours hours={weeklyHours} now={new Date(2026, 9, 17, 18, 45)} />
    </div>
  ),
}

export const Footer: Story = { render: () => footer }

export const MediaAndText: Story = {
  render: () => (
    <>
      <MediaSection
        eyebrow="Infants"
        title="Gentle care from the first weeks"
        media={<img src={roomPhoto} alt="" />}
        actions={<Button variant="secondary">Read more</Button>}
      >
        <p>
          A difficult birth, a baby who can’t settle: a session lasts about thirty minutes, with you
          close by.
        </p>
      </MediaSection>
      <MediaSection
        eyebrow="Sports"
        title="Back on track after an injury"
        media={<img src={practitioners[1].photo} alt="" />}
        mediaPosition="start"
        mediaAspect="portrait"
      >
        <p>We work with your coach or physiotherapist, and plan sessions around your training.</p>
      </MediaSection>
    </>
  ),
}

export const Quotes: Story = {
  render: () => (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-14 px-5 py-14">
      <Quote variant="large" author="Sophie L." byline="Patient since 2021">
        Calm, precise, and always on time.
      </Quote>
      <div className="grid gap-5 md:grid-cols-3">
        <Quote
          variant="card"
          author="Marc D."
          byline="Trail runner"
          avatar={<img src={practitioners[1].photo} alt="" />}
        >
          Two sessions before the race and my knee held for 80 km.
        </Quote>
        <Quote variant="card" author="Léa and Tom" byline="Parents of Jules, 6 weeks">
          He sleeps. We sleep. Thank you.
        </Quote>
        <Quote
          variant="card"
          author="Le Progrès"
          byline="March 2026"
          cite="https://www.example.com/article"
        >
          A practice that takes the time to explain.
        </Quote>
      </div>
    </div>
  ),
}

export const LegalPage: Story = {
  render: () => (
    <LegalLayout
      title="Legal notice"
      updated="2026-09-30"
      intro={
        <p>
          This site is published by Atelier Ostéo. Questions about this notice:{' '}
          <a href="mailto:contact@atelier-osteo.example">contact@atelier-osteo.example</a>.
        </p>
      }
      sections={[
        {
          id: 'publisher',
          title: 'Publisher',
          content: (
            <p>
              Atelier Ostéo, a professional partnership with capital of €3,000, 24 rue Vendôme,
              69006 Lyon. Publishing director: Claire Morel.
            </p>
          ),
        },
        {
          id: 'host',
          title: 'Hosting',
          content: <p>The site is hosted by Example Hosting, 1 rue de l’Exemple, 75000 Paris.</p>,
        },
        {
          id: 'data',
          title: 'Personal data',
          content: (
            <>
              <p>
                The booking form collects your name, phone number and email, only to arrange your
                appointment. They are kept for three years after your last visit.
              </p>
              <ul>
                <li>You can see, correct or delete them at any time.</li>
                <li>Nothing is passed on to third parties.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies',
          content: (
            <p>
              The site sets no tracking cookie. The map on the contact page loads only when you
              click it.
            </p>
          ),
        },
      ]}
    />
  ),
}
