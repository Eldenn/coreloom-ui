'use client'

// Coreloom UI — Pricing (pricing block). Plan cards with a monthly / yearly switch. Prices are
// numbers; the currency and the locale format them ("€24", "24 €"). One plan can be featured.
import { CheckIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Billing = 'monthly' | 'yearly'

interface PricingPlan {
  id: string
  name: string
  description?: React.ReactNode
  /** Per month, billed monthly. `null` for "Custom" (contact sales). */
  monthly: number | null
  /** Per month, billed yearly. Defaults to `monthly`. */
  yearly?: number | null
  features: React.ReactNode[]
  cta: React.ReactNode
  /** Highlights the plan ("Most popular"). Feature one at most. */
  featured?: boolean
  /** Replaces the "Most popular" badge text. */
  badge?: React.ReactNode
}

function PricingPlans({
  plans,
  currency = 'EUR',
  billing: billingProp,
  defaultBilling = 'monthly',
  onBillingChange,
  onSelect,
  className,
}: {
  plans: PricingPlan[]
  /** ISO 4217 code: "EUR", "USD". */
  currency?: string
  billing?: Billing
  defaultBilling?: Billing
  onBillingChange?: (billing: Billing) => void
  /** Called with the plan and the billing period when its button is pressed. */
  onSelect?: (plan: PricingPlan, billing: Billing) => void
  className?: string
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.pricing
  const [inner, setInner] = React.useState<Billing>(defaultBilling)
  const billing = billingProp ?? inner
  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
    }).format(n)
  const percent = (n: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(n)

  // The best yearly saving across plans, for the switch's badge.
  const saving = Math.max(
    0,
    ...plans.map((p) =>
      p.monthly && p.yearly != null && p.yearly < p.monthly ? 1 - p.yearly / p.monthly : 0,
    ),
  )

  return (
    <div data-slot="pricing" className={cn('flex w-full flex-col items-center gap-8', className)}>
      <div className="flex items-center gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          value={billing}
          onValueChange={(v) => {
            if (!v) return
            setInner(v as Billing)
            onBillingChange?.(v as Billing)
          }}
          aria-label={t.billing}
        >
          <ToggleGroupItem value="monthly" className="px-4">
            {t.monthly}
          </ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="px-4">
            {t.yearly}
          </ToggleGroupItem>
        </ToggleGroup>
        {saving > 0 && <Badge variant="success">{t.save(percent(saving))}</Badge>}
      </div>
      <div
        className={cn(
          'grid w-full gap-5',
          plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
          plans.length >= 4 && 'xl:grid-cols-4',
        )}
      >
        {plans.map((plan) => {
          const perMonth =
            billing === 'yearly'
              ? plan.yearly === undefined
                ? plan.monthly
                : plan.yearly
              : plan.monthly
          return (
            <Card
              key={plan.id}
              accent={plan.featured}
              className={cn('relative gap-5', plan.featured && 'md:-my-2 md:py-8')}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-[18px]">{plan.name}</CardTitle>
                  {plan.featured && <Badge variant="default">{plan.badge ?? t.popular}</Badge>}
                </div>
                {plan.description && <CardDescription>{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[36px] leading-none font-semibold tracking-[-0.02em] text-foreground tabular-nums">
                      {perMonth === null ? t.custom : money(perMonth)}
                    </span>
                    {perMonth !== null && perMonth > 0 && (
                      <span className="text-[14px] text-muted-foreground">{t.perMonth}</span>
                    )}
                  </div>
                  <span className="min-h-5 text-[13px] text-muted-foreground">
                    {billing === 'yearly' && perMonth ? t.billedYearly(money(perMonth * 12)) : ' '}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[14px] leading-snug text-fg-secondary">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary-text" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  className="w-full"
                  variant={plan.featured ? 'default' : 'secondary'}
                  onClick={() => onSelect?.(plan, billing)}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export { type Billing, type PricingPlan, PricingPlans }
