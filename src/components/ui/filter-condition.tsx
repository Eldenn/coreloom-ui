'use client'

// Coreloom UI — FilterConditionEditor. The three controls of one filter condition: the field, the
// operator its type takes, and a value editor that fits both (text, number, date, a range, one or
// several options, or nothing for "is empty"). FilterBar shows it in a popover, QueryBuilder in a
// row. `describeCondition` writes the same condition as one line ("Status is any of Active, Paused").
import * as React from 'react'

import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type FilterCondition,
  type FilterField,
  type FilterOperator,
  type FilterRange,
  type FilterValue,
  operatorsFor,
  toDay,
  valueForOperator,
  valueKind,
} from '@/lib/filter'
import { type Messages, useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type FilterMessages = Messages['filterBar']

/** "2026-10-14" as a local Date (midnight), or undefined. */
function fromDay(day: unknown): Date | undefined {
  if (typeof day !== 'string') return undefined
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function rangeOf(value: FilterValue): FilterRange {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : { from: null, to: null }
}

interface Formatters {
  locale: string
  t: FilterMessages
}

function formatEnd(end: number | string | null, kind: 'number' | 'date', { locale }: Formatters) {
  if (end === null) return ''
  if (kind === 'number' && typeof end === 'number') return new Intl.NumberFormat(locale).format(end)
  const date = fromDay(end)
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date) : ''
}

function formatRange(value: FilterValue, kind: 'number' | 'date', f: Formatters) {
  const { from, to } = rangeOf(value)
  const a = formatEnd(from, kind, f)
  const b = formatEnd(to, kind, f)
  if (a && b) return f.t.range(a, b)
  return a ? f.t.atLeast(a) : f.t.atMost(b)
}

function formatOptions(value: FilterValue, field: FilterField<never>, f: Formatters, max = 2) {
  let list: string[] = []
  if (Array.isArray(value)) list = value
  else if (typeof value === 'string') list = [value]
  const labels = list.map((v) => field.options?.find((o) => o.value === v)?.label ?? v)
  const shown = labels.slice(0, max)
  const text = new Intl.ListFormat(f.locale, { type: 'disjunction' }).format(shown)
  return labels.length > max ? `${text} ${f.t.more(labels.length - max)}` : text
}

/** The value of a condition as words, in the i18n locale ("" when it has none). */
function describeValue(condition: FilterCondition, field: FilterField<never>, f: Formatters) {
  const { value } = condition
  if (value === null) return ''
  switch (valueKind(field.type, condition.operator)) {
    case 'text':
      return typeof value === 'string' ? `“${value}”` : ''
    case 'number':
      return typeof value === 'number' ? new Intl.NumberFormat(f.locale).format(value) : ''
    case 'date':
      return formatEnd(typeof value === 'string' ? value : null, 'date', f)
    case 'numberRange':
      return formatRange(value, 'number', f)
    case 'dateRange':
      return formatRange(value, 'date', f)
    case 'option':
    case 'options':
      return formatOptions(value, field, f)
    case 'none':
      return ''
  }
}

/** One condition as a line: "Status is any of Active, Paused", "Amount is between 10 and 50". */
function describeCondition<T>(
  condition: FilterCondition,
  field: FilterField<T>,
  { locale, t }: Formatters,
): string {
  // The value formatters only read the field's label and options, never `get`.
  const plain: FilterField<never> = { id: field.id, label: field.label, type: field.type }
  if (field.options) plain.options = field.options
  const value = describeValue(condition, plain, { locale, t })
  return t.summary(field.label, t.operators[condition.operator], value)
}

function NumberRangeEditor({
  value,
  onChange,
  t,
}: {
  value: FilterValue
  onChange: (value: FilterRange) => void
  t: FilterMessages
}) {
  const range = rangeOf(value)
  const num = (v: number | string | null) => (typeof v === 'number' ? v : null)
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput
        aria-label={t.from}
        stepper="none"
        value={num(range.from)}
        onValueChange={(from) => {
          onChange({ ...range, from })
        }}
      />
      <NumberInput
        aria-label={t.to}
        stepper="none"
        value={num(range.to)}
        onValueChange={(to) => {
          onChange({ ...range, to })
        }}
      />
    </div>
  )
}

function DateRangeEditor({
  value,
  onChange,
  t,
}: {
  value: FilterValue
  onChange: (value: FilterRange) => void
  t: FilterMessages
}) {
  const range = rangeOf(value)
  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker
        aria-label={t.from}
        placeholder={t.from}
        formatString="PP"
        value={fromDay(range.from)}
        onValueChange={(date) => {
          onChange({ ...range, from: date ? toDay(date) : null })
        }}
      />
      <DatePicker
        aria-label={t.to}
        placeholder={t.to}
        formatString="PP"
        value={fromDay(range.to)}
        onValueChange={(date) => {
          onChange({ ...range, to: date ? toDay(date) : null })
        }}
      />
    </div>
  )
}

