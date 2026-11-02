// Coreloom UI — Hero (marketing block). The first section of a page: announcement or eyebrow,
// headline with an accent phrase, lead, actions and an optional install command. Three layouts:
// centered over the accent top-light, split with an image beside the text, or cover, with the image
// filling the section behind a scrim.
import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type HeroLayout = 'centered' | 'split' | 'cover'

function Hero({
  announcement,
  eyebrow,
  title,
  highlight,
  highlightStyle = 'gradient',
  description,
  actions,
  command,
  media,
  layout = 'centered',
  mediaPosition = 'end',
  glow,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title' | 'children'> & {
  /** Short badge above the title: "v3.0 — now built on shadcn/ui". */
  announcement?: React.ReactNode
  /** Mono label above the title, for a quieter page: "Cabinet d’ostéopathie — Lyon 6e". */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  /** The end of the headline, set in the accent colour. */
  highlight?: React.ReactNode
  /** "gradient" (the default) fades the accent into the text colour; "solid" is the accent text colour. */
  highlightStyle?: 'gradient' | 'solid'
  description?: React.ReactNode
  actions?: React.ReactNode
  /** A shell command shown in a copyable well under the actions. */
  command?: string
  /**
   * The image: an `<img>` (or your framework's image component) with its `alt`, or a `<video>`.
   * An `<img>` or `<video>` child fills the frame (object-fit: cover). Needs `layout` "split" or "cover".
   */
  media?: React.ReactNode
  /**
   * "centered" (the default): text in the middle, no media. "split": text and media side by side
   * from 1024px, stacked below. "cover": the media fills the section behind a scrim and the text
   * sits on it, in the dark theme so it stays readable on any photo.
   */
  layout?: HeroLayout
  /** Split layout: the media's side. Default "end" (right in left-to-right languages). */
  mediaPosition?: 'start' | 'end'
  /** The faint accent top-light. Default: on for "centered", off for the others. */
  glow?: boolean
  /** Anything below: a product shot, a live demo, logos. */
  children?: React.ReactNode
}) {
  const centered = layout === 'centered'
  const split = layout === 'split' && !!media
  const cover = layout === 'cover' && !!media
  glow ??= centered
  const align = centered || (!split && !cover) ? 'center' : 'start'

  const text = (
    <div className={cn('relative', align === 'center' ? 'text-center' : 'text-start')}>
      {!!announcement && (
        <Badge variant="default">
          <BadgeDot />
          {announcement}
        </Badge>
      )}
      {!!eyebrow && (
        <p className="m-0 font-mono text-[12px] font-semibold tracking-[0.12em] text-primary-text uppercase">
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          'mb-0 font-display leading-[1.02] font-semibold tracking-[-0.035em] text-foreground',
          announcement || eyebrow ? 'mt-6' : 'mt-0',
          align === 'center'
            ? 'mx-auto max-w-[18ch] text-[clamp(40px,6vw,72px)]'
            : 'max-w-[20ch] text-[clamp(36px,4.6vw,60px)] leading-[1.05]',
        )}
      >
        {title}
        {!!highlight && (
          <>
            {' '}
            <span
              className={
                highlightStyle === 'solid'
                  ? 'text-primary-text'
                  : // From the accent text colour, half-way to the page's text colour, into the
                    // accent text colour: lighter in dark, deeper in light, any accent preset.
                    'bg-[linear-gradient(120deg,color-mix(in_oklab,var(--accent-fg)_55%,var(--fg-1)),var(--accent-fg))] bg-clip-text text-transparent'
              }
            >
              {highlight}
            </span>
          </>
        )}
      </h1>
      {!!description && (
        <p
          className={cn(
            'mt-5 mb-0 max-w-[60ch] leading-[1.6] text-fg-secondary',
            align === 'center' ? 'mx-auto text-[19px]' : 'text-[18px]',
          )}
        >
          {description}
        </p>
      )}
      {!!actions && (
        <div className={cn('mt-8 flex flex-wrap gap-3', align === 'center' && 'justify-center')}>
          {actions}
        </div>
      )}
      {command && (
        <div
          className={cn(
            'mt-8 flex max-w-[460px] items-center justify-between gap-4 rounded-md border border-border bg-inset py-2 pr-2 pl-4 font-mono text-[14px] text-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          <span className="truncate">
            <span className="text-primary-text">$</span>&nbsp; {command}
          </span>
          <CopyButton value={command} />
        </div>
      )}
    </div>
  )

  if (cover) {
    return (
      <section
        data-theme="dark"
        {...props}
        className={cn('relative isolate overflow-hidden bg-background', className)}
      >
        <div className="absolute inset-0 -z-10 [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover">
          {media}
        </div>
        {/* The scrim: the page background over the photo, heaviest where the text sits. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[color-mix(in_oklab,var(--bg-base)_78%,transparent)] md:bg-[linear-gradient(90deg,color-mix(in_oklab,var(--bg-base)_88%,transparent)_0%,color-mix(in_oklab,var(--bg-base)_62%,transparent)_50%,color-mix(in_oklab,var(--bg-base)_8%,transparent)_100%)] rtl:md:bg-[linear-gradient(270deg,color-mix(in_oklab,var(--bg-base)_88%,transparent)_0%,color-mix(in_oklab,var(--bg-base)_62%,transparent)_50%,color-mix(in_oklab,var(--bg-base)_8%,transparent)_100%)]"
        />
        <div className="mx-auto flex min-h-[560px] max-w-[1120px] flex-col justify-center px-5 py-20 md:min-h-[640px] md:py-28">
          <div className="max-w-[640px]">{text}</div>
          {!!children && <div className="mt-14">{children}</div>}
        </div>
      </section>
    )
  }

  return (
    <section
      {...props}
      className={cn('relative px-5', split ? 'py-16 md:py-20' : 'pt-20 pb-16 md:pt-24', className)}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[15%] -top-10 h-[420px] bg-[radial-gradient(ellipse_at_50%_0,var(--accent-subtle),transparent_70%)]"
        />
      )}
      <div className="relative mx-auto max-w-[1120px]">
        {split ? (
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className={cn(mediaPosition === 'start' && 'lg:order-2')}>{text}</div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-subtle bg-inset shadow-lg [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover">
              {media}
            </div>
          </div>
        ) : (
          text
        )}
        {!!children && <div className="mt-14">{children}</div>}
      </div>
    </section>
  )
}

export { Hero, type HeroLayout }
