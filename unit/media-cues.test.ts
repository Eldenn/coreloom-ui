// MediaPlayer's pure side: time labels, the current chapter and line, and the WebVTT reader that
// turns a captions file into transcript lines.
import { describe, expect, it } from 'vitest'

import {
  chapterIndexAt,
  cueIndexAt,
  formatMediaTime,
  parseTimestamp,
  parseVtt,
} from '@/components/ui/media-cues'

describe('formatMediaTime', () => {
  it('writes minutes and seconds, then hours from an hour', () => {
    expect(formatMediaTime(0)).toBe('0:00')
    expect(formatMediaTime(65.9)).toBe('1:05')
    expect(formatMediaTime(3600 + 62)).toBe('1:01:02')
  })

  it('reads unknown and negative times as 0:00', () => {
    expect(formatMediaTime(Number.NaN)).toBe('0:00')
    expect(formatMediaTime(Infinity)).toBe('0:00')
    expect(formatMediaTime(-4)).toBe('0:00')
  })
})

describe('chapterIndexAt and cueIndexAt', () => {
  const chapters = [
    { start: 0, title: 'One' },
    { start: 12, title: 'Two' },
    { start: 26, title: 'Three' },
  ]
  it('finds the chapter that started last', () => {
    expect(chapterIndexAt(chapters, 0)).toBe(0)
    expect(chapterIndexAt(chapters, 11.9)).toBe(0)
    expect(chapterIndexAt(chapters, 12)).toBe(1)
    expect(chapterIndexAt(chapters, 400)).toBe(2)
    expect(chapterIndexAt([{ start: 5, title: 'Late' }], 1)).toBe(-1)
    expect(chapterIndexAt([], 1)).toBe(-1)
  })

  it('finds the line being spoken, and none between lines', () => {
    const cues = [
      { start: 1, end: 3, text: 'a' },
      { start: 4, end: 6, text: 'b' },
    ]
    expect(cueIndexAt(cues, 0.5)).toBe(-1)
    expect(cueIndexAt(cues, 1)).toBe(0)
    expect(cueIndexAt(cues, 3)).toBe(-1)
    expect(cueIndexAt(cues, 5.9)).toBe(1)
  })
})

describe('parseTimestamp', () => {
  it('reads hours, minutes, seconds and milliseconds', () => {
    expect(parseTimestamp('00:01.500')).toBe(1.5)
    expect(parseTimestamp('01:02:03.004')).toBeCloseTo(3723.004)
    expect(parseTimestamp(' 02:03,250 ')).toBe(123.25)
  })

  it('refuses what is not a timestamp', () => {
    expect(parseTimestamp('1.5')).toBeNaN()
    expect(parseTimestamp('aa:bb.ccc')).toBeNaN()
  })
})

describe('parseVtt', () => {
  it('reads cues with ids, voices, tags, settings and entities', () => {
    const vtt = [
      '﻿WEBVTT - lesson',
      '',
      'NOTE written by hand',
      '',
      'intro',
      '00:00.500 --> 00:04.000 align:start position:10%',
      '<v.loud Lena>Welcome <b>to</b> Coreloom &amp; friends.',
      '',
      '00:04.000 --> 00:08.000',
      'Two lines',
      'of text.',
    ].join('\r\n')
    expect(parseVtt(vtt)).toEqual([
      { start: 0.5, end: 4, text: 'Welcome to Coreloom & friends.', speaker: 'Lena' },
      { start: 4, end: 8, text: 'Two lines of text.' },
    ])
  })

  it('skips broken cues and never throws on hostile input', () => {
    const vtt = [
      'WEBVTT',
      '',
      '00:05.000 --> 00:01.000',
      'Ends before it starts',
      '',
      'nonsense --> more nonsense',
      'Bad timing',
      '',
      '00:01.000 --> 00:02.000',
      '<script>alert(1)</script>',
      '',
      '00:02.000 --> 00:03.000',
      '   ',
      '',
      '00:03.000 --> 00:04.000',
      'Kept',
    ].join('\n')
    expect(parseVtt(vtt)).toEqual([
      { start: 1, end: 2, text: 'alert(1)' },
      { start: 3, end: 4, text: 'Kept' },
    ])
    expect(parseVtt('')).toEqual([])
    expect(parseVtt('-->')).toEqual([])
  })
})
