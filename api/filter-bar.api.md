# @coreloom/filter-bar

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/filter-bar.tsx

```ts
function FilterBar
FilterBar.fields: FilterField<T>[]
FilterBar.value?: FilterGroup | undefined
FilterBar.defaultValue?: FilterGroup | undefined
FilterBar.onValueChange?: ((value: FilterGroup) => void) | undefined
FilterBar.views?: FilterView[] | undefined
FilterBar.onSaveView?: ((filter: FilterGroup) => void) | undefined
FilterBar.resultCount?: number | undefined
FilterBar.className?: string | undefined
FilterBar.aria-label?: string | undefined
type FilterView = {}
FilterView.id: string
FilterView.label: string
FilterView.filter: FilterGroup
```

## src/components/ui/filter-condition.tsx

```ts
function CombinatorSelect
CombinatorSelect.value: 'and' | 'or'
CombinatorSelect.onValueChange: (value: 'and' | 'or') => void
CombinatorSelect.className?: string | undefined
function describeCondition<T>(condition: FilterCondition, field: FilterField<T>, { locale, t }: Formatters) => string
function FilterConditionEditor
FilterConditionEditor.fields: FilterField<T>[]
FilterConditionEditor.condition: FilterCondition
FilterConditionEditor.onConditionChange: (condition: FilterCondition) => void
FilterConditionEditor.layout?: 'row' | 'stack' | undefined
FilterConditionEditor.autoFocus?: boolean | undefined
FilterConditionEditor.className?: string | undefined
```

## src/components/ui/query-builder.tsx

```ts
function QueryBuilder
QueryBuilder.fields: FilterField<T>[]
QueryBuilder.value?: FilterGroup | undefined
QueryBuilder.defaultValue?: FilterGroup | undefined
QueryBuilder.onValueChange?: ((value: FilterGroup) => void) | undefined
QueryBuilder.maxDepth?: number | undefined
QueryBuilder.className?: string | undefined
QueryBuilder.aria-label?: string | undefined
```

## src/lib/filter.ts

```ts
function addRule(filter: FilterGroup, groupId: string, rule: FilterRule) => FilterGroup
function countConditions<T>(filter: FilterGroup, fields: FilterField<T>[]) => number
function emptyFilter() => FilterGroup
type FilterCondition = {}
FilterCondition.kind: 'condition'
FilterCondition.id: string
FilterCondition.field: string
FilterCondition.operator: FilterOperator
FilterCondition.value: FilterValue
type FilterField<T = Record<string, unknown>> = {}
FilterField.id: string
FilterField.label: string
FilterField.type: FilterFieldType
FilterField.options?: FilterOption[] | undefined
FilterField.get?: ((row: T) => unknown) | undefined
type FilterFieldType = 'number' | 'boolean' | 'text' | 'select' | 'multiselect' | 'date'
type FilterGroup = {}
FilterGroup.kind: 'group'
FilterGroup.id: string
FilterGroup.combinator: 'and' | 'or'
FilterGroup.rules: FilterRule[]
function filterId() => string
type FilterOperator = 'is' | 'contains' | 'notContains' | 'startsWith' | 'gt' | 'lt' | 'isEmpty' | 'isNotEmpty' | 'before' | 'after' | 'isNot' | 'gte' | 'lte' | 'between' | 'anyOf' | 'noneOf' | 'allOf' | 'isTrue' | 'isFalse'
type FilterOption = {}
FilterOption.value: string
FilterOption.label: string
type FilterRange = {}
FilterRange.from: string | number | null
FilterRange.to: string | number | null
type FilterRule = FilterCondition | FilterGroup
function filterToSearchParams<T>(filter: FilterGroup, fields: FilterField<T>[], { params, key }?: { params?: URLSearchParams | string; key?: string; }) => URLSearchParams
type FilterValue = string | number | string[] | FilterRange | null
type FilterValueKind = 'number' | 'text' | 'date' | 'none' | 'option' | 'dateRange' | 'numberRange' | 'options'
function isConditionComplete<T>(condition: FilterCondition, fields: FilterField<T>[]) => boolean
function matchesFilter<T>(row: T, filter: FilterGroup, fields: FilterField<T>[]) => boolean
function newCondition<T>(field: FilterField<T>) => FilterCondition
function operatorsFor(type: FilterFieldType) => FilterOperator[]
function parseFilterSearchParams<T>(params: URLSearchParams | string, fields: FilterField<T>[], { key }?: { key?: string; }) => FilterGroup
function removeRule(filter: FilterGroup, id: string) => FilterGroup
function toDay(date: Date) => string
function updateRule(filter: FilterGroup, id: string, update: (rule: FilterRule) => FilterRule | null) => FilterGroup
function valueForOperator(type: FilterFieldType, operator: FilterOperator, value: FilterValue) => FilterValue
function valueKind(type: FilterFieldType, operator: FilterOperator) => FilterValueKind
```
