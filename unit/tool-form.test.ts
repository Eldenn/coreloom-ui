// Tool forms: the fields a model sends are untrusted, so they're read defensively; the answer is
// validated before it goes back to the tool.
import { describe, expect, it } from 'vitest'

import {
  readToolFormFields,
  type ToolFormField,
  toolFormValues,
  validateToolForm,
} from '@/components/ui/tool-form'

describe('readToolFormFields', () => {
  it('reads each field type', () => {
    const fields = readToolFormFields([
      { name: 'title', label: 'Title', required: true, maxLength: 80 },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'guests', label: 'Guests', type: 'number', min: 1, max: 12 },
      { name: 'day', label: 'Day', type: 'date', min: '2026-10-15', defaultValue: '2026-10-20' },
      {
        name: 'room',
        label: 'Room',
        type: 'select',
        options: ['Lyon', { value: 'p', label: 'Paris' }],
      },
      { name: 'remind', label: 'Remind me', type: 'checkbox', defaultValue: true },
    ])
    expect(fields).toEqual([
      { name: 'title', label: 'Title', required: true, type: 'text', maxLength: 80 },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'guests', label: 'Guests', type: 'number', min: 1, max: 12 },
      { name: 'day', label: 'Day', type: 'date', min: '2026-10-15', defaultValue: '2026-10-20' },
      {
        name: 'room',
        label: 'Room',
        type: 'select',
        options: [
          { value: 'Lyon', label: 'Lyon' },
          { value: 'p', label: 'Paris' },
        ],
      },
      { name: 'remind', label: 'Remind me', type: 'checkbox', defaultValue: true },
    ])
  })

  it('drops fields without a usable name, duplicates and junk', () => {
    const fields = readToolFormFields([
      null,
      'name',
      { label: 'No name' },
      { name: 'has space' },
      { name: '"><script>' },
      { name: 'ok' },
      { name: 'ok', label: 'Again' },
    ])
    expect(fields).toEqual([{ name: 'ok', label: 'ok', type: 'text' }])
  })

  it('turns unknown types into text, and a choice without options into text', () => {
    expect(readToolFormFields([{ name: 'a', type: 'password' }])[0]?.type).toBe('text')
    expect(readToolFormFields([{ name: 'b', type: 'select', options: [] }])[0]?.type).toBe('text')
  })

  it('ignores malformed limits and defaults', () => {
    expect(
      readToolFormFields([
        { name: 'n', type: 'number', min: '1', max: Infinity, defaultValue: 'x' },
        { name: 'd', type: 'date', min: '15/10/2026', defaultValue: 20261020 },
        { name: 's', type: 'select', options: ['a'], defaultValue: 'b' },
      ]),
    ).toEqual([
      { name: 'n', label: 'n', type: 'number' },
      { name: 'd', label: 'd', type: 'date' },
      { name: 's', label: 's', type: 'select', options: [{ value: 'a', label: 'a' }] },
    ])
  })

  it('keeps at most 20 fields and returns nothing for a non-array', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ name: `f${String(i)}` }))
    expect(readToolFormFields(many)).toHaveLength(20)
    expect(readToolFormFields({ name: 'a' })).toEqual([])
  })
})

const fields: ToolFormField[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'site', label: 'Site', type: 'url' },
  { name: 'guests', label: 'Guests', type: 'number', min: 1, max: 12 },
  { name: 'day', label: 'Day', type: 'date', min: '2026-10-15', max: '2026-12-31' },
  { name: 'room', label: 'Room', type: 'select', options: [{ value: 'lyon', label: 'Lyon' }] },
  { name: 'agree', label: 'I agree', type: 'checkbox', required: true },
]

describe('validateToolForm', () => {
  it('asks for required fields, and lets optional ones stay empty', () => {
    expect(validateToolForm(fields, {})).toEqual({
      title: { type: 'required' },
      agree: { type: 'required' },
    })
    expect(validateToolForm(fields, { title: '   ', agree: true })).toEqual({
      title: { type: 'required' },
    })
  })

  it('checks emails, web addresses, numbers, date ranges and choices', () => {
    expect(
      validateToolForm(fields, {
        title: 'Review',
        agree: true,
        email: 'ana@',
        site: 'javascript:alert(1)',
        guests: '20',
        day: '2026-10-01',
        room: 'paris',
      }),
    ).toEqual({
      email: { type: 'email' },
      site: { type: 'url' },
      guests: { type: 'max', limit: 12 },
      day: { type: 'min', limit: '2026-10-15' },
      room: { type: 'required' },
    })
    expect(validateToolForm(fields, { title: 'x', agree: true, guests: 'abc' })).toEqual({
      guests: { type: 'number' },
    })
    expect(validateToolForm(fields, { title: 'x', agree: true, guests: '0' })).toEqual({
      guests: { type: 'min', limit: 1 },
    })
  })

  it('accepts a valid answer', () => {
    expect(
      validateToolForm(fields, {
        title: 'Review',
        agree: true,
        email: 'ana@example.com',
        site: 'https://coreloom.dev',
        guests: '3',
        day: '2026-10-20',
        room: 'lyon',
      }),
    ).toEqual({})
  })
})

describe('toolFormValues', () => {
  it('sends numbers as numbers, trims text and sends empty optional fields as null', () => {
    expect(
      toolFormValues(fields, { title: ' Review ', guests: '3', day: '2026-10-20', agree: true }),
    ).toEqual({
      title: 'Review',
      email: null,
      site: null,
      guests: 3,
      day: '2026-10-20',
      room: null,
      agree: true,
    })
  })
})
