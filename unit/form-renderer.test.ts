import { describe, expect, it } from 'vitest'

import {
  addFormField,
  moveFormField,
  removeFormField,
  removeSection,
  updateFormField,
} from '@/components/form-builder'
import {
  checkFormField,
  evaluateCondition,
  type FormSpec,
  formSpecValues,
  fromJSONSchema,
  initialFormValues,
  readFormSpec,
  toJSONSchema,
} from '@/components/ui/form-renderer'

const spec: FormSpec = {
  version: 1,
  sections: [
    {
      id: 'a',
      fields: [
        {
          name: 'kind',
          type: 'select',
          label: 'Kind',
          options: [
            { value: 'person', label: 'Person' },
            { value: 'company', label: 'Company' },
          ],
        },
        {
          name: 'company',
          type: 'text',
          label: 'Company',
          required: true,
          visibleWhen: { field: 'kind', op: 'equals', value: 'company' },
        },
        {
          name: 'vat',
          type: 'text',
          label: 'VAT',
          visibleWhen: { field: 'company', op: 'filled' },
        },
      ],
    },
    {
      id: 'b',
      fields: [
        { name: 'start', type: 'date', label: 'Start', defaultValue: '2026-11-02' },
        { name: 'seats', type: 'number', label: 'Seats', min: 1, max: 10 },
        { name: 'news', type: 'checkbox', label: 'News' },
      ],
    },
  ],
}

describe('readFormSpec', () => {
  it('keeps a well-formed spec as it is', () => {
    const { spec: read, issues } = readFormSpec(spec)
    expect(issues).toEqual([])
    expect(read).toEqual(spec)
  })

  it('accepts the one-section shorthand ToolForm takes', () => {
    const { spec: read } = readFormSpec({
      title: 'Ask',
      fields: [{ name: 'day', type: 'date', label: 'Day' }],
    })
    expect(read.title).toBe('Ask')
    expect(read.sections).toEqual([
      { id: 'main', fields: [{ name: 'day', type: 'date', label: 'Day' }] },
    ])
  })

  it('reads untrusted input: drops, fixes and reports', () => {
    const { spec: read, issues } = readFormSpec({
      sections: [
        {
          fields: [
            { name: 'ok', type: 'mystery', label: 'Ok', onClick: { evil: true } },
            { name: 'ok', type: 'text' },
            { name: '1bad' },
            'nope',
            { name: 'pick', type: 'select', options: ['a', 'a', { value: 2, label: 'Two' }] },
            { name: 'ghost', visibleWhen: { field: 'missing', op: 'filled' } },
          ],
        },
      ],
    })
    expect(issues.map((i) => i.code)).toEqual([
      'unknownType',
      'duplicateName',
      'missingName',
      'notObject',
      'badCondition',
    ])
    const [ok, pick, ghost] = read.sections[0].fields
    expect(ok).toEqual({ name: 'ok', type: 'text', label: 'Ok' })
    expect(pick.options).toEqual([
      { value: 'a', label: 'a' },
      { value: '2', label: 'Two' },
    ])
    expect(ghost.visibleWhen).toBeUndefined()
  })

  it('caps the number of fields', () => {
    const fields = Array.from({ length: 205 }, (_, i) => ({ name: `f${i}`, type: 'text' }))
    const { spec: read, issues } = readFormSpec({ fields })
    expect(read.sections[0].fields).toHaveLength(200)
    expect(issues).toEqual([{ path: 'fields[200]', code: 'tooMany' }])
  })
})

