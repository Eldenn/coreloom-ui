// Agent plans: reading a plan from untrusted data (a `data-plan` part, another agent's todo list)
// and measuring how far it is.
import { describe, expect, it } from 'vitest'

import { planProgress, readPlan } from '@/lib/ai'

describe('readPlan', () => {
  it('reads a well-formed plan as it is', () => {
    const plan = {
      title: 'Fix the deploy',
      steps: [
        { id: '1', title: 'Read the logs', status: 'done', detail: 'Found a timeout' },
        { id: '2', title: 'Roll back', status: 'running' },
        { id: '3', title: 'Write the postmortem', status: 'pending' },
      ],
    }
    expect(readPlan(plan)).toEqual(plan)
  })

  it('maps other agents’ statuses and falls back to pending', () => {
    const plan = readPlan({
      steps: [
        { content: 'A', status: 'completed' },
        { content: 'B', status: 'in_progress' },
        { content: 'C', status: 'IN-PROGRESS' },
        { content: 'D', status: 'cancelled' },
        { content: 'E', status: 'error' },
        { content: 'F', status: 'whatever' },
        { content: 'G' },
      ],
    })
    expect(plan?.steps.map((s) => s.status)).toEqual([
      'done',
      'running',
      'running',
      'skipped',
      'failed',
      'pending',
      'pending',
    ])
  })

  it('uses the position when a step has no id, and numbers as ids', () => {
    const plan = readPlan({ steps: [{ title: 'A' }, { id: 7, title: 'B' }] })
    expect(plan?.steps.map((s) => s.id)).toEqual(['0', '7'])
  })

  it('drops steps without a title and keeps hostile text as text', () => {
    const plan = readPlan({
      title: 42,
      steps: [
        null,
        'step',
        { title: '' },
        { title: '   ' },
        { title: '<img src=x onerror=alert(1)>' },
      ],
    })
    expect(plan).toEqual({
      steps: [{ id: '4', title: '<img src=x onerror=alert(1)>', status: 'pending' }],
    })
  })

  it('returns undefined for anything that is not a plan', () => {
    for (const value of [undefined, null, 'plan', 3, [], { steps: 'no' }, { title: 'x' }])
      expect(readPlan(value)).toBeUndefined()
  })
})

describe('planProgress', () => {
  it('counts done and skipped steps as finished, and finds the running and failed steps', () => {
    const progress = planProgress({
      steps: [
        { id: '1', title: 'A', status: 'done' },
        { id: '2', title: 'B', status: 'skipped' },
        { id: '3', title: 'C', status: 'running' },
        { id: '4', title: 'D', status: 'failed' },
      ],
    })
    expect(progress.finished).toBe(2)
    expect(progress.total).toBe(4)
    expect(progress.current?.id).toBe('3')
    expect(progress.failed?.id).toBe('4')
    expect(progress.complete).toBe(false)
  })

  it('is complete once every step is finished, never when empty', () => {
    expect(planProgress({ steps: [{ id: '1', title: 'A', status: 'done' }] }).complete).toBe(true)
    expect(planProgress({ steps: [] }).complete).toBe(false)
  })
})
