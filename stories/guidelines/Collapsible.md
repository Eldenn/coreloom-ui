# Collapsible

An unstyled show / hide region with its trigger.

**The consumer provides** `<Collapsible open onOpenChange>` (or `defaultOpen`), a `<CollapsibleTrigger asChild>` around a control (usually a `ghost` icon Button with a chevron) and `<CollapsibleContent>` with what hides.

- No styling of its own: the trigger and content keep yours. Rotate the chevron 180° when open, over 180 ms.
- Radix sets `aria-expanded` and `aria-controls` on the trigger. Give an icon-only trigger an `aria-label`.
- For one section that expands in place (more variables, advanced options, a long log). For several sections where one opens at a time, use `Accordion`.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/collapsible` and import from `@/components/ui/collapsible`.
