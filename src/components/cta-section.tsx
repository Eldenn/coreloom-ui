// Coreloom UI — CtaSection (marketing block). The closing call to action, on a featured card.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

function CtaSection({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("px-5 pb-24", className)}>
      <Card accent className="mx-auto max-w-[1120px] items-center gap-5 px-8 py-12 text-center">
        <h2 className="m-0 font-display text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {description && <p className="m-0 max-w-[52ch] text-[16px] leading-[1.6] text-fg-secondary">{description}</p>}
        {actions && <div className="flex flex-wrap justify-center gap-3">{actions}</div>}
      </Card>
    </section>
  )
}

export { CtaSection }
