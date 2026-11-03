// Coreloom UI — Quote (showcase block). A pull quote with who said it: a patient's word, a
// founder's line, a press mention. "large" sets it as a section of its own; "card" puts it on a
// card, for a row of testimonials.
import { QuoteIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Quote({
  children,
  author,
  byline,
  avatar,
  cite,
  variant = 'default',
  align = 'start',
  className,
  ...props
}: Omit<React.ComponentProps<'figure'>, 'role'> & {
  /** The words, without quotation marks: the mark is drawn. */
  children: React.ReactNode
  /** Who said it. */
  author?: React.ReactNode
  /** Who they are, or where it was said: "Patient since 2021", "Le Progrès, March 2026". */
  byline?: React.ReactNode
  /** A small round portrait: an `<img alt="">` (the name is beside it). */
  avatar?: React.ReactNode
  /** The source's URL, if it was published (sets the blockquote's `cite`). */
  cite?: string
  /** "default": text on the page. "large": a display-size quote. "card": on a card. */
  variant?: 'default' | 'large' | 'card'
  /** Default "start"; "center" for a large quote standing alone. */
  align?: 'start' | 'center'
}) {
  const center = align === 'center'
  return (
    <figure
      {...props}
      className={cn(
        'm-0 flex flex-col gap-5',
        center && 'items-center text-center',
        variant === 'card' &&
          'rounded-lg border border-border bg-card p-6 text-card-foreground shadow-hairline',
        variant === 'large' && 'mx-auto max-w-[860px] gap-7',
        className,
      )}
    >
      <QuoteIcon
        aria-hidden
        className={cn(
          'shrink-0 fill-current text-primary-text',
          variant === 'large' ? 'size-9' : 'size-6',
        )}
      />
      <blockquote cite={cite} className="m-0">
        <p
          className={cn(
            'm-0 text-foreground',
            variant === 'large'
              ? 'font-display text-[clamp(24px,3.2vw,36px)] leading-[1.3] font-medium tracking-[-0.02em]'
              : 'text-[17px] leading-[1.6]',
          )}
        >
          {children}
        </p>
      </blockquote>
      {[author, byline].some(Boolean) && (
        <figcaption className={cn('flex items-center gap-3', center && 'justify-center')}>
          {!!avatar && (
            <span className="size-10 shrink-0 overflow-hidden rounded-full bg-secondary [&>img]:size-full [&>img]:object-cover">
              {avatar}
            </span>
          )}
          <span
            className={cn('flex flex-col text-[14px]', center ? 'items-center' : 'items-start')}
          >
            {!!author && <span className="font-medium text-foreground">{author}</span>}
            {!!byline && <span className="text-muted-foreground">{byline}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  )
}

export { Quote }
