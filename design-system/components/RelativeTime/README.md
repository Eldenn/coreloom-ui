# RelativeTime

A date said the way people say it: "5 minutes ago", "yesterday", "in 3 days". For a comment, a last sign-in, a sync, a deadline.

**The consumer provides** `date` (a Date, an ISO string or a timestamp), and optionally `style` (`long`, `short`, `narrow`), `now` (the moment to count from, which freezes the wording) and `live` (true by default). `formatRelative(date, locale, now?, style?)` gives the same words as a string.

- It renders a `<time datetime>` with the full date and time in its tooltip, so the exact moment is one hover away and machines read it.
- It keeps itself current: every 15 seconds within the first minute, then less often as the date gets further away. Under 45 seconds it says "now".
- The words come from the browser (Intl.RelativeTimeFormat) in the provider's locale: "il y a 5 minutes", "vor 5 Minuten", "hace 5 minutos".
- Use an exact date when people compare or cite times (an invoice, an audit log), or beyond a few weeks, where "3 months ago" says too little.

_On `window.CoreloomUIDesignSystem_ff5f32`; in an app, `pnpm dlx shadcn@latest add @coreloom/relative-time` and import from `@/components/ui/relative-time`._
