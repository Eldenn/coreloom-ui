# @coreloom/media-player

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/ui/media-player.tsx

```ts
type MediaChapter = {}
MediaChapter.start: number
MediaChapter.title: string
function MediaPlayer
MediaPlayer.kind?: 'audio' | 'video' | undefined
MediaPlayer.src: string | readonly MediaSource[]
MediaPlayer.title: string
MediaPlayer.poster?: string | undefined
MediaPlayer.tracks?: readonly MediaTextTrack[] | undefined
MediaPlayer.chapters?: readonly MediaChapter[] | undefined
MediaPlayer.transcript?: readonly TranscriptCue[] | undefined
MediaPlayer.playbackRates?: readonly number[] | undefined
MediaPlayer.skipSeconds?: number | undefined
MediaPlayer.mediaRef?: React.Ref<HTMLMediaElement | null> | undefined
MediaPlayer.className?: string | undefined
type MediaSource = {}
MediaSource.src: string
MediaSource.type?: string | undefined
type MediaTextTrack = {}
MediaTextTrack.src: string
MediaTextTrack.srcLang: string
MediaTextTrack.label: string
MediaTextTrack.kind?: 'subtitles' | 'captions' | undefined
MediaTextTrack.default?: boolean | undefined
type TranscriptCue = {}
TranscriptCue.start: number
TranscriptCue.end: number
TranscriptCue.text: string
TranscriptCue.speaker?: string | undefined
function chapterIndexAt(chapters: readonly MediaChapter[], time: number) => number
function cueIndexAt(cues: readonly TranscriptCue[], time: number) => number
function formatMediaTime(seconds: number) => string
function parseVtt(source: string) => TranscriptCue[]
```

## src/components/ui/media-player-controls.tsx

```ts
function MediaPanels
MediaPanels.chapters: readonly MediaChapter[]
MediaPanels.transcript: readonly TranscriptCue[]
MediaPanels.time: number
MediaPanels.playing: boolean
MediaPanels.onSeek: (time: number) => void
type MediaTextTrack = {}
MediaTextTrack.src: string
MediaTextTrack.srcLang: string
MediaTextTrack.label: string
MediaTextTrack.kind?: 'subtitles' | 'captions' | undefined
MediaTextTrack.default?: boolean | undefined
function SeekBar
SeekBar.time: number
SeekBar.duration: number
SeekBar.chapters: readonly MediaChapter[]
SeekBar.onSeek: (time: number) => void
function SettingsMenus
SettingsMenus.rate: number
SettingsMenus.rates: readonly number[]
SettingsMenus.onRate: (rate: number) => void
SettingsMenus.tracks: readonly MediaTextTrack[]
SettingsMenus.caption: number
SettingsMenus.onCaption: (index: number) => void
```

## src/components/ui/media-cues.ts

```ts
function chapterIndexAt(chapters: readonly MediaChapter[], time: number) => number
function cueIndexAt(cues: readonly TranscriptCue[], time: number) => number
function formatMediaTime(seconds: number) => string
type MediaChapter = {}
MediaChapter.start: number
MediaChapter.title: string
function parseTimestamp(value: string) => number
function parseVtt(source: string) => TranscriptCue[]
type TranscriptCue = {}
TranscriptCue.start: number
TranscriptCue.end: number
TranscriptCue.text: string
TranscriptCue.speaker?: string | undefined
```