describe('conditions and values', () => {
  it('evaluates conditions, combined ones too', () => {
    const values = { kind: 'company', tags: ['a', 'b'], seats: 3 }
    expect(evaluateCondition({ field: 'kind', op: 'equals', value: 'company' }, values)).toBe(true)
    expect(evaluateCondition({ field: 'tags', op: 'contains', value: 'b' }, values)).toBe(true)
    expect(evaluateCondition({ field: 'seats', op: 'gt', value: 5 }, values)).toBe(false)
    expect(
      evaluateCondition(
        {
          any: [
            { field: 'seats', op: 'lt', value: 2 },
            { field: 'kind', op: 'in', value: ['company'] },
          ],
        },
        values,
      ),
    ).toBe(true)
    expect(evaluateCondition({ field: 'missing', op: 'empty' }, values)).toBe(true)
  })

  it('starts from the defaults, in the controls’ shape', () => {
    const initial = initialFormValues(spec, undefined, { seats: 4 })
    expect(initial.start).toEqual(new Date(2026, 10, 2))
    expect(initial.seats).toBe(4)
    expect(initial.news).toBe(false)
    expect(initial.kind).toBe('')
  })

  it('submits visible fields as JSON, and a hidden field hides what depends on it', () => {
    const values = {
      kind: 'person',
      company: 'Acme',
      vat: 'FR12',
      start: new Date(2026, 0, 5),
      seats: null,
      news: false,
    }
    expect(formSpecValues(spec, values)).toEqual({
      kind: 'person',
      start: '2026-01-05',
      seats: null,
      news: false,
    })
    expect(formSpecValues(spec, { ...values, kind: 'company' })).toMatchObject({
      company: 'Acme',
      vat: 'FR12',
    })
  })

  it('checks a value against its field', () => {
    const f = spec.sections[0].fields[1]
    expect(checkFormField(f, null)).toEqual({ type: 'required' })
    expect(checkFormField({ ...f, required: false }, null)).toBeUndefined()
    expect(
      checkFormField({ name: 'n', type: 'checkbox', label: 'n', required: true }, false),
    ).toEqual({ type: 'checked' })
    expect(checkFormField({ name: 'e', type: 'email', label: 'e' }, 'nope')).toEqual({
      type: 'email',
    })
    expect(checkFormField({ name: 's', type: 'number', label: 's', max: 10 }, 12)).toEqual({
      type: 'max',
      limit: 10,
    })
    expect(
      checkFormField({ name: 'd', type: 'date', label: 'd', min: '2026-01-01' }, '2025-12-31'),
    ).toEqual({ type: 'dateMin', limit: '2026-01-01' })
    expect(
      checkFormField(
        { name: 'c', type: 'text', label: 'c', pattern: '[A-Z]{2}', patternMessage: 'Two caps' },
        'abc',
      ),
    ).toEqual({ type: 'custom', message: 'Two caps' })
    // A broken pattern is ignored rather than throwing.
    expect(checkFormField({ name: 'c', type: 'text', label: 'c', pattern: '(' }, 'x')).toBe(
      undefined,
    )
    expect(checkFormField({ name: 't', type: 'tags', label: 't', minItems: 2 }, ['one'])).toEqual({
      type: 'minItems',
      limit: 2,
    })
  })
})

describe('JSON Schema', () => {
  const schema = {
    title: 'Signup',
    type: 'object',
    required: ['email', 'plan'],
    properties: {
      email: { type: 'string', format: 'email', title: 'Email' },
      plan: { type: 'string', enum: ['free', 'pro'], enumNames: ['Free', 'Pro'] },
      seats: { type: 'integer', minimum: 1, maximum: 50, default: 1 },
      bio: { type: 'string', maxLength: 280 },
      topics: { type: 'array', items: { type: 'string', enum: ['ai', 'ui'] } },
      terms: { type: 'boolean', title: 'I agree' },
      address: {
        type: 'object',
        title: 'Address',
        properties: { city: { type: 'string', title: 'City' } },
      },
    },
  }
  const ui = {
    'ui:order': ['plan', '*'],
    bio: { 'ui:widget': 'textarea', 'ui:placeholder': 'About you' },
    terms: { 'ui:widget': 'switch' },
  }

  it('maps properties to fields, with the UI schema', () => {
    const { spec: read, issues } = fromJSONSchema(schema, ui)
    expect(issues).toEqual([])
    expect(read.title).toBe('Signup')
    const [main, address] = read.sections
    expect(main.fields.map((f) => [f.name, f.type])).toEqual([
      ['plan', 'select'],
      ['email', 'email'],
      ['seats', 'number'],
      ['bio', 'textarea'],
      ['topics', 'multiselect'],
      ['terms', 'switch'],
    ])
    expect(main.fields[0]).toMatchObject({
      required: true,
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
      ],
    })
    expect(main.fields[2]).toMatchObject({ min: 1, max: 50, step: 1, defaultValue: 1 })
    expect(main.fields[3]).toMatchObject({ maxLength: 280, placeholder: 'About you' })
    expect(address).toEqual({
      id: 'address',
      title: 'Address',
      fields: [{ name: 'city', type: 'text', label: 'City' }],
    })
  })

  it('round-trips through toJSONSchema', () => {
    const { spec: read } = fromJSONSchema(schema, ui)
    const out = toJSONSchema(read)
    expect(out.schema.required).toEqual(['plan', 'email'])
    expect((out.schema.properties as Record<string, unknown>).email).toEqual({
      title: 'Email',
      type: 'string',
      format: 'email',
    })
    const back = fromJSONSchema(out.schema, out.uiSchema).spec
    expect(back.sections.flatMap((s) => s.fields.map((f) => [f.name, f.type]))).toEqual(
      read.sections.flatMap((s) => s.fields.map((f) => [f.name, f.type])),
    )
  })
})

