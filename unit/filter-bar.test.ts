// The filter model behind FilterBar and QueryBuilder: operators per type, matching rows, editing the
// tree, and the URL round trip with hostile input.
import { describe, expect, it } from 'vitest'

import { describeCondition } from '@/components/ui/filter-condition'
import {
  addRule,
  countConditions,
  emptyFilter,
  type FilterCondition,
  type FilterField,
  type FilterGroup,
  filterToSearchParams,
  isConditionComplete,
  matchesFilter,
  newCondition,
  operatorsFor,
  parseFilterSearchParams,
  removeRule,
  updateRule,
  valueForOperator,
  valueKind,
} from '@/lib/filter'
import { en, fr } from '@/lib/i18n'

interface Row {
  name: string
  amount: number | null
  created: string | Date
  status: string
  tags: string[]
  paid: boolean
}

const fields: FilterField<Row>[] = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'amount', label: 'Amount', type: 'number' },
  { id: 'created', label: 'Created', type: 'date' },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'paid', label: 'Paid' },
      { value: 'void', label: 'Void' },
    ],
  },
  { id: 'tags', label: 'Tags', type: 'multiselect' },
  { id: 'paid', label: 'Paid', type: 'boolean' },
  { id: 'initial', label: 'Initial', type: 'text', get: (row) => row.name.slice(0, 1) },
]

const row: Row = {
  name: 'Acme Corp',
  amount: 120,
  created: '2026-10-14T09:30:00Z',
  status: 'open',
  tags: ['vip', 'eu'],
  paid: false,
}

const cond = (
  field: string,
  operator: FilterCondition['operator'],
  value: FilterCondition['value'],
): FilterCondition => ({ kind: 'condition', id: `${field}-${operator}`, field, operator, value })

const group = (combinator: 'and' | 'or', ...rules: FilterGroup['rules']): FilterGroup => ({
  kind: 'group',
  id: 'g',
  combinator,
  rules,
})

const match = (c: FilterCondition, r: Row = row) => matchesFilter(r, group('and', c), fields)

describe('operatorsFor and valueKind', () => {
  it('gives each type its operators, the default first', () => {
    expect(operatorsFor('text')[0]).toBe('contains')
    expect(operatorsFor('number')).toContain('between')
    expect(operatorsFor('boolean')).toEqual(['isTrue', 'isFalse'])
    expect(operatorsFor('multiselect')).not.toContain('is')
  })

  it('says what value an operator needs', () => {
    expect(valueKind('number', 'between')).toBe('numberRange')
    expect(valueKind('date', 'between')).toBe('dateRange')
    expect(valueKind('select', 'is')).toBe('option')
    expect(valueKind('select', 'anyOf')).toBe('options')
    expect(valueKind('text', 'isEmpty')).toBe('none')
  })
})

describe('isConditionComplete', () => {
  it('needs a known field, an operator it takes and a filled value', () => {
    expect(isConditionComplete(cond('name', 'contains', 'ac'), fields)).toBe(true)
    expect(isConditionComplete(cond('name', 'contains', '  '), fields)).toBe(false)
    expect(isConditionComplete(cond('name', 'gt', 'ac'), fields)).toBe(false)
    expect(isConditionComplete(cond('nope', 'contains', 'ac'), fields)).toBe(false)
    expect(isConditionComplete(cond('amount', 'gt', Number.NaN), fields)).toBe(false)
    expect(isConditionComplete(cond('created', 'is', '14/10/2026'), fields)).toBe(false)
    expect(isConditionComplete(cond('name', 'isEmpty', null), fields)).toBe(true)
  })

  it('takes a range with one open end, not with none', () => {
    expect(isConditionComplete(cond('amount', 'between', { from: 10, to: null }), fields)).toBe(
      true,
    )
    expect(isConditionComplete(cond('amount', 'between', { from: null, to: null }), fields)).toBe(
      false,
    )
    expect(isConditionComplete(cond('amount', 'between', { from: '10', to: null }), fields)).toBe(
      false,
    )
  })
})

