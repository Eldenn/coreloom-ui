'use client'

// Coreloom UI — MediaPlayer controls. The seek bar with chapter marks, the speed and captions
// menus, and the chapters and transcript lists, used by MediaPlayer.
import { CaptionsIcon, CaptionsOffIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  chapterIndexAt,
  cueIndexAt,
  formatMediaTime,
  type MediaChapter,
  type TranscriptCue,
} from '@/components/ui/media-cues'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCoreloomI18n } from '@/lib/i18n'

/** A captions or subtitles file (WebVTT). */
interface MediaTextTrack {
  src: string
  /** The language, as BCP 47: "en", "fr-CA". */
  srcLang: string
  /** The name in the captions menu: "English", "Français". */
  label: string
  /** "subtitles" (the default) translates the speech; "captions" also describes sounds. */
  kind?: 'subtitles' | 'captions'
  /** Shown from the start. */
  default?: boolean
}

/** The seek bar: a native range (keyboard and screen readers for free) with chapter marks. */
function SeekBar({
  time,
  duration,
  chapters,
  onSeek,
}: {
  time: number
  duration: number
  chapters: readonly MediaChapter[]
  onSeek: (time: number) => void
}) {
  const t = useCoreloomI18n().messages.mediaPlayer
  const progress = duration > 0 ? (time / duration) * 100 : 0
  return (
    <div className="relative flex h-6 items-center">
      <input
        type="range"
        aria-label={t.seek}
        aria-valuetext={t.position(formatMediaTime(time), formatMediaTime(duration))}
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(time, duration)}
        disabled={duration === 0}
        onChange={(e) => {
          onSeek(Number(e.target.value))
        }}
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
        className="peer relative z-10 h-6 w-full cursor-pointer appearance-none rounded-pill bg-transparent outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-pill [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--color-primary)_var(--progress),var(--color-accent)_var(--progress))] [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-pill [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-primary)_var(--progress),var(--color-accent)_var(--progress))] [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-primary"
      />
      {duration > 0 &&
        chapters
          .filter((c) => c.start > 0 && c.start < duration)
          .map((c) => (
            <span
              key={c.start}
              aria-hidden
              style={{ left: `${(c.start / duration) * 100}%` }}
              className="pointer-events-none absolute top-1/2 z-20 h-1 w-[3px] -translate-x-1/2 -translate-y-1/2 bg-card"
            />
          ))}
    </div>
  )
}

/** Speed and captions menus. */
function SettingsMenus({
  rate,
  rates,
  onRate,
  tracks,
  caption,
  onCaption,
}: {
  rate: number
  rates: readonly number[]
  onRate: (rate: number) => void
  tracks: readonly MediaTextTrack[]
  caption: number
  onCaption: (index: number) => void
}) {
  const i18n = useCoreloomI18n()
  const t = i18n.messages.mediaPlayer
  const formatRate = (r: number) => `${new Intl.NumberFormat(i18n.locale).format(r)}×`
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-w-11 px-2 font-mono tabular-nums"
            aria-label={t.speedLabel(formatRate(rate))}
          >
            {formatRate(rate)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.speed}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(rate)}
            onValueChange={(v) => {
              onRate(Number(v))
            }}
          >
            {rates.map((r) => (
              <DropdownMenuRadioItem key={r} value={String(r)}>
                {r === 1 ? t.normalSpeed(formatRate(r)) : formatRate(r)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {tracks.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={caption >= 0 ? t.captionsOn(tracks[caption].label) : t.captionsOff}
            >
              {caption >= 0 ? <CaptionsIcon /> : <CaptionsOffIcon />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.captions}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(caption)}
              onValueChange={(v) => {
                onCaption(Number(v))
              }}
            >
              <DropdownMenuRadioItem value="-1">{t.off}</DropdownMenuRadioItem>
              {tracks.map((track, i) => (
                <DropdownMenuRadioItem key={track.src} value={String(i)}>
                  {track.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}

/** A list of moments (chapters or transcript lines): each one seeks there. */
function MomentList({
  items,
  current,
  label,
  onSeek,
  follow,
}: {
  items: readonly { start: number; text: string; speaker?: string }[]
  current: number
  label: string
  onSeek: (time: number) => void
  /** Keep the current line in view (the transcript, while playing). */
  follow?: boolean
}) {
  const list = React.useRef<HTMLOListElement>(null)
  React.useEffect(() => {
    const box = list.current
    const row = box?.children[current] as HTMLElement | undefined
    if (!follow || !box || !row) return
    const top = row.offsetTop - box.offsetTop
    if (top >= box.scrollTop && top + row.offsetHeight <= box.scrollTop + box.clientHeight) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    box.scrollTo({ top: Math.max(0, top - 8), behavior: reduce ? 'auto' : 'smooth' })
  }, [current, follow])
  return (
    <ol ref={list} aria-label={label} className="m-0 max-h-72 list-none overflow-y-auto p-1">
      {items.map((item, i) => (
        <li key={`${item.start}-${item.text}`}>
          <button
            type="button"
            aria-current={i === current || undefined}
            onClick={() => {
              onSeek(item.start)
            }}
            className="group flex w-full cursor-pointer items-baseline gap-3 rounded-md px-2.5 py-1.5 text-left text-[13.5px] leading-snug text-fg-secondary outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring aria-[current]:bg-primary-subtle aria-[current]:text-foreground"
          >
            <span className="w-11 shrink-0 font-mono text-[12px] text-muted-foreground tabular-nums group-aria-[current]:text-fg-secondary">
              {formatMediaTime(item.start)}
            </span>
            <span className="min-w-0">
              {item.speaker && (
                <span className="font-medium text-foreground">{item.speaker} · </span>
              )}
              {item.text}
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Chapters and transcript below the player: tabs when there are both. */
function MediaPanels({
  chapters,
  transcript,
  time,
  playing,
  onSeek,
}: {
  chapters: readonly MediaChapter[]
  transcript: readonly TranscriptCue[]
  time: number
  playing: boolean
  onSeek: (time: number) => void
}) {
  const t = useCoreloomI18n().messages.mediaPlayer
  const chapterList = chapters.length > 0 && (
    <MomentList
      label={t.chapters}
      items={chapters.map((c) => ({ start: c.start, text: c.title }))}
      current={chapterIndexAt(chapters, time)}
      onSeek={onSeek}
    />
  )
  const transcriptList = transcript.length > 0 && (
    <MomentList
      label={t.transcript}
      items={transcript}
      current={cueIndexAt(transcript, time)}
      onSeek={onSeek}
      follow={playing}
    />
  )
  if (chapterList && transcriptList)
    return (
      <Tabs defaultValue="transcript" className="border-t border-border px-2 pt-2">
        <TabsList>
          <TabsTrigger value="transcript">{t.transcript}</TabsTrigger>
          <TabsTrigger value="chapters">{t.chapters}</TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">{transcriptList}</TabsContent>
        <TabsContent value="chapters">{chapterList}</TabsContent>
      </Tabs>
    )
  const only = chapterList || transcriptList
  if (!only) return null
  return (
    <div className="border-t border-border px-2 pt-2">
      <p className="m-0 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {chapterList ? t.chapters : t.transcript}
      </p>
      {only}
    </div>
  )
}

export { MediaPanels, type MediaTextTrack, SeekBar, SettingsMenus }
