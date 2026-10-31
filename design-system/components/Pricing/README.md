# Pricing

Plan cards with a monthly / yearly switch, for a marketing page or an in-app upgrade screen.

**Install** `pnpm dlx shadcn@latest add @coreloom/pricing`. It writes `pricing.tsx`.

**The consumer provides** `<PricingPlans plans currency onSelect>`: each plan is `{ id, name, description?, monthly, yearly?, features, cta, featured?, badge? }` with prices per month as numbers (`monthly: null` shows "Custom"); `currency` is an ISO code (`"EUR"` default); `onSelect(plan, billing)` runs on the plan's button. `billing` / `defaultBilling` / `onBillingChange` control the switch.

- Prices are formatted by the locale ("€24", "24 €", "$19"); yearly shows the monthly equivalent and "€228 billed yearly". The switch shows the best saving ("Save 21%") when a plan has a lower `yearly`.
- The featured plan uses `Card`'s `accent` look, a "Most popular" badge and the primary button; the others use `secondary` buttons. Feature one plan at most.
- Three plans read best; keep features parallel across cards and the CTA a verb ("Start a 14-day trial").

_On `window.CoreloomUIDesignSystem_ff5f32` as `PricingPlans`._
