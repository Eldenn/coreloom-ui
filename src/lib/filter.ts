// Coreloom UI — filter model. The shape FilterBar and QueryBuilder edit (conditions in AND / OR
// groups), and the plain functions around it: which operators a field type takes, whether a row
// matches, and how a filter goes in and out of the URL. No React here, so an app can run the same
// filter on its server, in a worker or in a test.
//
//   const rows = allRows.filter((row) => matchesFilter(row, filter, fields))
//   router.replace("?" + filterToSearchParams(filter, searchParams))

type FilterFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'

interface FilterOption {
  value: string
  label: string
}

interface FilterField<T = Record<string, unknown>> {
  /** The row key it reads (or `get` for a computed value), and its id in the filter and the URL. */
  id: string
  label: string
  type: FilterFieldType
  /** The choices of a `select` or `multiselect` field. */
  options?: FilterOption[]
  /** Reads the value from a row when it isn't `row[id]`. */
  get?: (row: T) => unknown
}

type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'is'
  | 'isNot'
  | 'startsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'
  | 'anyOf'
  | 'noneOf'
  | 'allOf'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isTrue'
  | 'isFalse'

/** A range for `between`: numbers, or dates as "YYYY-MM-DD". An open end is `null`. */
interface FilterRange {
  from: number | string | null
  to: number | string | null
}

/** Text, a number, a date ("YYYY-MM-DD"), an option, several options, a range, or nothing yet. */
type FilterValue = string | number | string[] | FilterRange | null

interface FilterCondition {
  kind: 'condition'
  id: string
  /** A `FilterField` id. */
  field: string
  operator: FilterOperator
  value: FilterValue
}

interface FilterGroup {
  kind: 'group'
  id: string
  /** `and`: every rule must match; `or`: at least one. */
  combinator: 'and' | 'or'
  rules: FilterRule[]
}

type FilterRule = FilterCondition | FilterGroup

/** What a value editor shows for a field type and operator. */
type FilterValueKind =
  'none' | 'text' | 'number' | 'numberRange' | 'date' | 'dateRange' | 'option' | 'options'

