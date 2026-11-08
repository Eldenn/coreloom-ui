// Coreloom UI — media cues. The pure side of MediaPlayer: time labels, which chapter or
// transcript line is current, and a WebVTT reader that turns a captions file into transcript
// lines, so one file serves both the captions and the transcript.

/** A chapter starts at `start` (seconds) and runs to the next one. */
interface MediaChapter {
  start: number
  title: string
}

/** One line of a transcript, from `start` to `end` (seconds). */
interface TranscriptCue {
  start: number
  end: number
  text: string
  /** Who speaks: shown before the line. WebVTT's `<v Name>` sets it. */
  speaker?: string
}

/** "m:ss", or "h:mm:ss" from an hour. Negative and unknown times read 0:00. */
function formatMediaTime(seconds: number) {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`
}

/** The chapter playing at `time`: the last one that started. -1 before the first. */
function chapterIndexAt(chapters: readonly MediaChapter[], time: number) {
  let index = -1
  for (let i = 0; i < chapters.length; i++) {
    if (chapters[i].start <= time) index = i
  }
  return index
}

/** The transcript line spoken at `time`, or -1 between lines. */
function cueIndexAt(cues: readonly TranscriptCue[], time: number) {
  return cues.findIndex((cue) => cue.start <= time && time < cue.end)
}

const TIMESTAMP = /^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{3})$/

/** "01:02:03.400" or "02:03.400" in seconds; NaN when it isn't a timestamp. */
function parseTimestamp(value: string) {
  const match = TIMESTAMP.exec(value.trim())
  if (!match) return Number.NaN
  const [, h = '0', m, s, ms] = match
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000
}

/** A cue's text without tags, its speaker taken from a leading `<v Name>`. */
function cueText(lines: string[]) {
  const raw = lines.join(' ').trim()
  const voice = /^<v(?:\.[\w.-]+)?\s+([^>]+)>/.exec(raw)
  const text = raw
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  return { text, speaker: voice?.[1].trim() }
}

/**
 * Reads a WebVTT file into transcript lines. Cues with a bad timing line, an end before their
 * start or no text are skipped; NOTE, STYLE and REGION blocks are ignored. Never throws.
 */
function parseVtt(source: string): TranscriptCue[] {
  const blocks = source
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
  const cues: TranscriptCue[] = []
  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim() !== '')
    const timing = lines.findIndex((line) => line.includes('-->'))
    if (timing === -1 || timing > 1) continue
    if (/^(WEBVTT|NOTE|STYLE|REGION)\b/.test(lines[0])) continue
    const [from, rest = ''] = lines[timing].split('-->')
    const start = parseTimestamp(from)
    const end = parseTimestamp(rest.trim().split(/\s+/)[0] ?? '')
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue
    const { text, speaker } = cueText(lines.slice(timing + 1))
    if (!text) continue
    cues.push(speaker ? { start, end, text, speaker } : { start, end, text })
  }
  return cues
}

export {
  chapterIndexAt,
  cueIndexAt,
  formatMediaTime,
  type MediaChapter,
  parseTimestamp,
  parseVtt,
  type TranscriptCue,
}
