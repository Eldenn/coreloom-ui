# @coreloom/comparison-table

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/comparison-table.tsx

```ts
type ComparisonFeature = {}
ComparisonFeature.id: string
ComparisonFeature.name: React.ReactNode
ComparisonFeature.description?: React.ReactNode
ComparisonFeature.values: Record<string, ComparisonValue>
type ComparisonGroup = {}
ComparisonGroup.id: string
ComparisonGroup.name: React.ReactNode
ComparisonGroup.features: ComparisonFeature[]
type ComparisonPlan = {}
ComparisonPlan.id: string
ComparisonPlan.name: string
ComparisonPlan.price?: React.ReactNode
ComparisonPlan.cta?: React.ReactNode
ComparisonPlan.featured?: boolean | undefined
ComparisonPlan.badge?: React.ReactNode
function ComparisonTable
ComparisonTable.plans: ComparisonPlan[]
ComparisonTable.groups: ComparisonGroup[]
ComparisonTable.caption?: string | undefined
ComparisonTable.onSelect?: ((plan: ComparisonPlan) => void) | undefined
ComparisonTable.onlyDifferences?: boolean | undefined
ComparisonTable.defaultOnlyDifferences?: boolean | undefined
ComparisonTable.onOnlyDifferencesChange?: ((value: boolean) => void) | undefined
ComparisonTable.className?: string | undefined
type ComparisonValue = string | number | boolean | null
function differingFeatures(groups: ComparisonGroup[], planIds: string[]) => { features: ComparisonFeature[]; id: string; name: React.ReactNode; }[]
```
