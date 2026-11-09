import { describe, expect, it } from 'vitest'

import {
  agentRunMetrics,
  replayDuration,
  type ReplaySpan,
  replaySteps,
  spansAt,
} from '@/components/ai-agent-replay'
import { compareEnvironments } from '@/components/env-vars'
import {
  evaluateFeatureFlag,
  type FeatureFlagState,
  rolloutBucket,
} from '@/components/feature-flag-rules'
import { flagKeyFromName } from '@/components/feature-flags'
import {
  type NotificationEvent,
  setNotificationChannel,
  setNotificationChannelForAll,
} from '@/components/notification-preferences'
import { sqlResultToCsv } from '@/components/sql-explorer'
import { clampCrop, cropRect, visibleFraction } from '@/components/ui/image-crop'
import { loadMoreStatus } from '@/components/ui/load-more'
import { cursorPosition, presenceColor } from '@/components/ui/presence'
import { comparedVersion, groupVersionsByDay } from '@/components/version-history'
import { parseDotenv } from '@/lib/dotenv'

describe('parseDotenv', () => {
  it('reads keys, export, comments, quotes and escapes', () => {
    const { entries, errors } = parseDotenv(
      [
        '# Database',
        'DATABASE_URL=postgres://localhost:5432/app',
        '',
        'export API_KEY = "cl_live_abc"',
        "SINGLE='keep \\n as is'",
        'MULTI="line one\\nline two"',
        'QUOTED="has # hash"',
        'INLINE=value # a comment',
        'EMPTY=',
        'TEMPLATE=`back ticks`',
      ].join('\r\n'),
    )
    expect(errors).toEqual([])
    expect(Object.fromEntries(entries.map((e) => [e.key, e.value]))).toEqual({
      DATABASE_URL: 'postgres://localhost:5432/app',
      API_KEY: 'cl_live_abc',
      SINGLE: 'keep \\n as is',
      MULTI: 'line one\nline two',
      QUOTED: 'has # hash',
      INLINE: 'value',
      EMPTY: '',
      TEMPLATE: 'back ticks',
    })
  })

  it('keeps the last value of a repeated key, in its last position', () => {
    const { entries } = parseDotenv('A=1\nB=2\nA=3')
    expect(entries).toEqual([
      { key: 'B', value: '2' },
      { key: 'A', value: '3' },
    ])
  })

  it('lists the lines it cannot read instead of throwing', () => {
    const { entries, errors } = parseDotenv('OK=1\nnot a line\n1BAD=x\nOPEN="no end\n=nokey')
    expect(entries).toEqual([{ key: 'OK', value: '1' }])
    expect(errors.map((e) => e.line)).toEqual([2, 3, 4, 5])
  })

  it('reads nothing from an empty or comment-only text', () => {
    expect(parseDotenv('')).toEqual({ entries: [], errors: [] })
    expect(parseDotenv('# only\n   \n#  comments')).toEqual({ entries: [], errors: [] })
  })
})

describe('compareEnvironments', () => {
  it('says same, different or missing, and where it is missing', () => {
    const rows = compareEnvironments(
      [
        { key: 'A', values: { prod: '1', dev: '1' } },
        { key: 'B', values: { prod: '1', dev: '2' } },
        { key: 'C', values: { prod: '1' } },
      ],
      ['prod', 'dev'],
    )
    expect(rows).toEqual([
      { key: 'A', status: 'same', missing: [] },
      { key: 'B', status: 'different', missing: [] },
      { key: 'C', status: 'missing', missing: ['dev'] },
    ])
  })
})

describe('feature flags', () => {
  const state: FeatureFlagState = {
    enabled: true,
    rollout: 30,
    rules: [
      {
        id: 'staff',
        attribute: 'email',
        operator: 'contains',
        values: ['@coreloom.dev'],
        serve: true,
      },
      { id: 'eu', attribute: 'country', operator: 'in', values: ['DE', 'at'], serve: false },
      { id: 'beta', attribute: 'plan', operator: 'not-in', values: ['free'], serve: true },
    ],
  }

  it('is off when disabled, whatever the rules', () => {
    expect(
      evaluateFeatureFlag('f', { ...state, enabled: false }, { email: 'a@coreloom.dev' }),
    ).toEqual({ value: false, reason: 'disabled' })
  })

  it('takes the first matching rule, case-insensitively', () => {
    expect(evaluateFeatureFlag('f', state, { email: 'Ada@Coreloom.dev', country: 'DE' })).toEqual({
      value: true,
      reason: 'rule',
      ruleId: 'staff',
    })
    expect(evaluateFeatureFlag('f', state, { country: 'AT', plan: 'free' })).toMatchObject({
      value: false,
      ruleId: 'eu',
    })
  })

  it('matches not-in when the attribute is missing', () => {
    expect(evaluateFeatureFlag('f', state, { id: 'u1' })).toMatchObject({ ruleId: 'beta' })
  })

  it('falls back to a stable rollout bucket', () => {
    const plain: FeatureFlagState = { enabled: true, rollout: 30, rules: [] }
    const result = evaluateFeatureFlag('new-checkout', plain, { id: 'user-42' })
    expect(result.reason).toBe('rollout')
    expect(result).toEqual(evaluateFeatureFlag('new-checkout', plain, { id: 'user-42' }))
    const bucket = rolloutBucket('new-checkout', 'user-42')
    expect(result.value).toBe(bucket < 30)
    // Growing the rollout never takes the flag away from someone who had it.
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const at30 = evaluateFeatureFlag('k', plain, { id }).value
      const at60 = evaluateFeatureFlag('k', { ...plain, rollout: 60 }, { id }).value
      expect(at30 && !at60).toBe(false)
    }
  })

  it('spreads buckets over 0–99', () => {
    const buckets = Array.from({ length: 2000 }, (_, i) =>
      rolloutBucket('flag', `user-${String(i)}`),
    )
    expect(Math.min(...buckets)).toBe(0)
    expect(Math.max(...buckets)).toBe(99)
    const under30 = buckets.filter((b) => b < 30).length / buckets.length
    expect(under30).toBeGreaterThan(0.25)
    expect(under30).toBeLessThan(0.35)
  })

  it('suggests a key from a name', () => {
    expect(flagKeyFromName('New checkout')).toBe('new-checkout')
    expect(flagKeyFromName('  Été 2026 — Résumés IA!  ')).toBe('ete-2026-resumes-ia')
    expect(flagKeyFromName('***')).toBe('')
  })
})

