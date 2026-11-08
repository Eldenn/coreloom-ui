'use client'

// Coreloom UI — Comparison table (comparison-table block). Plans side by side, feature by feature,
// under a header that stays in view while the page scrolls: a tick, a dash, "Partial" or a value
// ("10 GB") in each cell, always with words for screen readers. "Only differences" hides the rows
// where every plan is the same; on phones one plan shows at a time, picked above the table.
import { CheckIcon, CircleDashedIcon, MinusIcon } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Switch } from '@/components/ui/switch'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** true: included. false or null: not included. "partial": partly. Any other string or a number: the value. */
type ComparisonValue = boolean | string | number | null

interface ComparisonPlan {
  id: string
  name: string
  /** Under the name: "€24 / month". */
  price?: React.ReactNode
  /** The button's text; the button shows when `onSelect` is set. */
  cta?: React.ReactNode
  /** Highlights the column ("Most popular"). Feature one at most. */
  featured?: boolean
  /** Replaces the "Most popular" badge text. */
  badge?: React.ReactNode
}

interface ComparisonFeature {
  id: string
  name: React.ReactNode
  /** A line under the name that explains it. */
  description?: React.ReactNode
  /** One value per plan id; a missing plan reads as not included. */
  values: Record<string, ComparisonValue>
}

interface ComparisonGroup {
  id: string
  name: React.ReactNode
  features: ComparisonFeature[]
}

/** Whether a feature's value differs from one plan to another (missing counts as not included). */
function featureDiffers(feature: ComparisonFeature, planIds: string[]) {
  const norm = (v: ComparisonValue | undefined) => v ?? false
  return new Set(planIds.map((id) => norm(feature.values[id]))).size > 1
}

/** The groups with only the features that differ between the plans; empty groups are dropped. */
function differingFeatures(groups: ComparisonGroup[], planIds: string[]) {
  return groups
    .map((g) => ({ ...g, features: g.features.filter((f) => featureDiffers(f, planIds)) }))
    .filter((g) => g.features.length > 0)
}

function Cell({ value }: { value: ComparisonValue | undefined }) {
  const t = useCoreloomI18n().messages.comparison
  if (value === true)
    return (
      <>
        <CheckIcon aria-hidden className="mx-auto size-[18px] text-primary-text" />
        <span className="sr-only">{t.included}</span>
      </>
    )
  if (value === 'partial')
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-fg-secondary">
        <CircleDashedIcon aria-hidden className="size-4" />
        {t.partial}
      </span>
    )
  if (value === false || value === null || value === undefined)
    return (
      <>
        <MinusIcon aria-hidden className="mx-auto size-4 text-muted-foreground" />
        <span className="sr-only">{t.notIncluded}</span>
      </>
    )
  return <span className="text-[13.5px] text-foreground tabular-nums">{value}</span>
}

function PlanHeader({
  plan,
  onSelect,
}: {
  plan: ComparisonPlan
  onSelect?: (plan: ComparisonPlan) => void
}) {
  const t = useCoreloomI18n().messages.comparison
  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <span className="flex flex-wrap items-center justify-center gap-2">
        <span className="font-display text-[16px] font-semibold text-foreground">{plan.name}</span>
        {plan.featured && <Badge>{plan.badge ?? t.popular}</Badge>}
      </span>
      {!!plan.price && (
        <span className="text-[13px] font-normal text-muted-foreground">{plan.price}</span>
      )}
      {!!onSelect && (
        <Button
          size="sm"
          variant={plan.featured ? 'default' : 'secondary'}
          className="mt-1 w-full max-w-40"
          onClick={() => {
            onSelect(plan)
          }}
        >
          {plan.cta ?? t.choose(plan.name)}
        </Button>
      )}
    </div>
  )
}

