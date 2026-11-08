'use client'

// Coreloom UI — Testimonials (testimonials block). What customers say, as cards: `TestimonialGrid`
// lines them up in even rows (a featured one spans two columns), `TestimonialWall` stacks many of
// them in columns of different heights and shows the rest on demand. Quotes, names and ratings
// come from the app; nothing is fetched.
import { QuoteIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  /** The words, without quotation marks: the mark is drawn. */
  quote: React.ReactNode
  /** Who said it. */
  author: string
  /** Their role and company: "CTO, Northwind". */
  byline?: React.ReactNode
  /** A small round portrait: an `<img alt="">` (the name is beside it). */
  avatar?: React.ReactNode
  /** Their company's logo, shown at the top of the card (an `<img>` with the company as `alt`). */
  logo?: React.ReactNode
  /** A score out of 5, shown as stars with the score in words. */
  rating?: number
  /** Where it was published: { label: "G2", href }. */
  source?: { label: string; href?: string }
  /** Spans two columns in a grid, with larger text. */
  featured?: boolean
}

function Source({ source }: { source: NonNullable<Testimonial['source']> }) {
  const t = useCoreloomI18n().messages.testimonials
  const className = 'text-[12.5px] text-muted-foreground'
  if (!source.href) return <span className={className}>{t.via(source.label)}</span>
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        className,
        'rounded-xs underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring',
      )}
    >
      {t.via(source.label)}
      <span className="sr-only"> {t.newTab}</span>
    </a>
  )
}

function TestimonialCard({
  testimonial,
  className,
  ...props
}: Omit<React.ComponentProps<'figure'>, 'children' | 'role'> & {
  testimonial: Testimonial
}) {
  const { quote, author, byline, avatar, logo, rating, source, featured } = testimonial
  return (
    <figure
      {...props}
      data-slot="testimonial"
      className={cn(
        'm-0 flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-hairline',
        className,
      )}
    >
      <div className="flex min-h-6 items-center justify-between gap-3">
        {logo ? (
          <span className="flex h-6 items-center [&>img]:h-full [&>img]:w-auto">{logo}</span>
        ) : (
          <QuoteIcon aria-hidden className="size-5 shrink-0 fill-current text-primary-text" />
        )}
        {rating !== undefined && <Rating value={rating} readOnly size="sm" />}
      </div>
      <blockquote className="m-0 flex-1">
        <p
          className={cn(
            'm-0 text-foreground',
            featured ? 'text-[19px] leading-[1.55]' : 'text-[15px] leading-[1.6]',
          )}
        >
          {quote}
        </p>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {!!avatar && (
          <span className="size-10 shrink-0 overflow-hidden rounded-full bg-secondary [&>img]:size-full [&>img]:object-cover">
            {avatar}
          </span>
        )}
        <span className="flex min-w-0 flex-col text-[13.5px]">
          <span className="font-medium text-foreground">{author}</span>
          {!!byline && <span className="text-muted-foreground">{byline}</span>}
          {!!source && <Source source={source} />}
        </span>
      </figcaption>
    </figure>
  )
}

function TestimonialGrid({
  testimonials,
  columns = 3,
  className,
  'aria-label': ariaLabel,
}: {
  testimonials: Testimonial[]
  /** Columns from the medium breakpoint up (one column on phones). Default 3. */
  columns?: 2 | 3
  className?: string
  'aria-label'?: string
}) {
  const t = useCoreloomI18n().messages.testimonials
  return (
    <ul
      data-slot="testimonial-grid"
      aria-label={ariaLabel ?? t.label}
      className={cn(
        'm-0 grid list-none gap-5 p-0',
        columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2',
        className,
      )}
    >
      {testimonials.map((item) => (
        <li key={item.id} className={cn(item.featured && 'md:col-span-2')}>
          <TestimonialCard testimonial={item} />
        </li>
      ))}
    </ul>
  )
}

function TestimonialWall({
  testimonials,
  initialCount = 9,
  columns = 3,
  className,
  'aria-label': ariaLabel,
}: {
  testimonials: Testimonial[]
  /** How many show before "Show more". Default 9; `Infinity` shows them all. */
  initialCount?: number
  /** Columns on large screens (two on tablets, one on phones). Default 3. */
  columns?: 2 | 3 | 4
  className?: string
  'aria-label'?: string
}) {
  const t = useCoreloomI18n().messages.testimonials
  const [shown, setShown] = React.useState(initialCount)
  const listRef = React.useRef<HTMLUListElement>(null)
  const visible = testimonials.slice(0, shown)
  const hidden = testimonials.length - visible.length

  function showMore() {
    const first = visible.length
    setShown(testimonials.length)
    // The button disappears: move focus to the first card it revealed.
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLElement>(':scope > li')[first]?.focus()
    })
  }

  return (
    <div data-slot="testimonial-wall" className={cn('flex flex-col items-center gap-8', className)}>
      <ul
        ref={listRef}
        aria-label={ariaLabel ?? t.label}
        className={cn(
          'm-0 w-full list-none gap-5 p-0 sm:columns-2',
          columns === 3 && 'lg:columns-3',
          columns === 4 && 'lg:columns-3 xl:columns-4',
        )}
      >
        {visible.map((item) => (
          <li
            key={item.id}
            tabIndex={-1}
            className="mb-5 break-inside-avoid rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <TestimonialCard testimonial={item} />
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button variant="secondary" onClick={showMore}>
          {t.showMore(hidden)}
        </Button>
      )}
    </div>
  )
}

export { type Testimonial, TestimonialCard, TestimonialGrid, TestimonialWall }
