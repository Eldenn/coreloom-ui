// Coreloom UI — FeatureGrid (marketing block). Eyebrow, title and a grid of feature cards.
import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardIcon, CardTitle } from "@/components/ui/card"

/** A Lucide icon component (`HomeIcon`) or an element (`<HomeIcon />`): elements also cross the
 *  server → client boundary in Next.js, components don't. */
type IconLike = LucideIcon | React.ReactElement

function renderIcon(icon: IconLike | undefined) {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const Icon = icon as LucideIcon
  return <Icon />
}

type Feature = {
  icon: IconLike
  title: string
  description: React.ReactNode
  /** Mono footnote: a package name, a real number. Leave it out rather than invent one. */
  meta?: string
}

function FeatureGrid({
  eyebrow,
  title,
  description,
  features,
  featured = 0,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  features: Feature[]
  /** Index of the card to feature with the cyan glow; -1 for none. */
  featured?: number
  className?: string
}) {
  return (
    <section className={cn("border-t border-border-subtle px-5 py-20", className)}>
      <div className="mx-auto max-w-[1120px]">
        <div className="mx-auto mb-10 max-w-[60ch] text-center">
          {eyebrow && <div className="font-mono text-[11px] tracking-[0.12em] text-primary-text uppercase">{eyebrow}</div>}
          <h2 className="mt-2.5 mb-0 font-display text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
          {description && <p className="mt-3 mb-0 text-[16px] leading-[1.6] text-fg-secondary">{description}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card key={f.title} accent={i === featured}>
              <CardIcon>
                {renderIcon(f.icon)}
              </CardIcon>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              {f.meta && <div className="mt-auto font-mono text-[11px] tracking-[0.02em] text-muted-foreground">{f.meta}</div>}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { FeatureGrid, type Feature }
