'use client'

// Coreloom UI — QueryBuilder. A filter written as conditions in groups: each group matches all or
// any of its rules, and a group can hold groups ("Status is Active and (Plan is Pro or Seats is
// more than 10)"). For the few filters most people set, FilterBar is lighter; FilterBar opens a
// QueryBuilder for a nested group. Run the result with `matchesFilter` from "@/lib/filter".
import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { CombinatorSelect, FilterConditionEditor } from '@/components/ui/filter-condition'
import {
  emptyFilter,
  type FilterField,
  type FilterGroup,
  filterId,
  newCondition,
  removeRule,
  updateRule,
} from '@/lib/filter'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface GroupProps<T> {
  group: FilterGroup
  fields: FilterField<T>[]
  depth: number
  maxDepth: number
  label?: string
  onChange: (group: FilterGroup) => void
  /** Removes this group (not given for the top one). */
  onRemove?: () => void
  /** Focuses something in the builder once the change is on screen. */
  focusAfter: (change: () => void, selector: string) => void
}

function GroupEditor<T>({
  group,
  fields,
  depth,
  maxDepth,
  label,
  onChange,
  onRemove,
  focusAfter,
}: GroupProps<T>) {
  const t = useCoreloomI18n().messages.filterBar
  const combinatorLabel = group.combinator === 'and' ? t.matchAll : t.matchAny
  const first = fields.at(0)

  const addCondition = () => {
    if (!first) return
    const condition = newCondition(first)
    focusAfter(() => {
      onChange({ ...group, rules: [...group.rules, condition] })
    }, `[data-rule-id="${condition.id}"] button`)
  }
  const addGroup = () => {
    const child: FilterGroup = { kind: 'group', id: filterId(), combinator: 'and', rules: [] }
    const condition = first ? newCondition(first) : null
    if (condition) child.rules.push(condition)
    focusAfter(
      () => {
        onChange({ ...group, rules: [...group.rules, child] })
      },
      condition ? `[data-rule-id="${condition.id}"] button` : `[data-add-to="${child.id}"]`,
    )
  }
  const remove = (id: string) => {
    const index = group.rules.findIndex((r) => r.id === id)
    const next = group.rules.at(index + 1) ?? (index > 0 ? group.rules.at(index - 1) : undefined)
    focusAfter(
      () => {
        onChange(removeRule(group, id))
      },
      next ? `[data-rule-id="${next.id}"] button` : `[data-add-to="${group.id}"]`,
    )
  }

  return (
    <div
      role="group"
      aria-label={label ?? t.groupLabel(combinatorLabel)}
      data-filter-group={group.id}
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border p-3',
        depth === 0 ? 'border-border bg-card' : 'border-border-subtle bg-inset',
      )}
    >
      <div className="flex items-center gap-2">
        <CombinatorSelect
          className="min-w-36"
          value={group.combinator}
          onValueChange={(combinator) => {
            onChange({ ...group, combinator })
          }}
        />
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label={t.removeGroup}
            onClick={onRemove}
          >
            <Trash2Icon aria-hidden />
          </Button>
        )}
      </div>

      {group.rules.length === 0 && <p className="text-[13px] text-muted-foreground">{t.empty}</p>}
      {group.rules.map((rule, i) => (
        <div key={rule.id} data-rule-id={rule.id} className="flex min-w-0 flex-col gap-1">
          {i > 0 && (
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {group.combinator === 'and' ? t.and : t.or}
            </span>
          )}
          {rule.kind === 'group' ? (
            <GroupEditor
              group={rule}
              fields={fields}
              depth={depth + 1}
              maxDepth={maxDepth}
              onChange={(next) => {
                onChange(updateRule(group, rule.id, () => next))
              }}
              onRemove={() => {
                remove(rule.id)
              }}
              focusAfter={focusAfter}
            />
          ) : (
            <div className="flex min-w-0 items-start gap-2">
              <FilterConditionEditor
                layout="row"
                className="min-w-0 flex-1"
                fields={fields}
                condition={rule}
                onConditionChange={(next) => {
                  onChange(updateRule(group, rule.id, () => next))
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t.removeCondition}
                onClick={() => {
                  remove(rule.id)
                }}
              >
                <XIcon aria-hidden />
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          data-add-to={group.id}
          disabled={!first}
          onClick={addCondition}
        >
          <PlusIcon aria-hidden />
          {t.addCondition}
        </Button>
        {depth + 1 < maxDepth && (
          <Button variant="ghost" size="sm" disabled={!first} onClick={addGroup}>
            <PlusIcon aria-hidden />
            {t.addGroup}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * The filter as nested groups of conditions. Controlled with `value` + `onValueChange`, or
 * uncontrolled from `defaultValue` (an empty AND group when left out).
 */
function QueryBuilder<T>({
  fields,
  value,
  defaultValue,
  onValueChange,
  maxDepth = 3,
  className,
  'aria-label': ariaLabel,
}: {
  fields: FilterField<T>[]
  value?: FilterGroup
  defaultValue?: FilterGroup
  onValueChange?: (value: FilterGroup) => void
  /** How deep groups go, the top group counting as 1 (default 3). At the limit, no "Add group". */
  maxDepth?: number
  className?: string
  /** Name of the whole builder; defaults to "Filters". */
  'aria-label'?: string
}) {
  const t = useCoreloomI18n().messages.filterBar
  const [inner, setInner] = React.useState<FilterGroup>(() => defaultValue ?? emptyFilter())
  const current = value ?? inner
  const rootRef = React.useRef<HTMLDivElement>(null)

  const commit = (next: FilterGroup) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  // A rule that appears or disappears takes focus with it: once the change is on screen, move focus
  // to what replaces it, so it never falls back to <body>.
  const focusAfter = (change: () => void, selector: string) => {
    change()
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(selector)?.focus())
  }

  return (
    <div ref={rootRef} className={cn('min-w-0', className)}>
      <GroupEditor
        group={current}
        fields={fields}
        depth={0}
        maxDepth={maxDepth}
        label={ariaLabel ?? t.label}
        onChange={commit}
        focusAfter={focusAfter}
      />
    </div>
  )
}

export { QueryBuilder }
