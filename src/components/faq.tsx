// Coreloom UI — Faq (marketing block). Questions in an Accordion, the first one open.
import * as React from "react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

function Faq({
  title = "Questions",
  items,
  className,
}: {
  title?: React.ReactNode
  items: { question: string; answer: React.ReactNode }[]
  className?: string
}) {
  return (
    <section className={cn("border-t border-border-subtle px-5 py-20", className)}>
      <div className="mx-auto max-w-[720px]">
        <h2 className="mt-0 mb-6 text-center font-display text-[28px] font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        <Accordion type="single" collapsible defaultValue="faq-0">
          {items.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export { Faq }
