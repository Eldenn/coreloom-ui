import { describe, expect, it } from 'vitest'

import { toggleChoice } from '@/components/ui/form'

describe('toggleChoice', () => {
  const exclusive = ['none']

  it('adds a ticked value at the end and removes an unticked one', () => {
    expect(toggleChoice({ picked: ['a'], value: 'b', checked: true, exclusive })).toEqual([
      'a',
      'b',
    ])
    expect(toggleChoice({ picked: ['a', 'b'], value: 'a', checked: false, exclusive })).toEqual([
      'b',
    ])
  })

  it('keeps a value once when it is ticked again', () => {
    expect(toggleChoice({ picked: ['a', 'b'], value: 'a', checked: true, exclusive })).toEqual([
      'b',
      'a',
    ])
  })

  it('clears the other values when an exclusive one is ticked', () => {
    expect(toggleChoice({ picked: ['a', 'b'], value: 'none', checked: true, exclusive })).toEqual([
      'none',
    ])
  })

  it('clears the exclusive value when another one is ticked', () => {
    expect(toggleChoice({ picked: ['none'], value: 'a', checked: true, exclusive })).toEqual(['a'])
  })

  it('leaves an empty list when the last value is unticked', () => {
    expect(toggleChoice({ picked: ['none'], value: 'none', checked: false, exclusive })).toEqual([])
  })

  it('works without exclusive values', () => {
    expect(toggleChoice({ picked: [], value: 'a', checked: true, exclusive: [] })).toEqual(['a'])
  })
})