describe('notification preferences', () => {
  const events: NotificationEvent[] = [
    { id: 'mention', label: 'Mentions' },
    { id: 'login', label: 'Sign-in', required: ['email'] },
    { id: 'weekly', label: 'Weekly', unavailable: ['push'] },
  ]

  it('turns one cell on and off, leaving locked cells alone', () => {
    const on = setNotificationChannel({}, events[0], 'push', true)
    expect(on).toEqual({ mention: ['push'] })
    expect(setNotificationChannel(on, events[0], 'push', false)).toEqual({ mention: [] })
    expect(setNotificationChannel(on, events[1], 'email', false)).toBe(on)
    expect(setNotificationChannel(on, events[2], 'push', true)).toBe(on)
    // No change, same object: nothing to save.
    expect(setNotificationChannel(on, events[0], 'push', true)).toBe(on)
  })

  it('switches a channel for every event that offers it', () => {
    expect(setNotificationChannelForAll({}, events, 'push', true)).toEqual({
      mention: ['push'],
      login: ['push'],
    })
    expect(setNotificationChannelForAll({ weekly: ['email'] }, events, 'email', false)).toEqual({
      weekly: [],
    })
  })
})

describe('version history', () => {
  const v = (id: string, day: number, hour: number) => ({
    id,
    createdAt: new Date(2026, 9, day, hour),
  })
  const versions = [v('a', 10, 9), v('c', 13, 17), v('b', 13, 9), v('d', 14, 10)]

  it('groups by day, newest first', () => {
    expect(groupVersionsByDay(versions).map((g) => g.versions.map((x) => x.id))).toEqual([
      ['d'],
      ['c', 'b'],
      ['a'],
    ])
  })

  it('compares with the version before, the newest, or nothing', () => {
    const b = versions[2]
    expect(comparedVersion(versions, b, 'previous')?.id).toBe('a')
    expect(comparedVersion(versions, b, 'current')?.id).toBe('d')
    expect(comparedVersion(versions, b, 'none')).toBeUndefined()
    expect(comparedVersion(versions, versions[0], 'previous')).toBeUndefined()
    expect(comparedVersion(versions, versions[3], 'current')).toBeUndefined()
  })
})

describe('sqlResultToCsv', () => {
  it('quotes when needed, empties NULL, and neutralises formulas', () => {
    const csv = sqlResultToCsv({
      columns: ['id', 'name', 'note', 'data'],
      rows: [
        [1, 'Ada, Countess', null, { ok: true }],
        [2, 'say "hi"', '=HYPERLINK("x")', [1, 2]],
        [-3, 'line\nbreak', '@sum', undefined],
      ],
    })
    expect(csv.split('\r\n')).toEqual([
      'id,name,note,data',
      '1,"Ada, Countess",,"{""ok"":true}"',
      `2,"say ""hi""","'=HYPERLINK(""x"")","[1,2]"`,
      `-3,"line\nbreak",'@sum,`,
    ])
  })
})

describe('image crop', () => {
  const wide = { width: 1000, height: 500 }

  it('covers the frame at zoom 1', () => {
    expect(visibleFraction(wide, 1, 1)).toEqual({ w: 0.5, h: 1 })
    expect(visibleFraction(wide, 4, 1)).toEqual({ w: 1, h: 0.5 })
    expect(visibleFraction(wide, 1, 2)).toEqual({ w: 0.25, h: 0.5 })
  })

  it('keeps the frame inside the image and the zoom between 1 and 4', () => {
    expect(clampCrop({ x: 0, y: 0, zoom: 0.2 }, wide, 1)).toEqual({ x: 0.25, y: 0.5, zoom: 1 })
    expect(clampCrop({ x: 2, y: 2, zoom: 9 }, wide, 1)).toEqual({ x: 0.9375, y: 0.875, zoom: 4 })
  })

  it('gives the framed part in the image’s pixels', () => {
    expect(cropRect({ x: 0.5, y: 0.5, zoom: 1 }, wide, 1)).toEqual({
      x: 250,
      y: 0,
      width: 500,
      height: 500,
    })
    expect(cropRect({ x: 1, y: 0, zoom: 2 }, wide, 1)).toEqual({
      x: 750,
      y: 0,
      width: 250,
      height: 250,
    })
  })
})