const OPERATORS: Record<FilterFieldType, FilterOperator[]> = {
  text: ['contains', 'notContains', 'is', 'isNot', 'startsWith', 'isEmpty', 'isNotEmpty'],
  number: ['is', 'isNot', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  date: ['is', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  select: ['is', 'isNot', 'anyOf', 'noneOf', 'isEmpty', 'isNotEmpty'],
  multiselect: ['anyOf', 'allOf', 'noneOf', 'isEmpty', 'isNotEmpty'],
  boolean: ['isTrue', 'isFalse'],
}

/** The operators a field type takes, the first one being the default. */
function operatorsFor(type: FilterFieldType): FilterOperator[] {
  return OPERATORS[type]
}

/** What the value of `operator` on a field of `type` looks like. */
function valueKind(type: FilterFieldType, operator: FilterOperator): FilterValueKind {
  if (['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(operator)) return 'none'
  switch (type) {
    case 'text':
      return 'text'
    case 'number':
      return operator === 'between' ? 'numberRange' : 'number'
    case 'date':
      return operator === 'between' ? 'dateRange' : 'date'
    case 'select':
      return operator === 'is' || operator === 'isNot' ? 'option' : 'options'
    case 'multiselect':
      return 'options'
    case 'boolean':
      return 'none'
  }
}

const DAY = /^\d{4}-\d{2}-\d{2}$/

function isRange(value: FilterValue): value is FilterRange {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fitsRange(value: FilterValue, end: (v: number | string) => boolean) {
  if (!isRange(value) || (value.from === null && value.to === null)) return false
  return [value.from, value.to].every((v) => v === null || end(v))
}

const isDay = (v: unknown) => typeof v === 'string' && DAY.test(v)
const isNumber = (v: unknown) => typeof v === 'number' && Number.isFinite(v)

/** Whether `value` has the shape `kind` needs, filled in (a range needs at least one end). */
function fitsKind(kind: FilterValueKind, value: FilterValue): boolean {
  switch (kind) {
    case 'none':
      return true
    case 'text':
      return typeof value === 'string' && value.trim() !== ''
    case 'number':
      return isNumber(value)
    case 'date':
      return isDay(value)
    case 'option':
      return typeof value === 'string' && value !== ''
    case 'options':
      return Array.isArray(value) && value.length > 0
    case 'numberRange':
      return fitsRange(value, isNumber)
    case 'dateRange':
      return fitsRange(value, isDay)
  }
}

/** Whether a condition can filter: its field exists, takes its operator, and its value is filled. */
function isConditionComplete<T>(condition: FilterCondition, fields: FilterField<T>[]): boolean {
  const field = fields.find((f) => f.id === condition.field)
  if (!field || !operatorsFor(field.type).includes(condition.operator)) return false
  return fitsKind(valueKind(field.type, condition.operator), condition.value)
}

// ── Matching ─────────────────────────────────────────────────────────────────

function readField<T>(row: T, field: FilterField<T>): unknown {
  if (field.get) return field.get(row)
  return typeof row === 'object' && row !== null ? Reflect.get(row, field.id) : undefined
}

function isBlank(v: unknown) {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
}

function asText(v: unknown): string {
  if (typeof v === 'string') return v.toLocaleLowerCase()
  if (typeof v === 'number' || typeof v === 'boolean') return String(v).toLocaleLowerCase()
  return ''
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** A Date as "YYYY-MM-DD" in local time, the form date filters keep. */
function toDay(date: Date): string {
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** A row's date (Date, "YYYY-MM-DD…" or a timestamp) as "YYYY-MM-DD", or null. */
function asDay(v: unknown): string | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : toDay(v)
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10)
  if (typeof v === 'number' && Number.isFinite(v)) return toDay(new Date(v))
  return null
}

function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x))
  if (typeof v === 'string' || typeof v === 'number') return [String(v)]
  return []
}

function inRange<V extends number | string>(v: V, from: V | null, to: V | null) {
  return (from === null || v >= from) && (to === null || v <= to)
}

function matchText(v: unknown, operator: FilterOperator, value: FilterValue) {
  const text = asText(v)
  const needle = asText(value)
  switch (operator) {
    case 'contains':
      return text.includes(needle)
    case 'notContains':
      return !text.includes(needle)
    case 'is':
      return text === needle
    case 'isNot':
      return text !== needle
    case 'startsWith':
      return text.startsWith(needle)
    default:
      return true
  }
}

function matchNumber(v: unknown, operator: FilterOperator, value: FilterValue) {
  const n = asNumber(v)
  if (n === null) return operator === 'isNot'
  if (operator === 'between' && isRange(value))
    return inRange(n, asNumber(value.from), asNumber(value.to))
  const target = asNumber(value)
  if (target === null) return true
  const compare: Partial<Record<FilterOperator, boolean>> = {
    is: n === target,
    isNot: n !== target,
    gt: n > target,
    gte: n >= target,
    lt: n < target,
    lte: n <= target,
  }
  return compare[operator] ?? true
}

function matchDate(v: unknown, operator: FilterOperator, value: FilterValue) {
  const day = asDay(v)
  if (day === null) return false
  if (operator === 'between' && isRange(value)) {
    const from = typeof value.from === 'string' ? value.from : null
    const to = typeof value.to === 'string' ? value.to : null
    return inRange(day, from, to)
  }
  if (typeof value !== 'string') return true
  if (operator === 'before') return day < value
  if (operator === 'after') return day > value
  return day === value
}

function matchOptions(v: unknown, operator: FilterOperator, value: FilterValue) {
  const have = asList(v)
  const wanted = asList(value)
  switch (operator) {
    case 'is':
      return have.length > 0 && have.every((x) => wanted.includes(x))
    case 'isNot':
      return !have.some((x) => wanted.includes(x))
    case 'anyOf':
      return have.some((x) => wanted.includes(x))
    case 'allOf':
      return wanted.every((x) => have.includes(x))
    case 'noneOf':
      return !have.some((x) => wanted.includes(x))
    default:
      return true
  }
}

function matchCondition<T>(row: T, condition: FilterCondition, field: FilterField<T>) {
  const v = readField(row, field)
  const { operator, value } = condition
  if (operator === 'isEmpty') return isBlank(v)
  if (operator === 'isNotEmpty') return !isBlank(v)
  if (operator === 'isTrue') return v === true || v === 'true'
  if (operator === 'isFalse') return !(v === true || v === 'true')
  switch (field.type) {
    case 'text':
      return matchText(v, operator, value)
    case 'number':
      return matchNumber(v, operator, value)
    case 'date':
      return matchDate(v, operator, value)
    default:
      return matchOptions(v, operator, value)
  }
}

/**
 * Whether `row` passes `filter`. Conditions that aren't complete (no value yet, a field that no
 * longer exists) are left out, as is a group with nothing complete in it, so a half-written filter
 * never hides every row. Text compares ignore case; dates compare by day.
 */
function matchesFilter<T>(row: T, filter: FilterGroup, fields: FilterField<T>[]): boolean {
  const results: boolean[] = []
  for (const rule of filter.rules) {
    if (rule.kind === 'group') {
      if (countConditions(rule, fields) > 0) results.push(matchesFilter(row, rule, fields))
      continue
    }
    const field = fields.find((f) => f.id === rule.field)
    if (field && isConditionComplete(rule, fields)) results.push(matchCondition(row, rule, field))
  }
  if (results.length === 0) return true
  return filter.combinator === 'and' ? results.every(Boolean) : results.some(Boolean)
}

// ── Editing ──────────────────────────────────────────────────────────────────

let sequence = 0
/** A new id for a condition or a group, unique on the page. */
function filterId(): string {
  sequence += 1
  return `filter-${String(sequence)}`
}

/** An empty filter: a top-level AND group with no rule. */
function emptyFilter(): FilterGroup {
  return { kind: 'group', id: filterId(), combinator: 'and', rules: [] }
}

/** A new condition on `field`, with its type's first operator and no value yet. */
function newCondition<T>(field: FilterField<T>): FilterCondition {
  const operator = operatorsFor(field.type)[0] ?? 'is'
  return { kind: 'condition', id: filterId(), field: field.id, operator, value: null }
}

/** The complete conditions in a filter, nested groups included. */
function countConditions<T>(filter: FilterGroup, fields: FilterField<T>[]): number {
  return filter.rules.reduce(
    (n, rule) =>
      n +
      (rule.kind === 'group'
        ? countConditions(rule, fields)
        : Number(isConditionComplete(rule, fields))),
    0,
  )
}

/** A copy of `filter` with the rule `id` replaced by `update(rule)`, or removed when it returns null. */
function updateRule(
  filter: FilterGroup,
  id: string,
  update: (rule: FilterRule) => FilterRule | null,
): FilterGroup {
  const rules: FilterRule[] = []
  for (const rule of filter.rules) {
    const next = rule.id === id ? update(rule) : rule
    if (next === null) continue
    rules.push(next.kind === 'group' && next.id !== id ? updateRule(next, id, update) : next)
  }
  return { ...filter, rules }
}

/** A copy of `filter` with the rule `id` removed, wherever it is. */
function removeRule(filter: FilterGroup, id: string): FilterGroup {
  return updateRule(filter, id, () => null)
}

/** A copy of `filter` with `rule` added at the end of the group `groupId`. */
function addRule(filter: FilterGroup, groupId: string, rule: FilterRule): FilterGroup {
  if (filter.id === groupId) return { ...filter, rules: [...filter.rules, rule] }
  return updateRule(filter, groupId, (group) =>
    group.kind === 'group' ? { ...group, rules: [...group.rules, rule] } : group,
  )
}

/** The value a condition keeps when its operator changes: kept if it still fits, else cleared. */
function valueForOperator(
  type: FilterFieldType,
  operator: FilterOperator,
  value: FilterValue,
): FilterValue {
  const kind = valueKind(type, operator)
  if (kind === 'none') return null
  if (fitsKind(kind, value)) return value
  // "is Active" → "is any of": keep the option as a list, and back.
  if (kind === 'options' && typeof value === 'string' && value !== '') return [value]
  if (kind === 'option' && Array.isArray(value)) return value[0] ?? null
  return null
}

// ── URL ──────────────────────────────────────────────────────────────────────

const MAX_DEPTH = 4
const MAX_RULES = 50

/** The compact form kept in the URL: ["field", "operator", value] or { c, r }. */
type CompactRule = [string, string, FilterValue] | { c: 'and' | 'or'; r: CompactRule[] }

function compact<T>(group: FilterGroup, fields: FilterField<T>[]): CompactRule {
  const r: CompactRule[] = []
  for (const rule of group.rules) {
    if (rule.kind === 'group') {
      if (countConditions(rule, fields) > 0) r.push(compact(rule, fields))
    } else if (isConditionComplete(rule, fields)) {
      r.push([rule.field, rule.operator, rule.value])
    }
  }
  return { c: group.combinator, r }
}

/**
 * `params` (or empty ones) with the filter written to `key` ("filter" by default) as compact JSON,
 * only its complete conditions; the key is removed when nothing is left. Other parameters are kept.
 */
function filterToSearchParams<T>(
  filter: FilterGroup,
  fields: FilterField<T>[],
  { params, key = 'filter' }: { params?: URLSearchParams | string; key?: string } = {},
): URLSearchParams {
  const next = new URLSearchParams(params)
  if (countConditions(filter, fields) === 0) next.delete(key)
  else next.set(key, JSON.stringify(compact(filter, fields)))
  return next
}

function parseValue(raw: unknown): FilterValue {
  if (typeof raw === 'string' || (typeof raw === 'number' && Number.isFinite(raw))) return raw
  if (Array.isArray(raw)) {
    const list = raw.filter((x): x is string => typeof x === 'string').slice(0, MAX_RULES)
    return list.length === raw.length ? list : null
  }
  if (typeof raw === 'object' && raw !== null) {
    const from: unknown = Reflect.get(raw, 'from')
    const to: unknown = Reflect.get(raw, 'to')
    const end = (v: unknown) =>
      typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v)) ? v : null
    return { from: end(from), to: end(to) }
  }
  return null
}

