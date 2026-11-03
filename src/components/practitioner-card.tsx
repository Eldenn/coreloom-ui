// Coreloom UI — PractitionerCard (showcase block). One person a visitor can book or call: portrait,
// name, profession, specialties, a short bio, a few facts (languages, approvals, registration
// number) and the actions. PractitionerGrid lays several out under a section title. For the people
// of a public site — a practice, a studio, a firm — not for managing an app's members (that's Team).
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface PractitionerFact {
  /** A small icon: `<LanguagesIcon />`. Decorative; the label says what it is. */
  icon?: React.ReactNode
  /** What the fact is: "Languages", "Approved". */
  label: string
  value: React.ReactNode
}

/** Initials for the portrait fallback: "Dr Claire Morel" → "CM". */
function initialsOf(name: string) {
  const words = name
    .replace(/^(dr|pr|me|mme|m|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

function PractitionerCard({
  name,
  profession,
  photo,
  specialties = [],
  bio,
  facts = [],
  actions,
  orientation = 'vertical',
  headingLevel,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'role'> & {
  name: string
  /** The profession, as the person writes it: "Ostéopathe D.O.", "Physiotherapist". */
  profession?: React.ReactNode
  /**
   * The portrait: an `<img>` (or your framework's image) with `alt=""` — the name is right beside
   * it. It fills a 4:5 frame. Without one, the initials stand in.
   */
  photo?: React.ReactNode
  /** Short tags: "Sports", "Pregnancy", "Infants". */
  specialties?: string[]
  /** Two or three sentences. Longer text belongs on the person's own page. */
  bio?: React.ReactNode
  facts?: PractitionerFact[]
  /** "Book an appointment" (the primary one) and, say, a phone link. */
  actions?: React.ReactNode
  /** "vertical" (the default): portrait on top. "horizontal": portrait beside the text from 640px. */
  orientation?: 'vertical' | 'horizontal'
  /**
   * The name as a heading (`2`–`4`) when the cards are the page's own sections. Default: a plain
   * paragraph, so a card never breaks the host page's outline.
   */
  headingLevel?: 2 | 3 | 4
}) {
  const t = useCoreloomI18n().messages.showcase
  const Name = headingLevel ? (`h${headingLevel}` as const) : 'p'
  const horizontal = orientation === 'horizontal'
  return (
    <article
      {...props}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-hairline',
        horizontal && 'sm:flex-row',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/5] shrink-0 overflow-hidden bg-secondary [&>img]:size-full [&>img]:object-cover',
          horizontal && 'sm:aspect-auto sm:w-[38%] sm:max-w-[240px]',
        )}
      >
        {photo ?? (
          <span
            aria-hidden
            className="flex size-full items-center justify-center font-display text-[44px] font-semibold tracking-[-0.02em] text-muted-foreground"
          >
            {initialsOf(name)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <Name className="m-0 font-display text-[19px] leading-[1.25] font-semibold tracking-[-0.01em] text-foreground">
            {name}
          </Name>
          {!!profession && <p className="mt-1 mb-0 text-[14px] text-primary-text">{profession}</p>}
        </div>
        {specialties.length > 0 && (
          <ul aria-label={t.specialties} className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {specialties.map((s) => (
              <li key={s}>
                <Badge variant="secondary">{s}</Badge>
              </li>
            ))}
          </ul>
        )}
        {!!bio && <p className="m-0 text-[14px] leading-[1.6] text-fg-secondary">{bio}</p>}
        {facts.length > 0 && (
          <dl className="m-0 grid gap-2 text-[13px]">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                {!!f.icon && (
                  <span
                    aria-hidden
                    className="mt-px text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
                  >
                    {f.icon}
                  </span>
                )}
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="m-0 text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!!actions && <div className="mt-auto flex flex-wrap gap-2 pt-1">{actions}</div>}
      </div>
    </article>
  )
}

function PractitionerGrid({
  eyebrow,
  title,
  description,
  columns = 3,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  /** Cards per row on wide screens (1 on phones, 2 from 640px). Default 3. */
  columns?: 2 | 3 | 4
  /** PractitionerCards. */
  children: React.ReactNode
}) {
  return (
    <section {...props} className={cn('px-5 py-20', className)}>
      <div className="mx-auto max-w-[1120px]">
        {[eyebrow, title, description].some(Boolean) && (
          <div className="mx-auto mb-10 max-w-[60ch] text-center">
            {!!eyebrow && (
              <p className="m-0 font-mono text-[11px] tracking-[0.12em] text-primary-text uppercase">
                {eyebrow}
              </p>
            )}
            {!!title && (
              <h2 className="mt-2.5 mb-0 font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
                {title}
              </h2>
            )}
            {!!description && (
              <p className="mt-3 mb-0 text-[16px] leading-[1.6] text-fg-secondary">{description}</p>
            )}
          </div>
        )}
        <div
          className={cn(
            'grid gap-5 sm:grid-cols-2',
            columns === 3 && 'lg:grid-cols-3',
            columns === 4 && 'lg:grid-cols-4',
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

export { initialsOf, PractitionerCard, type PractitionerFact, PractitionerGrid }
