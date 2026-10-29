// Coreloom UI — SiteFooter (marketing and docs blocks).
import * as React from "react"

import { cn } from "@/lib/utils"
import { AppLink } from "@/lib/link"

function SiteFooter({
  note,
  links = [],
  maxWidth = "max-w-[1120px]",
  className,
}: {
  /** Left side: "© 2026 Coreloom — MIT licensed". */
  note: React.ReactNode
  links?: { label: string; href: string }[]
  maxWidth?: string
  className?: string
}) {
  return (
    <footer className={cn("border-t border-border-subtle px-5 py-8", className)}>
      <div className={cn("mx-auto flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted-foreground", maxWidth)}>
        <span>{note}</span>
        {links.length > 0 && (
          <nav className="flex flex-wrap gap-5" aria-label="Footer">
            {links.map((link) => (
              <AppLink key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </AppLink>
            ))}
          </nav>
        )}
      </div>
    </footer>
  )
}

export { SiteFooter }
