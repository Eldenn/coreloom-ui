'use client'

// Coreloom UI — DocsLayout (docs block). Nav column, article and "On this page" rail under
// your header. On phones the nav opens in a Sheet and the rail is hidden.
import { MenuIcon } from 'lucide-react'
import * as React from 'react'

import { DocsToc, type TocItem } from '@/components/docs-toc'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCoreloomI18n } from '@/lib/i18n'
import { AppLink } from '@/lib/link'
import { cn } from '@/lib/utils'

interface DocsNavGroup {
  title: string
  items: { title: string; href: string; active?: boolean }[]
}

function DocsNav({ groups, onNavigate }: { groups: DocsNavGroup[]; onNavigate?: () => void }) {
  const t = useCoreloomI18n().messages
  return (
    <nav aria-label={t.docs.nav}>
      {groups.map((group) => (
        <div key={group.title} className="mb-5">
          <div className="mb-2 px-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            {group.title}
          </div>
          {group.items.map((item) => (
            <AppLink
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'block rounded-sm px-2.5 py-1.5 text-[14px] transition-colors',
                item.active
                  ? 'bg-primary-subtle font-medium text-primary-text'
                  : 'text-fg-secondary hover:bg-accent hover:text-foreground',
              )}
            >
              {item.title}
            </AppLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function DocsLayout({
  header,
  nav,
  toc = [],
  children,
  className,
}: {
  /** Usually a SiteHeader with search and the theme toggle. */
  header?: React.ReactNode
  nav: DocsNavGroup[]
  /** Headings of the current page; ids must match the headings' id attributes. */
  toc?: TocItem[]
  children: React.ReactNode
  className?: string
}) {
  const t = useCoreloomI18n().messages
  const [open, setOpen] = React.useState(false)
  return (
    <div className={cn('min-h-svh bg-background', className)}>
      {header}
      <div className="mx-auto grid max-w-[1240px] md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_200px]">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] overflow-y-auto border-r border-border-subtle px-3 py-7 md:block">
          <DocsNav groups={nav} />
        </aside>
        <main className="min-w-0 px-5 pt-6 pb-24 md:px-12 md:pt-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mb-6 md:hidden">
                <MenuIcon />
                {t.docs.menu}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] overflow-y-auto px-4">
              <SheetHeader className="px-0">
                <SheetTitle>{t.docs.nav}</SheetTitle>
              </SheetHeader>
              <DocsNav
                groups={nav}
                onNavigate={() => {
                  setOpen(false)
                }}
              />
            </SheetContent>
          </Sheet>
          <article className="max-w-[760px]">{children}</article>
        </main>
        {toc.length > 0 && (
          <div className="sticky top-16 hidden h-[calc(100svh-4rem)] px-4 py-8 lg:block">
            <DocsToc items={toc} />
          </div>
        )}
      </div>
    </div>
  )
}

/** Page heading block: eyebrow, title, lead. */
function DocsPageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
}) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <h1 className="m-0 font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.025em] text-foreground">
        {title}
      </h1>
      {lead && (
        <p className="mt-3 mb-0 max-w-[62ch] text-[18px] leading-[1.6] text-fg-secondary">{lead}</p>
      )}
    </div>
  )
}

export { DocsLayout, DocsNav, type DocsNavGroup, DocsPageHeader }
