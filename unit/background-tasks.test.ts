import { describe, expect, it } from 'vitest'

import {
  type BackgroundTask,
  countActiveTasks,
  endedTasks,
  sortBackgroundTasks,
} from '@/components/background-tasks'

const task = (id: string, status: BackgroundTask['status'], extra: Partial<BackgroundTask> = {}) =>
  ({ id, label: id, status, ...extra }) satisfies BackgroundTask

describe('sortBackgroundTasks', () => {
  it('puts running, then queued, then finished most recent first', () => {
    const sorted = sortBackgroundTasks([
      task('old-done', 'done', { finishedAt: '2026-10-14T08:00:00Z' }),
      task('q1', 'queued'),
      task('new-failed', 'failed', { finishedAt: new Date('2026-10-14T09:00:00Z') }),
      task('r1', 'running'),
      task('q2', 'queued'),
      task('r2', 'running'),
    ])
    expect(sorted.map((t) => t.id)).toEqual(['r1', 'r2', 'q1', 'q2', 'new-failed', 'old-done'])
  })

  it('falls back to startedAt, and puts undated or unreadable dates last', () => {
    const sorted = sortBackgroundTasks([
      task('none', 'done'),
      task('bad', 'done', { finishedAt: 'not a date' }),
      task('started', 'done', { startedAt: '2026-10-14T07:00:00Z' }),
    ])
    expect(sorted[0]?.id).toBe('started')
  })

  it('does not change the array it is given', () => {
    const tasks = [task('d', 'done'), task('r', 'running')]
    sortBackgroundTasks(tasks)
    expect(tasks.map((t) => t.id)).toEqual(['d', 'r'])
  })
})

describe('countActiveTasks', () => {
  it('counts queued and running only', () => {
    expect(countActiveTasks([])).toBe(0)
    expect(
      countActiveTasks([
        task('a', 'queued'),
        task('b', 'running'),
        task('c', 'done'),
        task('d', 'failed'),
      ]),
    ).toBe(2)
  })
})

describe('endedTasks', () => {
  it('returns the tasks that went from active to done or failed', () => {
    const before = [task('a', 'running'), task('b', 'queued'), task('c', 'running')]
    const after = [task('a', 'done'), task('b', 'failed'), task('c', 'running')]
    expect(endedTasks(before, after).map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('ignores tasks that were already finished, or first seen finished', () => {
    expect(endedTasks([task('a', 'done')], [task('a', 'done'), task('new', 'failed')])).toEqual([])
  })

  it('ignores a queued task that starts running, and a task that disappears', () => {
    expect(endedTasks([task('a', 'queued'), task('b', 'running')], [task('a', 'running')])).toEqual(
      [],
    )
  })
})
