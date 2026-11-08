'use client'

// Coreloom UI — FilterBar. The filters of a list or a table as chips above it: "Add filter" picks a
// field, each chip opens to edit its operator and value, × removes it. Saved views switch between
// prepared filters. The filter is a value (see "@/lib/filter"): run it on your rows with
// `matchesFilter`, send it to your API, or keep it in the URL with `filterToSearchParams`.
//
//   const [filter, setFilter] = React.useState(emptyFilter)
//   <FilterBar fields={fields} value={filter} onValueChange={setFilter} resultCount={rows.length} />
import { ListFilterIcon, PlusIcon, XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  CombinatorSelect,
  describeCondition,
  FilterConditionEditor,
} from '@/components/ui/filter-condition'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QueryBuilder } from '@/components/ui/query-builder'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  countConditions,
  emptyFilter,
  type FilterCondition,
  type FilterField,
  type FilterGroup,
  filterId,
  filterToSearchParams,
  isConditionComplete,
  newCondition,
  removeRule,
  updateRule,
} from '@/lib/filter'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** A named filter to switch to, such as "My open tickets". */
interface FilterView {
  id: string
  label: string
  filter: FilterGroup
}

const chip =
  'inline-flex h-8 max-w-full min-w-0 items-center rounded-md border text-[13px] text-foreground'
const chipButton =
  'flex h-full min-w-0 cursor-pointer items-center gap-1.5 rounded-l-md px-2.5 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring'

function ConditionChip<T>({
  condition,
  fields,
  open,
  onOpenChange,
  onChange,
  onRemove,
}: {
  condition: FilterCondition
  fields: FilterField<T>[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (condition: FilterCondition) => void
  onRemove: () => void
}) {
  const { messages, locale } = useCoreloomI18n()
  const t = messages.filterBar
  const field = fields.find((f) => f.id === condition.field)
  const complete = isConditionComplete(condition, fields)
  const text = field ? describeCondition(condition, field, { locale, t }) : condition.field
  return (
    <span
      className={cn(
        chip,
        complete ? 'border-border bg-card' : 'border-dashed border-border-strong',
      )}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          data-filter-chip={condition.id}
          aria-label={t.edit(text)}
          className={chipButton}
        >
          <span className="truncate">{text}</span>
          {!complete && <span className="shrink-0 text-fg-secondary">· {t.needsValue}</span>}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))]">
          <FilterConditionEditor
            fields={fields}
            condition={condition}
            onConditionChange={onChange}
            autoFocus
          />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onOpenChange(false)
              }}
            >
              {t.done}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <RemoveButton label={t.remove(text)} onRemove={onRemove} />
    </span>
  )
}

function RemoveButton({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onRemove}
      className="flex h-full w-7 shrink-0 cursor-pointer items-center justify-center rounded-r-md border-l border-border-subtle text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <XIcon className="size-3.5" aria-hidden />
    </button>
  )
}

function GroupChip<T>({
  group,
  fields,
  open,
  onOpenChange,
  onChange,
  onRemove,
}: {
  group: FilterGroup
  fields: FilterField<T>[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (group: FilterGroup) => void
  onRemove: () => void
}) {
  const t = useCoreloomI18n().messages.filterBar
  const text = t.group(countConditions(group, fields))
  return (
    <span className={cn(chip, 'border-border bg-card')}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          data-filter-chip={group.id}
          aria-label={t.edit(text)}
          className={chipButton}
        >
          <ListFilterIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{text}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(40rem,calc(100vw-2rem))] p-2">
          <QueryBuilder fields={fields} value={group} onValueChange={onChange} maxDepth={2} />
        </PopoverContent>
      </Popover>
      <RemoveButton label={t.remove(text)} onRemove={onRemove} />
    </span>
  )
}