describe('matchesFilter', () => {
  it('matches text without case', () => {
    expect(match(cond('name', 'contains', 'ACME'))).toBe(true)
    expect(match(cond('name', 'notContains', 'acme'))).toBe(false)
    expect(match(cond('name', 'is', 'acme corp'))).toBe(true)
    expect(match(cond('name', 'startsWith', 'corp'))).toBe(false)
    expect(match(cond('initial', 'is', 'a'))).toBe(true)
  })

  it('compares numbers, and a missing number only passes "is not" and "is empty"', () => {
    expect(match(cond('amount', 'gt', 100))).toBe(true)
    expect(match(cond('amount', 'lte', 119))).toBe(false)
    expect(match(cond('amount', 'between', { from: 100, to: 120 }))).toBe(true)
    expect(match(cond('amount', 'between', { from: 121, to: null }))).toBe(false)
    const none = { ...row, amount: null }
    expect(match(cond('amount', 'gt', 0), none)).toBe(false)
    expect(match(cond('amount', 'isNot', 5), none)).toBe(true)
    expect(match(cond('amount', 'isEmpty', null), none)).toBe(true)
  })

  it('compares dates by day, from strings or Date objects', () => {
    expect(match(cond('created', 'is', '2026-10-14'))).toBe(true)
    expect(match(cond('created', 'before', '2026-10-14'))).toBe(false)
    expect(match(cond('created', 'after', '2026-10-13'))).toBe(true)
    expect(match(cond('created', 'between', { from: null, to: '2026-10-14' }))).toBe(true)
    const local = { ...row, created: new Date(2026, 9, 1, 23, 59) }
    expect(match(cond('created', 'is', '2026-10-01'), local)).toBe(true)
    const broken = { ...row, created: new Date('nope') }
    expect(match(cond('created', 'before', '2030-01-01'), broken)).toBe(false)
  })

  it('matches options and lists', () => {
    expect(match(cond('status', 'is', 'open'))).toBe(true)
    expect(match(cond('status', 'anyOf', ['paid', 'void']))).toBe(false)
    expect(match(cond('status', 'noneOf', ['paid', 'void']))).toBe(true)
    expect(match(cond('tags', 'anyOf', ['eu', 'us']))).toBe(true)
    expect(match(cond('tags', 'allOf', ['eu', 'us']))).toBe(false)
    expect(match(cond('tags', 'noneOf', ['us']))).toBe(true)
    expect(match(cond('tags', 'isEmpty', null))).toBe(false)
  })

  it('reads booleans', () => {
    expect(match(cond('paid', 'isFalse', null))).toBe(true)
    expect(match(cond('paid', 'isTrue', null))).toBe(false)
  })

  it('combines with and / or, nested', () => {
    const name = cond('name', 'contains', 'acme')
    const paid = cond('status', 'is', 'paid')
    const big = cond('amount', 'gt', 100)
    expect(matchesFilter(row, group('and', name, paid), fields)).toBe(false)
    expect(matchesFilter(row, group('or', name, paid), fields)).toBe(true)
    const nested = group('and', big, { ...group('or', paid, name), id: 'inner' })
    expect(matchesFilter(row, nested, fields)).toBe(true)
  })

  it('leaves out what is not complete, so a half-written filter hides nothing', () => {
    expect(matchesFilter(row, emptyFilter(), fields)).toBe(true)
    expect(matchesFilter(row, group('and', cond('name', 'contains', '')), fields)).toBe(true)
    expect(matchesFilter(row, group('or', cond('gone', 'is', 'x')), fields)).toBe(true)
    const empty = { ...group('or'), id: 'inner' }
    const strict = group('and', cond('status', 'is', 'paid'), empty)
    expect(matchesFilter(row, strict, fields)).toBe(false)
  })

  it('survives rows that are not objects', () => {
    const loose = fields as unknown[] as FilterField<unknown>[]
    expect(matchesFilter(null, group('and', cond('name', 'contains', 'a')), loose)).toBe(false)
    expect(matchesFilter(42, group('and', cond('name', 'isEmpty', null)), loose)).toBe(true)
  })
})

describe('editing', () => {
  it('adds, updates and removes rules anywhere in the tree', () => {
    const inner: FilterGroup = { kind: 'group', id: 'inner', combinator: 'or', rules: [] }
    let f = addRule(group('and'), 'g', inner)
    f = addRule(f, 'inner', cond('name', 'contains', 'a'))
    expect(countConditions(f, fields)).toBe(1)
    f = updateRule(f, 'name-contains', (r) => ({ ...r, id: 'renamed' }))
    expect(JSON.stringify(f)).toContain('renamed')
    f = removeRule(f, 'renamed')
    expect(countConditions(f, fields)).toBe(0)
    expect(f.rules).toHaveLength(1)
  })

  it('starts a new condition with the type’s first operator and no value', () => {
    const status = fields.find((field) => field.id === 'status')
    if (!status) throw new Error('status field')
    const c = newCondition(status)
    expect(c).toMatchObject({ kind: 'condition', field: 'status', operator: 'is', value: null })
    expect(newCondition(status).id).not.toBe(c.id)
  })

  it('keeps a value across operators when it fits', () => {
    expect(valueForOperator('select', 'anyOf', 'open')).toEqual(['open'])
    expect(valueForOperator('select', 'is', ['open', 'paid'])).toBe('open')
    expect(valueForOperator('number', 'between', 5)).toBeNull()
    expect(valueForOperator('number', 'gt', 5)).toBe(5)
    expect(valueForOperator('text', 'isEmpty', 'x')).toBeNull()
  })
})

