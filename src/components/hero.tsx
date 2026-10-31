// Coreloom UI — Hero (marketing block). Announcement badge, headline with an accent phrase,
// lead, two actions and an optional install command — over the faint cyan top-light.
import * as React from 'react'

import { CopyButton } from '@/components/copy-button'
import { Badge, BadgeDot } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function Hero({
  announcement,
  title,
  highlight,
  description,
  actions,
  command,
  children,
  className,
}: {
  /** Short badge above the title: "v3.0 — now built on shadcn/ui". */
  announcement?: React.ReactNode
  title: React.ReactNode
  /** The end of the headline, set in the cyan gradient. */
  highlight?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** A shell command shown in a copyable well under the actions. */
  command?: string
  /** Anything below: a product shot, a live demo. */
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative px-5 pt-20 pb-16 text-center md:pt-24', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[15%] -top-10 h-[420px] bg-[radial-gradient(ellipse_at_50%_0,var(--accent-subtle),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1120px]">
        {announcement && (
          <Badge variant="default">
            <BadgeDot />
            {announcement}
          </Badge>
        )}
        <h1 className="mx-auto mt-6 mb-0 max-w-[18ch] font-display text-[clamp(40px,6vw,72px)] leading-[1.02] font-semibold tracking-[-0.035em] text-foreground">
          {title}
          {highlight && (
            <>
              {' '}
              <span className="bg-[linear-gradient(120deg,var(--cyan-200),var(--accent))] bg-clip-text text-transparent">
                {highlight}
              </span>
            </>
          )}
        </h1>
        {description && (
          <p className="mx-auto mt-5 mb-0 max-w-[60ch] text-[19px] leading-[1.6] text-fg-secondary">
            {description}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
        {command && (
          <div className="mx-auto mt-8 flex max-w-[460px] items-center justify-between gap-4 rounded-md border border-border bg-inset py-2 pr-2 pl-4 font-mono text-[14px] text-foreground">
            <span className="truncate">
              <span className="text-primary-text">$</span>&nbsp; {command}
            </span>
            <CopyButton value={command} />
          </div>
        )}
        {children && <div className="mt-14">{children}</div>}
      </div>
    </section>
  )
}

export { Hero }