function AddFilter<T>({
  fields,
  onAdd,
  triggerRef,
}: {
  fields: FilterField<T>[]
  onAdd: (field: FilterField<T>) => void
  triggerRef: React.Ref<HTMLButtonElement>
}) {
  const t = useCoreloomI18n().messages.filterBar
  const [open, setOpen] = React.useState(false)
  const picked = React.useRef(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button ref={triggerRef} variant="ghost" size="sm" data-filter-add="">
          <PlusIcon aria-hidden />
          {t.add}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-60 p-0"
        onCloseAutoFocus={(e) => {
          // The new chip's popover takes focus; don't pull it back to this button.
          if (picked.current) e.preventDefault()
          picked.current = false
        }}
      >
        <Command>
          <CommandInput placeholder={t.searchFields} />
          <CommandList>
            <CommandEmpty>{t.noFields}</CommandEmpty>
            <CommandGroup>
              {fields.map((field) => (
                <CommandItem
                  key={field.id}
                  value={`${field.label} ${field.id}`}
                  onSelect={() => {
                    picked.current = true
                    setOpen(false)
                    onAdd(field)
                  }}
                >
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ViewSelect<T>({
  views,
  filter,
  fields,
  onPick,
}: {
  views: FilterView[]
  filter: FilterGroup
  fields: FilterField<T>[]
  onPick: (view: FilterView) => void
}) {
  const t = useCoreloomI18n().messages.filterBar
  const key = (g: FilterGroup) => filterToSearchParams(g, fields).toString()
  const current = views.find((v) => key(v.filter) === key(filter))
  return (
    <Select
      value={current?.id ?? ''}
      onValueChange={(id) => {
        const view = views.find((v) => v.id === id)
        if (view) onPick(view)
      }}
    >
      <SelectTrigger size="sm" aria-label={t.view} className="w-auto max-w-56 min-w-32">
        <SelectValue placeholder={t.customView} />
      </SelectTrigger>
      <SelectContent>
        {views.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            {v.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * The filter's top-level rules as chips, with "Add filter", "Clear filters", an optional view picker
 * and result count. A nested group shows as one chip that opens a QueryBuilder.
 */
function FilterBar<T>({
  fields,
  value,
  defaultValue,
  onValueChange,
  views,
  onSaveView,
  resultCount,
  className,
  'aria-label': ariaLabel,
}: {
  fields: FilterField<T>[]
  value?: FilterGroup
  defaultValue?: FilterGroup
  onValueChange?: (value: FilterGroup) => void
  /** Saved filters to switch between; the picker shows "Custom" when the filter matches none. */
  views?: FilterView[]
  /** Shows "Save view" while the filter matches no view; the app asks for a name and stores it. */
  onSaveView?: (filter: FilterGroup) => void
  /** How many rows pass, shown at the end and announced politely when it changes. */
  resultCount?: number
  className?: string
  /** Name of the toolbar; defaults to "Filters". */
  'aria-label'?: string
}) {
  const { messages, formatNumber } = useCoreloomI18n()
  const t = messages.filterBar
  const [inner, setInner] = React.useState<FilterGroup>(() => defaultValue ?? emptyFilter())
  const current = value ?? inner
  const [openId, setOpenId] = React.useState<string | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const addRef = React.useRef<HTMLButtonElement>(null)

  const commit = (next: FilterGroup) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  const add = (field: FilterField<T>) => {
    const condition = newCondition(field)
    commit({ ...current, rules: [...current.rules, condition] })
    setOpenId(condition.id)
  }
  // The chip that had focus goes away: once it has, focus its neighbour (or "Add filter").
  const remove = (id: string) => {
    const index = current.rules.findIndex((r) => r.id === id)
    const neighbour =
      current.rules.at(index + 1) ?? (index > 0 ? current.rules.at(index - 1) : null)
    commit(removeRule(current, id))
    requestAnimationFrame(() => {
      const next = neighbour
        ? rootRef.current?.querySelector<HTMLElement>(`[data-filter-chip="${neighbour.id}"]`)
        : null
      ;(next ?? addRef.current)?.focus()
    })
  }
  const clear = () => {
    commit({ ...current, rules: [] })
    requestAnimationFrame(() => addRef.current?.focus())
  }
  const change = (id: string, next: FilterCondition | FilterGroup) => {
    commit(updateRule(current, id, () => next))
  }
  const toggle = (id: string) => (open: boolean) => {
    setOpenId(open ? id : null)
  }

  const viewKey = (g: FilterGroup) => filterToSearchParams(g, fields).toString()
  const matchesView = views?.some((v) => viewKey(v.filter) === viewKey(current)) ?? false
  const canSave = onSaveView && countConditions(current, fields) > 0 && !matchesView

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel ?? t.label}
      className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}
    >
      {views && views.length > 0 && (
        <ViewSelect
          views={views}
          filter={current}
          fields={fields}
          onPick={(view) => {
            commit({ ...view.filter, id: filterId() })
          }}
        />
      )}
      {current.rules.length > 1 && (
        <CombinatorSelect
          value={current.combinator}
          onValueChange={(combinator) => {
            commit({ ...current, combinator })
          }}
        />
      )}
      {current.rules.map((rule) =>
        rule.kind === 'group' ? (
          <GroupChip
            key={rule.id}
            group={rule}
            fields={fields}
            open={openId === rule.id}
            onOpenChange={toggle(rule.id)}
            onChange={(next) => {
              change(rule.id, next)
            }}
            onRemove={() => {
              remove(rule.id)
            }}
          />
        ) : (
          <ConditionChip
            key={rule.id}
            condition={rule}
            fields={fields}
            open={openId === rule.id}
            onOpenChange={toggle(rule.id)}
            onChange={(next) => {
              change(rule.id, next)
            }}
            onRemove={() => {
              remove(rule.id)
            }}
          />
        ),
      )}
      <AddFilter fields={fields} onAdd={add} triggerRef={addRef} />
      {current.rules.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clear}>
          {t.clear}
        </Button>
      )}
      {canSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSaveView(current)
          }}
        >
          {t.saveView}
        </Button>
      )}
      {resultCount !== undefined && (
        <p
          aria-live="polite"
          className="ms-auto font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {t.results(formatNumber(resultCount), resultCount)}
        </p>
      )}
    </div>
  )
}

export { FilterBar, type FilterView }
