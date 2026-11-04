import { describe, expect, it } from 'vitest'

import { agentAvatarLook } from '@/components/ui/agent-avatar'
import { agentAvatarState } from '@/components/ui/agent-graph'

describe('agentAvatarLook', () => {
  it('gives the same look to the same seed', () => {
    expect(agentAvatarLook('researcher')).toEqual(agentAvatarLook('researcher'))
  })

  it('spreads close seeds over several tones and eyes', () => {
    const looks = Array.from({ length: 40 }, (_, i) => agentAvatarLook(`agent-${String(i)}`))
    expect(new Set(looks.map((l) => l.tone)).size).toBe(4)
    expect(new Set(looks.map((l) => l.eyes)).size).toBe(3)
  })

  it('starts each agent at its own point of the idle loops', () => {
    const phases = Array.from({ length: 20 }, (_, i) => agentAvatarLook(`agent-${String(i)}`).phase)
    expect(new Set(phases).size).toBeGreaterThan(15)
    for (const p of phases) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThan(5000)
    }
  })

  it('never picks pink, kept apart from the error colour', () => {
    for (let i = 0; i < 200; i++) expect(agentAvatarLook(String(i)).tone).not.toBe('pink')
  })

  it('takes empty, long and non-Latin seeds', () => {
    for (const seed of ['', 'x'.repeat(10_000), 'エージェント', '🤖', '\u0000'])
      expect(agentAvatarLook(seed)).toMatchObject({
        tone: expect.any(String) as string,
        eyes: expect.any(String) as string,
      })
  })
})

describe('agentAvatarState', () => {
  const node = { id: 'a', name: 'A' }
  it('maps a run activity to a face', () => {
    expect(agentAvatarState(node, 'working')).toBe('thinking')
    expect(agentAvatarState(node, 'waiting')).toBe('idle')
    expect(agentAvatarState(node, 'done')).toBe('done')
    expect(agentAvatarState(node, 'failed')).toBe('error')
  })
  it('sleeps when paused and out of a run', () => {
    expect(agentAvatarState({ ...node, status: 'paused' })).toBe('offline')
    expect(agentAvatarState({ ...node, status: 'paused' }, 'working')).toBe('thinking')
    expect(agentAvatarState(node)).toBe('idle')
  })
})
