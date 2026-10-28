"use client"

// Coreloom UI — SiteHeader (marketing and docs blocks). Sticky, translucent top bar: brand,
// links, actions; links move into a Sheet on phones.
import * as React from "react"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type SiteLink = { label: string; href: string; active?: boolean }

function SiteHeader({
  brand,
  links = [],
  actions,
  mobileActions,
  maxWidth = "max-w-[1120px]",
  className,
}: {
  brand: React.ReactNode
  links?: SiteLink[]
  /** Right side: search, GitHub, theme toggle, sign-in… */
  actions?: React.ReactNode
  /** Extra content at the bottom of the phone menu (a sign-in button). */
  mobileActions?: React.ReactNode
  /** Tailwind max-width class for the inner row. */
  maxWidth?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <header className={cn("sticky top-0 z-(--z-sticky) border-b border-border-subtle bg-background/85 backdrop-blur-md", className)}>
      <div className={cn("mx-auto flex h-16 items-center gap-6 px-5 md:px-7", maxWidth)}>
        {brand}
        {links.length > 0 && (
          <nav className="hidden items-center gap-6 text-[14px] md:flex" aria-label="Main">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn("transition-colors hover:text-foreground", link.active ? "font-medium text-foreground" : "text-fg-secondary")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {actions}
          {(links.length > 0 || mobileActions) && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] px-5">
                <SheetHeader className="px-0">
                  <SheetTitle>{brand}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1" aria-label="Main">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-sm px-2.5 py-2 text-[15px] text-fg-secondary hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                {mobileActions}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}

export { SiteHeader, type SiteLink }