function parseRule<T>(raw: unknown, fields: FilterField<T>[], depth: number): FilterRule | null {
  if (Array.isArray(raw)) {
    const parts: unknown[] = raw
    const [fieldId, operator, value] = parts
    const field = fields.find((f) => f.id === fieldId)
    const op = operatorsFor(field?.type ?? 'boolean').find((o) => o === operator)
    if (!field || !op) return null
    const condition: FilterCondition = {
      kind: 'condition',
      id: filterId(),
      field: field.id,
      operator: op,
      value: valueKind(field.type, op) === 'none' ? null : parseValue(value),
    }
    return isConditionComplete(condition, fields) ? condition : null
  }
  if (typeof raw !== 'object' || raw === null || depth >= MAX_DEPTH) return null
  const c: unknown = Reflect.get(raw, 'c')
  const r: unknown = Reflect.get(raw, 'r')
  if ((c !== 'and' && c !== 'or') || !Array.isArray(r)) return null
  const rules = r
    .slice(0, MAX_RULES)
    .map((x: unknown) => parseRule(x, fields, depth + 1))
    .filter((x): x is FilterRule => x !== null)
  return { kind: 'group', id: filterId(), combinator: c, rules }
}

/**
 * The filter kept in `params` under `key`, checked against `fields`: unknown fields, operators a
 * field doesn't take, values of the wrong shape and anything nested deeper than four groups are
 * dropped. Missing or broken JSON gives an empty filter, never an error.
 */
function parseFilterSearchParams<T>(
  params: URLSearchParams | string,
  fields: FilterField<T>[],
  { key = 'filter' }: { key?: string } = {},
): FilterGroup {
  const text = new URLSearchParams(params).get(key)
  if (!text) return emptyFilter()
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return emptyFilter()
  }
  const rule = Array.isArray(raw) ? null : parseRule(raw, fields, 0)
  return rule?.kind === 'group' ? rule : emptyFilter()
}

export {
  addRule,
  countConditions,
  emptyFilter,
  type FilterCondition,
  type FilterField,
  type FilterFieldType,
  type FilterGroup,
  filterId,
  type FilterOperator,
  type FilterOption,
  type FilterRange,
  type FilterRule,
  filterToSearchParams,
  type FilterValue,
  type FilterValueKind,
  isConditionComplete,
  matchesFilter,
  newCondition,
  operatorsFor,
  parseFilterSearchParams,
  removeRule,
  toDay,
  updateRule,
  valueForOperator,
  valueKind,
}
