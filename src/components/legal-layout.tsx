// Coreloom UI — LegalLayout (showcase block). The page for legal notices, a privacy policy or terms:
// title, last update, an introduction, then numbered sections with a table of contents beside them
// (above them on phones). Long text set to read: 70 characters a line, plain paragraphs and lists.
import * as React from 'react'

import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LegalSection {
  /** The anchor: "#host" links here. Lowercase, dashes; unique on the page. */
  id: string
  title: string
  /** Paragraphs, lists, a definition list. Plain `<p>`, `<ul>`, `<ol>`, `<a>` get the page's type. */
  content: React.ReactNode
}

function LegalLayout({
  title,
  updated,
  intro,
  sections,
  numbered = true,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'article'>, 'title'> & {
  /** "Legal notice", "Privacy policy". The page's h1. */
  title: React.ReactNode
  /** When the text last changed: a Date, or "YYYY-MM-DD". Shown in the locale's format. */
  updated?: Date | string
  intro?: React.ReactNode
  sections: LegalSection[]
  /** Number the sections (1., 2.…) in the titles and the contents. Default true. */
  numbered?: boolean
  /** After the sections: a contact line, a print button. */
  children?: React.ReactNode
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.showcase
  const tocId = React.useId()
  const date =
    typeof updated === 'string'
      ? (() => {
          const [y, m, d] = updated.split('-').map(Number)
          return new Date(y, m - 1, d)
        })()
      : updated
  const prose =
    'text-[15.5px] leading-[1.7] text-fg-secondary [&_a]:rounded-xs [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-4 [&_a]:outline-none [&_a:focus-visible]:ring-[3px] [&_a:focus-visible]:ring-ring [&_li]:mt-1.5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:my-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-6'

  return (
    <article {...props} className={cn('px-5 py-14 md:py-20', className)}>
      <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <header className="lg:col-start-2">
          <h1 className="m-0 font-display text-[clamp(32px,4vw,44px)] leading-[1.1] font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {date && !Number.isNaN(date.getTime()) && (
            <p className="mt-3 mb-0 text-[13.5px] text-muted-foreground">
              {t.updated(new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date))}
            </p>
          )}
          {!!intro && <div className={cn('mt-6 max-w-[70ch]', prose)}>{intro}</div>}
        </header>
        <nav
          aria-labelledby={tocId}
          className="self-start lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1"
        >
          <p
            id={tocId}
            className="m-0 mb-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            {t.contents}
          </p>
          <ol className="m-0 flex list-none flex-col gap-0.5 border-s border-border-subtle p-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ms-px block rounded-e-sm border-s-2 border-transparent py-1.5 ps-3 text-[13.5px] text-fg-secondary transition-colors outline-none hover:border-border-strong hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {numbered && <span className="me-1.5 tabular-nums">{i + 1}.</span>}
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0 lg:col-start-2">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="max-w-[70ch] scroll-mt-24 border-t border-border-subtle pt-8 pb-4 first:border-t-0 first:pt-0"
            >
              <h2
                id={`${s.id}-title`}
                className="m-0 font-display text-[22px] leading-[1.25] font-semibold tracking-[-0.015em] text-foreground"
              >
                {numbered && <span className="me-2 text-primary-text tabular-nums">{i + 1}.</span>}
                {s.title}
              </h2>
              <div className={prose}>{s.content}</div>
            </section>
          ))}
          {!!children && <div className={cn('mt-8 max-w-[70ch]', prose)}>{children}</div>}
        </div>
      </div>
    </article>
  )
}

export { LegalLayout, type LegalSection }
