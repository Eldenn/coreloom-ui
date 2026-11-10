# @coreloom/pricing

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/pricing.tsx

```ts
type Billing = 'monthly' | 'yearly'
type PricingPlan = {}
PricingPlan.id: string
PricingPlan.name: string
PricingPlan.description?: React.ReactNode
PricingPlan.monthly: number | null
PricingPlan.yearly?: number | null | undefined
PricingPlan.features: React.ReactNode[]
PricingPlan.cta: React.ReactNode
PricingPlan.featured?: boolean | undefined
PricingPlan.badge?: React.ReactNode
function PricingPlans
PricingPlans.plans: PricingPlan[]
PricingPlans.currency?: string | undefined
PricingPlans.billing?: Billing | undefined
PricingPlans.defaultBilling?: Billing | undefined
PricingPlans.onBillingChange?: ((billing: Billing) => void) | undefined
PricingPlans.onSelect?: ((plan: PricingPlan, billing: Billing) => void) | undefined
PricingPlans.className?: string | undefined
```