describe('editing a spec', () => {
  it('adds after the selected field, moves and removes', () => {
    let next = addFormField(spec, { name: 'x', type: 'text', label: 'X' }, { after: 'kind' })
    expect(next.sections[0].fields.map((f) => f.name)).toEqual(['kind', 'x', 'company', 'vat'])
    next = moveFormField(next, 'x', 'b', 0)
    expect(next.sections[1].fields.map((f) => f.name)).toEqual(['x', 'start', 'seats', 'news'])
    next = moveFormField(next, 'x', 'b', 3)
    expect(next.sections[1].fields.map((f) => f.name)).toEqual(['start', 'seats', 'news', 'x'])
    next = removeFormField(next, 'company')
    // The condition that read "company" goes with it.
    expect(next.sections[0].fields.find((f) => f.name === 'vat')?.visibleWhen).toBeUndefined()
  })

  it('carries a rename into conditions and clears emptied settings', () => {
    const next = updateFormField(spec, 'kind', { name: 'type', label: undefined })
    expect(next.sections[0].fields[0]).not.toHaveProperty('label')
    expect(next.sections[0].fields[1].visibleWhen).toEqual({
      field: 'type',
      op: 'equals',
      value: 'company',
    })
  })

  it('removing a section keeps its fields', () => {
    const next = removeSection(spec, 'b')
    expect(next.sections).toHaveLength(1)
    expect(next.sections[0].fields.map((f) => f.name)).toContain('seats')
  })
})

describe('types from the input primitives', () => {
  it('know when they are empty, and what they submit', () => {
    const f = (type: string, extra: Record<string, unknown> = {}) => ({
      name: 'x',
      type,
      label: 'X',
      ...extra,
    })
    const one = (type: string, value: unknown, extra: Record<string, unknown> = {}) =>
      formSpecValues(
        { version: 1, sections: [{ id: 'a', fields: [f(type, extra)] }] },
        { x: value },
      ).x
    expect(one('rating', 0)).toBeNull()
    expect(one('unit', { value: null, unit: 'kg' })).toBeNull()
    expect(one('unit', { value: 3, unit: 'kg' })).toEqual({ value: 3, unit: 'kg' })
    expect(one('numberrange', { min: null, max: null })).toBeNull()
    expect(one('timerange', {})).toBeNull()
    expect(one('chips', undefined, { single: true })).toBeNull()
    expect(one('chips', undefined)).toEqual([])
    expect(
      one('keyvalue', [
        { key: ' ', value: 'a' },
        { key: 'k', value: 'v' },
      ]),
    ).toEqual([{ key: 'k', value: 'v' }])
    expect(
      one('sortable', undefined, {
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      }),
    ).toEqual(['a', 'b'])
    expect(checkFormField(f('rating', { required: true }), 0)).toEqual({ type: 'required' })
    expect(checkFormField(f('json'), '{nope')).toEqual({ type: 'json' })
    expect(checkFormField(f('month', { min: '2026-01' }), '2025-12')).toEqual({
      type: 'dateMin',
      limit: '2026-01',
    })
  })

  it('reads nested options and list settings', () => {
    const { spec: read } = readFormSpec({
      fields: [
        {
          name: 'team',
          type: 'treeselect',
          options: [{ value: 'eng', label: 'Eng', children: [{ value: 'web', label: 'Web' }] }],
        },
        { name: 'w', type: 'unit', units: ['kg', 'g', 3] },
      ],
    })
    expect(read.sections[0].fields[0].options).toEqual([
      { value: 'eng', label: 'Eng', children: [{ value: 'web', label: 'Web' }] },
    ])
    // A list holding something other than strings isn't a setting.
    expect(read.sections[0].fields[1]).not.toHaveProperty('units')
  })
})

