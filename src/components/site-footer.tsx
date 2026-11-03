// Coreloom UI — SiteFooter (marketing, docs and showcase blocks). A note and a row of links; with
// `brand` or `columns`, a full site footer above that row: the brand (logo, a line about you, social
// links) and columns of links or text (pages, services, address, hours).
import * as React from 'react'

import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  /** The column's label: "Services", "The practice". Not a heading, so the page outline stays yours. */
  title: string
  /** Links, stacked. */
  links?: FooterLink[]
  /** Anything else instead of (or after) links: an address, opening hours, a phone number. */
  content?: React.ReactNode
}

interface FooterSocialLink extends FooterLink {
  /** The network's logo, decorative (`label` names the link). */
  icon: React.ReactNode
}

/** Columns from 1024px, by number of cells; the brand cell (first) is a little wider. */
const GRID: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'lg:grid-cols-[1.4fr_1fr]',
  3: 'lg:grid-cols-[1.4fr_1fr_1fr]',
  4: 'lg:grid-cols-[1.4fr_1fr_1fr_1fr]',
  5: 'lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]',
}

function SiteFooter({
  note,
  links = [],
  brand,
  columns = [],
  social = [],
  maxWidth = 'max-w-[1120px]',
  className,
}: {
  /** Bottom row, start side: "© 2026 Coreloom — MIT licensed". */
  note: React.ReactNode
  /** Bottom row, end side: legal links, a changelog. */
  links?: FooterLink[]
  /** First column of the full footer: your logo and a sentence or two. */
  brand?: React.ReactNode
  /** Columns after the brand: up to four read well. */
  columns?: FooterColumn[]
  /** Icon links under the brand (or in the bottom row when there's no brand). */
  social?: FooterSocialLink[]
  maxWidth?: string
  className?: string
}) {
  const t = useCoreloomI18n().messages.showcase
  const full = !!brand || columns.length > 0
  const brandCell = !!brand || social.length > 0
  const cells = columns.length + (brandCell ? 1 : 0)

  const socialLinks = social.length > 0 && (
    <ul aria-label={t.social} className="m-0 flex list-none flex-wrap gap-1 p-0">
      {social.map((s) => {
        const external = /^https?:/.test(s.href)
        return (
          <li key={s.href}>
            <a
              href={s.href}
              aria-label={external ? `${s.label} ${t.newTab}` : s.label}
              {...(external && { target: '_blank', rel: 'noreferrer noopener' })}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring [&>svg]:size-[18px]"
            >
              {s.icon}
            </a>
          </li>
        )
      })}
    </ul>
  )

  const linkClass =
    'rounded-xs transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring'

  return (
    <footer
      className={cn('border-t border-border-subtle px-5', full ? 'pt-14' : 'py-8', className)}
    >
      {full && (
        <div
          className={cn(
            'mx-auto grid gap-10 pb-12 sm:grid-cols-2',
            GRID[cells] ?? GRID[5],
            maxWidth,
          )}
        >
          {brandCell && (
            <div className="flex flex-col gap-4 text-[14px] leading-[1.6] text-fg-secondary">
              {brand}
              {socialLinks}
            </div>
          )}
          {columns.map((col) => (
            <div key={col.title} className="text-[14px] leading-[1.6]">
              <p className="m-0 mb-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground uppercase">
                {col.title}
              </p>
              {!!col.links?.length && (
                <nav aria-label={col.title}>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 text-fg-secondary">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <AppLink href={link.href} className={linkClass}>
                          {link.label}
                        </AppLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {!!col.content && (
                <div className={cn('text-fg-secondary', !!col.links?.length && 'mt-3')}>
                  {col.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        className={cn(
          'mx-auto flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted-foreground',
          full && 'border-t border-border-subtle py-6',
          maxWidth,
        )}
      >
        <span>{note}</span>
        {(links.length > 0 || (!full && social.length > 0)) && (
          <div className="flex flex-wrap items-center gap-5">
            {links.length > 0 && (
              <nav className="flex flex-wrap gap-5" aria-label={t.footer}>
                {links.map((link) => (
                  <AppLink key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </AppLink>
                ))}
              </nav>
            )}
            {!full && socialLinks}
          </div>
        )}
      </div>
    </footer>
  )
}

export { type FooterColumn, type FooterLink, type FooterSocialLink, SiteFooter }