function ComparisonTable({
  plans,
  groups,
  caption,
  onSelect,
  onlyDifferences: onlyDifferencesProp,
  defaultOnlyDifferences = false,
  onOnlyDifferencesChange,
  className,
}: {
  plans: ComparisonPlan[]
  groups: ComparisonGroup[]
  /** The table's name, read by screen readers (visually hidden). Default "Compare plans". */
  caption?: string
  /** Shows a button under each plan's name. */
  onSelect?: (plan: ComparisonPlan) => void
  /** Hides the rows where every plan is the same. */
  onlyDifferences?: boolean
  defaultOnlyDifferences?: boolean
  onOnlyDifferencesChange?: (value: boolean) => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.comparison
  const switchId = React.useId()
  const [innerOnly, setInnerOnly] = React.useState(defaultOnlyDifferences)
  const onlyDifferences = onlyDifferencesProp ?? innerOnly
  // On phones one plan column shows at a time: the featured one first.
  const [mobilePlan, setMobilePlan] = React.useState(
    () => (plans.find((p) => p.featured) ?? plans.at(0))?.id ?? '',
  )
  const planIds = plans.map((p) => p.id)
  const shown = onlyDifferences ? differingFeatures(groups, planIds) : groups
  const hiddenOnPhone = (id: string) => (id === mobilePlan ? '' : 'max-md:hidden')

  return (
    <div data-slot="comparison-table" className={cn('flex w-full flex-col gap-4', className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        {plans.length > 1 && (
          <SegmentedControl
            className="md:hidden"
            fullWidth
            aria-label={t.showPlan}
            value={mobilePlan}
            onValueChange={setMobilePlan}
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
          />
        )}
        <div className="flex items-center gap-2.5">
          <Switch
            id={switchId}
            checked={onlyDifferences}
            onCheckedChange={(v) => {
              setInnerOnly(v)
              onOnlyDifferencesChange?.(v)
            }}
          />
          <label htmlFor={switchId} className="text-[13px] text-fg-secondary">
            {t.onlyDifferences}
          </label>
        </div>
      </div>
      <table className="w-full border-separate border-spacing-0 text-start">
        <caption className="sr-only">{caption ?? t.caption}</caption>
        <thead>
          <tr>
            <td className="sticky top-0 z-(--z-sticky) border-b border-border bg-background" />
            {plans.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                className={cn(
                  'sticky top-0 z-(--z-sticky) w-[22%] border-b border-border bg-background px-3 pt-2 pb-4 align-bottom',
                  plan.featured && 'border-t-2 border-t-primary',
                  hiddenOnPhone(plan.id),
                )}
              >
                <PlanHeader plan={plan} onSelect={onSelect} />
              </th>
            ))}
          </tr>
        </thead>
        {shown.map((group) => (
          <tbody key={group.id}>
            <tr>
              <th
                scope="colgroup"
                colSpan={plans.length + 1}
                className="border-b border-border-subtle px-3 pt-7 pb-2 text-start font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
              >
                {group.name}
              </th>
            </tr>
            {group.features.map((feature) => (
              <tr key={feature.id}>
                <th
                  scope="row"
                  className="border-b border-border-subtle px-3 py-3 text-start align-middle font-normal"
                >
                  <span className="block text-[14px] text-foreground">{feature.name}</span>
                  {!!feature.description && (
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                      {feature.description}
                    </span>
                  )}
                </th>
                {plans.map((plan) => (
                  <td
                    key={plan.id}
                    className={cn(
                      'border-b border-border-subtle px-3 py-3 text-center align-middle',
                      plan.featured && 'bg-inset',
                      hiddenOnPhone(plan.id),
                    )}
                  >
                    <Cell value={feature.values[plan.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      {shown.length === 0 && (
        <p className="m-0 py-6 text-center text-[13.5px] text-muted-foreground">
          {t.noDifferences}
        </p>
      )}
    </div>
  )
}

export {
  type ComparisonFeature,
  type ComparisonGroup,
  type ComparisonPlan,
  ComparisonTable,
  type ComparisonValue,
  differingFeatures,
}