// Edge cases that pin the behaviour of the pure helpers before and after they were split up.
describe('edge cases', () => {
  it('reads every condition operator, and holds on an unknown one', () => {
    const values = { kind: 'company', tags: ['a'], note: 'hello', seats: 3 }
    expect(evaluateCondition({ field: 'kind', op: 'notEquals', value: 'person' }, values)).toBe(
      true,
    )
    expect(evaluateCondition({ field: 'tags', op: 'notEquals', value: 'a' }, values)).toBe(false)
    expect(evaluateCondition({ field: 'tags', op: 'equals', value: 'a' }, values)).toBe(true)
    expect(evaluateCondition({ field: 'note', op: 'contains', value: 'ell' }, values)).toBe(true)
    expect(evaluateCondition({ field: 'seats', op: 'contains', value: 3 }, values)).toBe(false)
    expect(evaluateCondition({ field: 'seats', op: 'gt', value: '2' }, values)).toBe(false)
    expect(evaluateCondition({ field: 'kind', op: 'in', value: 'company' }, values)).toBe(false)
    expect(evaluateCondition({ field: 'kind', op: 'filled' }, values)).toBe(true)
    expect(evaluateCondition({ any: [] }, values)).toBe(true)
    expect(evaluateCondition({ all: [] }, values)).toBe(true)
    expect(evaluateCondition(undefined, values)).toBe(true)
    const unknown = { field: 'kind', op: 'toString' } as unknown as Parameters<
      typeof evaluateCondition
    >[0]
    expect(evaluateCondition(unknown, values)).toBe(true)
  })

  it('checks lengths, time bounds and item counts', () => {
    const text = { name: 'c', type: 'text', label: 'c', minLength: 2, maxLength: 3 }
    expect(checkFormField(text, 'a')).toEqual({ type: 'minLength', limit: 2 })
    expect(checkFormField(text, 'abcd')).toEqual({ type: 'maxLength', limit: 3 })
    expect(checkFormField(text, 'abc')).toBeUndefined()
    expect(
      checkFormField({ name: 'p', type: 'text', label: 'p', pattern: '[a-z]+' }, 'A1'),
    ).toEqual({ type: 'pattern' })
    const time = { name: 't', type: 'time', label: 't', min: '09:00', max: '18:00' }
    expect(checkFormField(time, '08:30')).toEqual({ type: 'timeMin', limit: '09:00' })
    expect(checkFormField(time, '19:00')).toEqual({ type: 'timeMax', limit: '18:00' })
    expect(checkFormField(time, '12:00')).toBeUndefined()
    expect(
      checkFormField({ name: 'd', type: 'date', label: 'd', max: '2026-12-31' }, '2027-01-01'),
    ).toEqual({ type: 'dateMax', limit: '2026-12-31' })
    expect(checkFormField({ name: 's', type: 'number', label: 's', min: 1 }, 0)).toEqual({
      type: 'min',
      limit: 1,
    })
    expect(
      checkFormField({ name: 'g', type: 'tags', label: 'g', maxItems: 1 }, ['a', 'b']),
    ).toEqual({ type: 'maxItems', limit: 1 })
  })

  it('reads combined conditions, and drops the broken parts', () => {
    const { spec: read, issues } = readFormSpec({
      fields: [
        { name: 'a', type: 'text' },
        {
          name: 'b',
          visibleWhen: {
            all: [{ field: 'a', op: 'filled' }, { field: 'a', op: 'nope' }, 'junk'],
          },
        },
        { name: 'c', visibleWhen: { any: [{ field: 'a', value: ['x', 1, null] }] } },
        { name: 'd', visibleWhen: { field: 'a', op: 'equals', value: { evil: true } } },
        { name: 'e', visibleWhen: { field: 'a', value: [{}] } },
      ],
    })
    const [, b, c, d, e] = read.sections[0].fields
    expect(b.visibleWhen).toEqual({ all: [{ field: 'a', op: 'filled' }] })
    expect(c.visibleWhen).toEqual({ any: [{ field: 'a', op: 'equals', value: ['x', 1, null] }] })
    expect(d.visibleWhen).toBeUndefined()
    expect(e.visibleWhen).toBeUndefined()
    expect(issues).toEqual([
      { path: 'fields[3]', code: 'badCondition', detail: 'd' },
      { path: 'fields[4]', code: 'badCondition', detail: 'e' },
    ])
  })

  it('reads sections, settings and hostile values', () => {
    expect(readFormSpec('nope').issues).toEqual([{ path: '', code: 'notObject' }])
    expect(readFormSpec({}).spec).toEqual({ version: 1, sections: [{ id: 'main', fields: [] }] })
    const { spec: read, issues } = readFormSpec({
      title: 'T',
      description: '',
      submitLabel: 'Go',
      sections: [
        'nope',
        { id: 'x', title: 'X', columns: 3, fields: [{ name: 'a', span: 2, minLength: -1 }] },
        {
          id: 'x',
          columns: 5,
          fields: [
            {
              name: 'b',
              type: 'select',
              required: 'yes',
              min: '2026-01-01',
              currency: 'EUR',
              list: ['a', 'b'],
              bad: [1],
              none: null,
            },
          ],
        },
      ],
    })
    expect(read.title).toBe('T')
    expect(read.description).toBeUndefined()
    expect(read.submitLabel).toBe('Go')
    expect(read.sections.map((s) => [s.id, s.columns])).toEqual([
      ['x', 3],
      ['x-3', undefined],
    ])
    expect(read.sections[0].fields[0]).toEqual({ name: 'a', type: 'text', label: 'a', span: 2 })
    expect(read.sections[1].fields[0]).toEqual({
      name: 'b',
      type: 'select',
      label: 'b',
      min: '2026-01-01',
      options: [],
      currency: 'EUR',
      list: ['a', 'b'],
    })
    expect(issues).toEqual([
      { path: 'sections[0]', code: 'notObject' },
      { path: 'sections[2].fields[0]', code: 'noOptions', detail: 'b' },
    ])
  })

  it('writes every kind of field to JSON Schema', () => {
    const { schema, uiSchema } = toJSONSchema({
      version: 1,
      description: 'D',
      sections: [
        {
          id: 'main',
          fields: [
            { name: 'on', type: 'checkbox', label: 'On', defaultValue: true },
            { name: 'period', type: 'daterange', label: 'Period' },
            { name: 'files', type: 'file', label: 'Files' },
            { name: 'price', type: 'money', label: 'Price', min: 0, step: 0.01 },
            { name: 'when', type: 'date', label: 'When', min: '2026-01-01', max: '2026-12-31' },
            {
              name: 'tags',
              type: 'tags',
              label: 'Tags',
              options: [{ value: 'a', label: 'A' }],
              placeholder: 'Pick',
            },
          ],
        },
      ],
    })
    const p = schema.properties as Record<string, Record<string, unknown>>
    expect(schema.description).toBe('D')
    expect(schema.required).toBeUndefined()
    expect(p.on).toEqual({ title: 'On', type: 'boolean', default: true })
    expect(p.period).toMatchObject({ type: 'object' })
    expect(p.files).toEqual({
      title: 'Files',
      type: 'array',
      items: { type: 'string', contentEncoding: 'binary' },
    })
    expect(p.price).toEqual({ title: 'Price', type: 'number', minimum: 0, multipleOf: 0.01 })
    expect(p.when).toEqual({
      title: 'When',
      type: 'string',
      format: 'date',
      formatMinimum: '2026-01-01',
      formatMaximum: '2026-12-31',
    })
    expect(p.tags).toEqual({
      title: 'Tags',
      type: 'array',
      items: { oneOf: [{ const: 'a', title: 'A' }] },
    })
    expect(uiSchema.tags).toEqual({ 'ui:widget': 'tags', 'ui:placeholder': 'Pick' })
  })

  it('reads a schema with oneOf options, formats, widgets and nested objects only', () => {
    const { spec: read } = fromJSONSchema(
      {
        type: 'object',
        properties: {
          site: { type: 'string', format: 'uri' },
          size: { type: 'string', oneOf: [{ const: 's', title: 'Small' }, 'junk'] },
          words: { type: 'array', items: { type: 'string' } },
          n: { type: 'number', multipleOf: 5 },
          color: { type: 'string' },
          skip: true,
          deep: { type: 'object', properties: { inner: { type: 'object', properties: {} } } },
        },
      },
      { color: { 'ui:widget': 'radio', 'ui:options': { inline: true } }, n: { 'ui:widget': 'x' } },
    )
    const fields = read.sections[0].fields
    expect(fields.map((f) => [f.name, f.type])).toEqual([
      ['site', 'url'],
      ['size', 'select'],
      ['words', 'tags'],
      ['n', 'number'],
      ['color', 'radio'],
    ])
    expect(fields[3]).toMatchObject({ step: 5 })
    expect(fields[4]).toMatchObject({ inline: true })
    expect(read.sections.map((s) => s.id)).toEqual(['main', 'inner', 'deep'])
    expect(fromJSONSchema('nope').issues).toEqual([{ path: '', code: 'notObject' }])
    expect(
      fromJSONSchema({ type: 'object', properties: { o: { type: 'object' } } }).spec.sections.map(
        (s) => s.id,
      ),
    ).toEqual(['o'])
  })
})
