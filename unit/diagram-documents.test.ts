// The diagram viewer's file names and view steps.
import { describe, expect, it } from 'vitest'

import { fileSlug, stepView } from '@/components/diagram-viewer'

describe('fileSlug', () => {
  it('makes a file name from a title', () => {
    expect(fileSlug('Order flow (v2)')).toBe('order-flow-v2')
    expect(fileSlug('Modèle de données')).toBe('modele-de-donnees')
  })

  it('falls back when nothing is left', () => {
    expect(fileSlug('—')).toBe('diagram')
    expect(fileSlug('')).toBe('diagram')
  })

  it('keeps nothing that could escape a file name', () => {
    expect(fileSlug('../../etc/passwd')).toBe('etc-passwd')
  })
})

describe('stepView', () => {
  const ids = ['a', 'b', 'c']

  it('goes to the next or previous view', () => {
    expect(stepView(ids, 'b', 1)).toBe('c')
    expect(stepView(ids, 'b', -1)).toBe('a')
  })

  it('stops at either end', () => {
    expect(stepView(ids, 'c', 1)).toBeNull()
    expect(stepView(ids, 'a', -1)).toBeNull()
  })

  it('has nowhere to go from an unknown view backwards', () => {
    expect(stepView(ids, 'x', -1)).toBeNull()
  })
})
