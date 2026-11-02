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