describe('agent run replay', () => {
  const agents = [
    { id: 'lead', name: 'Lead' },
    { id: 'worker', name: 'Worker' },
  ]
  const spans: ReplaySpan[] = [
    {
      id: 'a1',
      kind: 'agent',
      name: 'Lead',
      agentId: 'lead',
      startMs: 0,
      durationMs: 1000,
      status: 'ok',
      tokens: { input: 10, output: 5 },
      cost: 0.01,
    },
    {
      id: 'a2',
      parentId: 'a1',
      kind: 'agent',
      name: 'Worker',
      startMs: 200,
      durationMs: 500,
      status: 'ok',
      tokens: { input: 20, output: 10 },
    },
    {
      id: 't1',
      parentId: 'a2',
      kind: 'tool',
      name: 'search',
      startMs: 300,
      durationMs: 100,
      status: 'error',
      cost: 0.002,
    },
    {
      id: 'a3',
      parentId: 'a1',
      kind: 'agent',
      name: 'Lead',
      agentId: 'lead',
      startMs: 800,
      durationMs: 150,
      status: 'ok',
    },
    {
      id: 'x',
      parentId: 'nowhere',
      kind: 'tool',
      name: 'orphan',
      startMs: 900,
      durationMs: 400,
      status: 'ok',
    },
  ]

  it('knows when the run ends and what was running at a moment', () => {
    expect(replayDuration(spans)).toBe(1300)
    const at350 = spansAt(spans, 350)
    expect(at350.map((s) => [s.id, s.status])).toEqual([
      ['a1', 'running'],
      ['a2', 'running'],
      ['t1', 'running'],
    ])
    expect(spansAt(spans, 450).find((s) => s.id === 't1')?.status).toBe('error')
    expect(spansAt(spans, -1)).toEqual([])
  })

  it('numbers the turns as the work moves between agents', () => {
    expect(replaySteps(spans, agents)).toEqual([
      { n: 1, agentId: 'lead', startMs: 0 },
      { n: 2, agentId: 'worker', startMs: 200 },
      { n: 3, agentId: 'lead', startMs: 800 },
    ])
  })

  it('adds up each agent’s turns, time, tokens, tools, cost and errors', () => {
    const metrics = agentRunMetrics(spans, agents)
    expect(metrics).toEqual([
      {
        agentId: 'lead',
        turns: 2,
        durationMs: 1150,
        tokens: 15,
        cost: 0.01,
        toolCalls: 0,
        errors: 0,
      },
      {
        agentId: 'worker',
        turns: 1,
        durationMs: 500,
        tokens: 30,
        cost: 0.002,
        toolCalls: 1,
        errors: 1,
      },
    ])
  })

  it('survives a loop in parent ids', () => {
    const loop: ReplaySpan[] = [
      { id: 'p', parentId: 'q', kind: 'tool', name: 't', startMs: 0, durationMs: 1, status: 'ok' },
      { id: 'q', parentId: 'p', kind: 'tool', name: 't', startMs: 0, durationMs: 1, status: 'ok' },
    ]
    expect(agentRunMetrics(loop, agents)).toEqual([])
  })
})

describe('load more and presence helpers', () => {
  it('reads a TanStack infinite query', () => {
    const q = { hasNextPage: true, isFetchingNextPage: false, isFetchNextPageError: false }
    expect(loadMoreStatus(q)).toBe('idle')
    expect(loadMoreStatus({ ...q, isFetchingNextPage: true })).toBe('loading')
    expect(loadMoreStatus({ ...q, isFetchNextPageError: true })).toBe('error')
    expect(loadMoreStatus({ ...q, hasNextPage: false })).toBe('done')
  })

  it('gives a pointer’s position as fractions, clamped', () => {
    const element = {
      getBoundingClientRect: () => ({ left: 100, top: 50, width: 200, height: 100 }),
    }
    expect(cursorPosition({ clientX: 150, clientY: 75 }, element)).toEqual({ x: 0.25, y: 0.25 })
    expect(cursorPosition({ clientX: 0, clientY: 999 }, element)).toEqual({ x: 0, y: 1 })
  })

  it('keeps a colour per person', () => {
    expect(presenceColor({ id: 'ada' })).toBe(presenceColor({ id: 'ada' }))
    expect(presenceColor({ id: 'ada', color: 'var(--primary)' })).toBe('var(--primary)')
    expect(presenceColor({ id: 'ada' })).toMatch(/^var\(--chart-[1-5]\)$/)
  })
})
