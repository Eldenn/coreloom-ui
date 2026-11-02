// Coreloom UI — MediaSection (showcase block). An image beside a block of text: eyebrow, title,
// body, actions. Alternate `mediaPosition` from one section to the next for a page that reads as a
// story (the practice, the approach, the first visit).
import * as React from 'react'

import { cn } from '@/lib/utils'

function MediaSection({
  eyebrow,
  title,
  children,
  actions,
  media,
  mediaPosition = 'end',
  mediaAspect = 'landscape',
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  /** The body: paragraphs, a list. Plain `<p>` and `<ul>` get the section's type. */
  children?: React.ReactNode
  actions?: React.ReactNode
  /** An `<img>` (or your framework's image) with its `alt`, or a `<video>`. It fills the frame. */
  media: React.ReactNode
  /** The media's side from 768px. Default "end" (right in left-to-right languages). Phones stack it first. */
  mediaPosition?: 'start' | 'end'
  /** The frame's shape: "landscape" 4:3 (the default), "portrait" 4:5 or "square". */
  mediaAspect?: 'landscape' | 'portrait' | 'square'
}) {
  return (
    <section {...props} className={cn('px-5 py-16 md:py-20', className)}>
      <div className="mx-auto grid max-w-[1120px] items-center gap-8 md:grid-cols-2 md:gap-14">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border-subtle bg-inset [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
            mediaAspect === 'landscape' && 'aspect-[4/3]',
            mediaAspect === 'portrait' && 'mx-auto aspect-[4/5] w-full max-w-[460px]',
            mediaAspect === 'square' && 'aspect-square',
            mediaPosition === 'end' && 'md:order-2',
          )}
        >
          {media}
        </div>
        <div className="min-w-0">
          {!!eyebrow && (
            <p className="m-0 font-mono text-[11px] tracking-[0.12em] text-primary-text uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-2.5 mb-0 font-display text-[clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          {!!children && (
            <div className="mt-4 flex flex-col gap-3 text-[16px] leading-[1.65] text-fg-secondary [&_li]:mt-1.5 [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:m-0 [&_ul]:list-disc [&_ul]:ps-5 marker:[&_ul]:text-primary-text">
              {children}
            </div>
          )}
          {!!actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  )
}

export { MediaSection }