describe('URL', () => {
  const filter = group(
    'and',
    cond('status', 'anyOf', ['open', 'paid']),
    cond('name', 'contains', ''),
    { ...group('or', cond('amount', 'between', { from: 10, to: null })), id: 'inner' },
  )

  it('writes complete conditions only and keeps other parameters', () => {
    const params = filterToSearchParams(filter, fields, { params: 'page=2' })
    expect(params.get('page')).toBe('2')
    const raw: unknown = JSON.parse(params.get('filter') ?? '')
    expect(raw).toEqual({
      c: 'and',
      r: [
        ['status', 'anyOf', ['open', 'paid']],
        { c: 'or', r: [['amount', 'between', { from: 10, to: null }]] },
      ],
    })
  })

  it('round-trips, with new ids', () => {
    const back = parseFilterSearchParams(filterToSearchParams(filter, fields), fields)
    expect(countConditions(back, fields)).toBe(2)
    expect(matchesFilter(row, back, fields)).toBe(matchesFilter(row, filter, fields))
    expect(back.id).not.toBe(filter.id)
  })

  it('removes the key when nothing is complete, and uses another key when asked', () => {
    const params = filterToSearchParams(emptyFilter(), fields, { params: 'filter=x&q=1' })
    expect(params.has('filter')).toBe(false)
    const custom = filterToSearchParams(filter, fields, { key: 'f' })
    expect(parseFilterSearchParams(custom, fields, { key: 'f' }).rules).toHaveLength(2)
  })

  it('gives an empty filter for missing or broken JSON', () => {
    for (const text of ['', 'filter=', 'filter=%7B', 'filter=null', 'filter=[1,2]', 'filter=42']) {
      const parsed = parseFilterSearchParams(text, fields)
      expect(parsed).toMatchObject({ kind: 'group', combinator: 'and', rules: [] })
    }
  })

  it('drops unknown fields, wrong operators and values of the wrong shape', () => {
    const hostile = JSON.stringify({
      c: 'or',
      r: [
        ['__proto__', 'is', 'x'],
        ['name', 'gt', 'x'],
        ['name', 'contains', { toString: 'x' }],
        ['amount', 'gt', '5'],
        ['created', 'is', '2026-13-99<script>'],
        ['tags', 'anyOf', ['eu', 3]],
        ['status', 'is', 'open', 'extra'],
        ['paid', 'isTrue', 'ignored'],
        { c: 'xor', r: [] },
        'junk',
      ],
    })
    const parsed = parseFilterSearchParams(new URLSearchParams({ filter: hostile }), fields)
    expect(parsed.combinator).toBe('or')
    expect(parsed.rules).toMatchObject([
      { field: 'status', operator: 'is', value: 'open' },
      { field: 'paid', operator: 'isTrue', value: null },
    ])
  })

  it('cuts deep nesting and long lists', () => {
    let deep: unknown = { c: 'and', r: [['name', 'contains', 'a']] }
    for (let i = 0; i < 20; i++) deep = { c: 'and', r: [deep] }
    const parsed = parseFilterSearchParams(
      new URLSearchParams({ filter: JSON.stringify(deep) }),
      fields,
    )
    expect(countConditions(parsed, fields)).toBe(0)
    const many = { c: 'and', r: Array.from({ length: 500 }, () => ['name', 'contains', 'a']) }
    const long = parseFilterSearchParams(
      new URLSearchParams({ filter: JSON.stringify(many) }),
      fields,
    )
    expect(long.rules).toHaveLength(50)
  })
})

describe('describeCondition', () => {
  const field = (id: string) => {
    const found = fields.find((f) => f.id === id)
    if (!found) throw new Error(id)
    return found
  }
  const say = (c: FilterCondition, locale = 'en') =>
    describeCondition(c, field(c.field), {
      locale,
      t: locale === 'fr' ? fr.filterBar : en.filterBar,
    })

  it('writes a condition as one line, with option labels and locale formats', () => {
    expect(say(cond('status', 'anyOf', ['open', 'void']))).toBe('Status is any of Open or Void')
    expect(say(cond('tags', 'allOf', ['eu', 'us']))).toBe('Tags has all of eu and us')
    expect(say(cond('amount', 'between', { from: 1000, to: null }))).toBe('Amount from 1,000')
    expect(say(cond('created', 'between', { from: null, to: '2026-10-14' }))).toBe(
      'Created up to Oct 14, 2026',
    )
    expect(say(cond('amount', 'between', { from: 1, to: 2 }))).toBe('Amount is between 1 and 2')
    expect(say(cond('amount', 'gte', 1500), 'fr')).toBe('Amount est au moins 1\u202f500')
    expect(say(cond('created', 'is', '2026-10-14'))).toBe('Created is Oct 14, 2026')
  })

  it('cuts long lists and leaves empty values out', () => {
    expect(say(cond('status', 'anyOf', ['draft', 'open', 'paid', 'void']))).toBe(
      'Status is any of draft or Open +2',
    )
    expect(say(cond('name', 'contains', '  '))).toBe('Name contains')
    expect(say(cond('name', 'isEmpty', null))).toBe('Name is empty')
  })
})
