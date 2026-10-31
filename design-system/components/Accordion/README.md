# Accordion

Stacked sections that open one at a time, for FAQs and long settings.

**The consumer provides** `<Accordion type="single" collapsible>` (or `type="multiple"`), `defaultValue` / `value`, and `<AccordionItem value>`s each holding an `<AccordionTrigger>` (the question or section title) and `<AccordionContent>`.

- Items split by `border-subtle`; triggers 15px / 500 in `fg-1`, hover `accent-fg`; the chevron turns and takes `accent` when open; content 14px / 1.6 in `fg-2`. Opening animates its height over 180 ms, off under reduced motion.
- Radix gives the button / region roles and arrow-key movement between triggers.
- Use it when readers need one answer among many (FAQ, troubleshooting). Don't hide what most readers need — the first thing on a page belongs open, or out of an accordion.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/accordion` and import from `@/components/ui/accordion`._
