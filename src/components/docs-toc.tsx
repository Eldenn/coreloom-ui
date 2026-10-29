"use client"

// Coreloom UI — DocsToc (docs block). "On this page" with scroll spy: the heading in view is marked.
import * as React from "react"

import { cn } from "@/lib/utils"
import { useCoreloomI18n } from "@/lib/i18n"

type TocItem = { id: string; title: string; depth?: 2 | 3 }

function useActiveHeading(ids: string[]) {
  const [active, setActive] = React.useState(ids[0])
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-72px 0px -70% 0px" }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids.join("|")]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}

function DocsToc({ items, title }: { items: TocItem[]; title?: string }) {
  const t = useCoreloomI18n().messages
  title ??= t.docs.onThisPage
  const active = useActiveHeading(items.map((i) => i.id))
  return (
    <nav aria-label={title}>
      <div className="mb-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{title}</div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          className={cn(
            "block border-l-2 py-1.5 text-[13px] transition-colors",
            item.depth === 3 ? "pl-6" : "pl-3",
            active === item.id ? "border-primary text-foreground" : "border-border-subtle text-muted-foreground hover:text-foreground"
          )}
        >
          {item.title}
        </a>
      ))}
    </nav>
  )
}

export { DocsToc, type TocItem }
