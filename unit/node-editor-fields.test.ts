import { describe, expect, it } from 'vitest'

import { type NodeKind, validateWorkflow, type Workflow } from '@/components/ui/node-editor'
import {
  dataPaths,
  evaluateConditions,
  jsonError,
  keyValuesToObject,
  readPath,
  resolveExpression,
} from '@/components/ui/node-editor-fields'

const input = [
  { email: 'ada@analytical.io', company: { name: 'Analytical', size: 42 }, tags: ['a'] },
]

describe('resolveExpression', () => {
  it('fills paths from the first input item, the app’s variables and other nodes', () => {
    const scope = {
      input,
      variables: { topic: 'engines' },
      nodes: { http: [{ status: 200 }] },
    }
    expect(
      resolveExpression('Hi {{ company.name }} · {{topic}} · {{ $node.http.status }}', scope),
    ).toEqual({
      text: 'Hi Analytical · engines · 200',
      value: 'Hi Analytical · engines · 200',
      missing: [],
    })
  })

  it('keeps the raw value of a lone expression, and lists what it can’t find', () => {
    expect(resolveExpression('{{ company.size }}', { input }).value).toBe(42)
    expect(resolveExpression('{{ company }}', { input }).text).toBe(
      '{"name":"Analytical","size":42}',
    )
    const r = resolveExpression('{{ nope }} and {{ $node.ghost.x }}', { input })
    expect(r.missing).toEqual(['nope', '$node.ghost.x'])
    expect(r.text).toBe('{{ nope }} and {{ $node.ghost.x }}')
  })

  it('reads own keys only: no prototype walking, nothing evaluated', () => {
    expect(readPath({}, '__proto__.polluted').found).toBe(false)
    expect(readPath({ a: {} }, 'a.constructor').found).toBe(false)
    expect(readPath({ a: 1 }, 'toString').found).toBe(false)
    expect(resolveExpression('{{ 1 + 1 }}', { input: {} }).missing).toEqual(['1 + 1'])
    expect(resolveExpression('{{ alert(1) }}', { input: {} }).text).toBe('{{ alert(1) }}')
  })

  it('reads indexes and quoted keys', () => {
    expect(readPath({ a: [{ 'b c': 1 }] }, "a[0]['b c']")).toEqual({ found: true, value: 1 })
    expect(readPath({ a: [1] }, 'a[3]').found).toBe(false)
  })
})

describe('dataPaths', () => {
  it('lists nested paths of the first item', () => {
    expect(dataPaths(input).map((p) => p.path)).toEqual([
      'email',
      'company',
      'company.name',
      'company.size',
      'tags',
    ])
  })
  it('quotes keys that aren’t identifiers, and stops at the limit', () => {
    expect(dataPaths({ 'first name': 1 }).map((p) => p.path)).toEqual(["['first name']"])
    const big = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [`k${String(i)}`, i]))
    expect(dataPaths(big)).toHaveLength(100)
    expect(dataPaths('text')).toEqual([])
  })
})

describe('evaluateConditions', () => {
  const scope = { input }
  const rule = (left: string, operator: string, right = '') => ({ left, operator, right })
  it('compares text and numbers', () => {
    expect(
      evaluateConditions(
        { combinator: 'and', rules: [rule('{{ email }}', 'endsWith', '.io')] },
        scope,
      ),
    ).toBe(true)
    expect(
      evaluateConditions(
        { combinator: 'and', rules: [rule('{{ company.size }}', 'gt', '9')] },
        scope,
      ),
    ).toBe(true)
    expect(
      evaluateConditions(
        { combinator: 'and', rules: [rule('{{ tags }}', 'contains', 'a')] },
        scope,
      ),
    ).toBe(true)
    expect(
      evaluateConditions(
        { combinator: 'and', rules: [rule('{{ company.name }}', 'isEmpty')] },
        scope,
      ),
    ).toBe(false)
  })
  it('all or any; unknown when a value is missing or there is no rule', () => {
    const rules = [
      rule('{{ email }}', 'contains', 'gmail'),
      rule('{{ company.size }}', 'equals', '42'),
    ]
    expect(evaluateConditions({ combinator: 'and', rules }, scope)).toBe(false)
    expect(evaluateConditions({ combinator: 'or', rules }, scope)).toBe(true)
    expect(
      evaluateConditions({ combinator: 'and', rules: [rule('{{ ghost }}', 'equals', 'x')] }, scope),
    ).toBe(null)
    expect(evaluateConditions({ combinator: 'and', rules: [] }, scope)).toBe(null)
    expect(evaluateConditions('garbage', scope)).toBe(null)
  })
})

describe('keyValuesToObject and jsonError', () => {
  it('builds an object, skipping empty and dangerous keys', () => {
    const rows = [
      { key: 'domain', value: '{{ company.name }}' },
      { key: ' ', value: 'x' },
      { key: '__proto__', value: 'x' },
      'junk',
    ]
    expect(keyValuesToObject(rows, { input })).toEqual({ domain: 'Analytical' })
    expect(keyValuesToObject(rows)).toEqual({ domain: '{{ company.name }}' })
  })
  it('checks JSON', () => {
    expect(jsonError('{"a":1}')).toBeNull()
    expect(jsonError('')).toBeNull()
    expect(jsonError('{ "a": ')).toEqual(expect.any(String))
  })
})

describe('validateWorkflow with richer fields', () => {
  const kinds: NodeKind[] = [
    {
      type: 'step',
      label: 'Step',
      inputs: [],
      fields: [
        { name: 'when', label: 'When', type: 'conditions', required: true },
        { name: 'headers', label: 'Headers', type: 'keyValue', required: true },
        { name: 'body', label: 'Body', type: 'code' },
        { name: 'script', label: 'Script', type: 'code', language: 'javascript' },
      ],
    },
  ]
  const wf = (data: Record<string, unknown>): Workflow => ({
    nodes: [{ id: 's', type: 'step', position: { x: 0, y: 0 }, data }],
    edges: [],
  })
  it('flags empty conditions and rows, and JSON that doesn’t parse', () => {
    expect(
      validateWorkflow(
        wf({
          when: { combinator: 'and', rules: [{ left: ' ' }] },
          headers: [{ key: '', value: 'x' }],
          body: '{',
          script: '{',
        }),
        kinds,
      ),
    ).toEqual([
      { nodeId: 's', code: 'required', field: 'when' },
      { nodeId: 's', code: 'required', field: 'headers' },
      { nodeId: 's', code: 'invalid', field: 'body' },
    ])
    expect(
      validateWorkflow(
        wf({
          when: { rules: [{ left: '{{ a }}' }] },
          headers: [{ key: 'a', value: '' }],
          body: '{}',
        }),
        kinds,
      ),
    ).toEqual([])
  })
})
