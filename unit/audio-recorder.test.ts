// The recorder's pure side: loudness on a speech-friendly scale, waveform resampling that keeps the
// peaks, the container the browser can record, errors, the timer, and dictated text joined to a field.
import { describe, expect, it } from 'vitest'

import { appendText } from '@/components/ui/audio-recorder'
import {
  formatClock,
  levelFromRms,
  pickMimeType,
  recorderErrorOf,
  resampleLevels,
  rmsOf,
} from '@/components/ui/use-audio-recorder'

describe('rmsOf and levelFromRms', () => {
  it('measures a block of samples', () => {
    expect(rmsOf([])).toBe(0)
    expect(rmsOf([0.5, -0.5, 0.5, -0.5])).toBe(0.5)
    expect(rmsOf(new Float32Array([1, -1]))).toBe(1)
  })

  it('maps −60 dB…0 dB to 0…1 and clamps the rest', () => {
    expect(levelFromRms(1)).toBe(1)
    expect(levelFromRms(0.001)).toBeCloseTo(0)
    expect(levelFromRms(0.0316)).toBeCloseTo(0.5, 1)
    expect(levelFromRms(0)).toBe(0)
    expect(levelFromRms(Number.NaN)).toBe(0)
    expect(levelFromRms(4)).toBe(1)
  })
})

describe('resampleLevels', () => {
  it('keeps short lists as they are and copies them', () => {
    const levels = [0.1, 0.2]
    const out = resampleLevels(levels, 5)
    expect(out).toEqual([0.1, 0.2])
    expect(out).not.toBe(levels)
  })

  it('keeps the loudest value of each bucket', () => {
    expect(resampleLevels([0, 1, 0, 0, 0.5, 0], 3)).toEqual([1, 0, 0.5])
    expect(resampleLevels([0.2, 0.9, 0.1], 1)).toEqual([0.9])
    expect(resampleLevels([0.2], 0)).toEqual([])
  })
})

describe('pickMimeType', () => {
  it('prefers WebM/Opus, then what the browser supports, else lets it choose', () => {
    expect(pickMimeType(() => true)).toBe('audio/webm;codecs=opus')
    expect(pickMimeType((type) => type === 'audio/mp4')).toBe('audio/mp4')
    expect(pickMimeType(() => false)).toBe('')
  })
})

describe('recorderErrorOf', () => {
  it('tells a refusal from a missing device and anything else', () => {
    expect(recorderErrorOf(new DOMException('no', 'NotAllowedError'))).toBe('denied')
    expect(recorderErrorOf(new DOMException('no', 'NotFoundError'))).toBe('unsupported')
    expect(recorderErrorOf(new Error('boom'))).toBe('failed')
    expect(recorderErrorOf('a string')).toBe('failed')
  })
})

describe('formatClock', () => {
  it('writes the timer', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(12.7)).toBe('0:12')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatClock(Number.NaN)).toBe('0:00')
  })
})

describe('appendText', () => {
  it('adds dictated text after what is written, with one space', () => {
    expect(appendText('', '  Hello  ')).toBe('Hello')
    expect(appendText('Draft', 'more')).toBe('Draft more')
    expect(appendText('Draft ', 'more')).toBe('Draft more')
    expect(appendText('Line\n', 'next')).toBe('Line\nnext')
    expect(appendText('Keep', '   ')).toBe('Keep')
  })
})