function ValueEditor<T>({
  field,
  condition,
  onValueChange,
  autoFocus,
  t,
}: {
  field: FilterField<T>
  condition: FilterCondition
  onValueChange: (value: FilterValue) => void
  autoFocus?: boolean
  t: FilterMessages
}) {
  const { value } = condition
  const options = field.options ?? []
  switch (valueKind(field.type, condition.operator)) {
    case 'none':
      return null
    case 'text':
      return (
        <Input
          aria-label={t.value}
          autoFocus={autoFocus}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => {
            onValueChange(e.target.value)
          }}
        />
      )
    case 'number':
      return (
        <NumberInput
          aria-label={t.value}
          value={typeof value === 'number' ? value : null}
          onValueChange={onValueChange}
        />
      )
    case 'numberRange':
      return <NumberRangeEditor value={value} onChange={onValueChange} t={t} />
    case 'date':
      return (
        <DatePicker
          aria-label={t.value}
          placeholder={t.pickDate}
          formatString="PP"
          value={fromDay(value)}
          onValueChange={(date) => {
            onValueChange(date ? toDay(date) : null)
          }}
        />
      )
    case 'dateRange':
      return <DateRangeEditor value={value} onChange={onValueChange} t={t} />
    case 'option':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={(v) => {
            onValueChange(v)
          }}
        >
          <SelectTrigger aria-label={t.value}>
            <SelectValue placeholder={t.pick} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'options':
      return (
        <MultiSelect
          aria-label={t.value}
          placeholder={t.pick}
          options={options}
          value={Array.isArray(value) ? value : []}
          onValueChange={onValueChange}
        />
      )
  }
}

/** "Match all" / "Match any": the combinator of a group. */
function CombinatorSelect({
  value,
  onValueChange,
  className,
}: {
  value: 'and' | 'or'
  onValueChange: (value: 'and' | 'or') => void
  className?: string
}) {
  const t = useCoreloomI18n().messages.filterBar
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onValueChange(v === 'or' ? 'or' : 'and')
      }}
    >
      <SelectTrigger size="sm" aria-label={t.match} className={cn('w-auto', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="and">{t.matchAll}</SelectItem>
        <SelectItem value="or">{t.matchAny}</SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * Field, operator and value of one condition. Changing the field starts the condition over with
 * that field's first operator; changing the operator keeps the value when it still fits.
 */
function FilterConditionEditor<T>({
  fields,
  condition,
  onConditionChange,
  layout = 'stack',
  autoFocus,
  className,
}: {
  fields: FilterField<T>[]
  condition: FilterCondition
  onConditionChange: (condition: FilterCondition) => void
  /** `stack`: one control per line (in a popover); `row`: side by side, wrapping (in a builder). */
  layout?: 'stack' | 'row'
  /** Focuses the value when it is typed text. */
  autoFocus?: boolean
  className?: string
}) {
  const t = useCoreloomI18n().messages.filterBar
  const field = fields.find((f) => f.id === condition.field)
  const operators = field ? operatorsFor(field.type) : []

  const setField = (id: string) => {
    const next = fields.find((f) => f.id === id)
    if (!next || next.id === condition.field) return
    const operator: FilterOperator = operatorsFor(next.type)[0] ?? 'is'
    onConditionChange({ ...condition, field: next.id, operator, value: null })
  }
  const setOperator = (operator: string) => {
    const op = operators.find((o) => o === operator)
    if (!field || !op) return
    onConditionChange({
      ...condition,
      operator: op,
      value: valueForOperator(field.type, op, condition.value),
    })
  }

  return (
    <div
      className={cn(
        layout === 'row'
          ? 'grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_minmax(0,1fr)]'
          : 'grid grid-cols-1 gap-2',
        className,
      )}
    >
      <Select value={condition.field} onValueChange={setField}>
        <SelectTrigger aria-label={t.field}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={condition.operator} onValueChange={setOperator} disabled={!field}>
        <SelectTrigger aria-label={t.operator}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op}>
              {t.operators[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {field && (
        <ValueEditor
          field={field}
          condition={condition}
          autoFocus={autoFocus}
          t={t}
          onValueChange={(value) => {
            onConditionChange({ ...condition, value })
          }}
        />
      )}
    </div>
  )
}

export { CombinatorSelect, describeCondition, FilterConditionEditor }
