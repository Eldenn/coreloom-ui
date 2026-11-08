'use client'

// Coreloom UI — MediaPlayer. Plays a video or an audio file with the same controls everywhere:
// play, a seek bar with chapter marks, speed, captions, volume and full screen, then the chapters
// and a transcript whose lines jump to their moment. For lessons, talks, podcasts and recorded
// calls. It plays files the app gives it; streaming protocols (HLS, DASH) need their own player.
//
//   <MediaPlayer title="Onboarding" src="/media/onboarding.webm" poster="/media/poster.jpg"
//     tracks={[{ src: '/media/en.vtt', srcLang: 'en', label: 'English' }]}
//     chapters={chapters} transcript={parseVtt(vttText)} />
import {
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  chapterIndexAt,
  formatMediaTime,
  type MediaChapter,
  type TranscriptCue,
} from '@/components/ui/media-cues'
import {
  MediaPanels,
  type MediaTextTrack,
  SeekBar,
  SettingsMenus,
} from '@/components/ui/media-player-controls'
import { Slider } from '@/components/ui/slider'
import { useCoreloomI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** One file of the media, for browsers that differ in what they play. */
interface MediaSource {
  src: string
  /** "video/webm", "audio/mp4"… */
  type?: string
}

interface PlayerState {
  playing: boolean
  time: number
  duration: number
  muted: boolean
  volume: number
  rate: number
  failed: boolean
}

const initialState: PlayerState = {
  playing: false,
  time: 0,
  duration: 0,
  muted: false,
  volume: 1,
  rate: 1,
  failed: false,
}

/** The element's state, read after any of its events. */
function readMedia(media: HTMLMediaElement): PlayerState {
  return {
    playing: !media.paused && !media.ended,
    time: media.currentTime,
    duration: Number.isFinite(media.duration) ? media.duration : 0,
    muted: media.muted || media.volume === 0,
    volume: media.volume,
    rate: media.playbackRate,
    failed: media.error !== null,
  }
}

type Shortcut =
  'toggle' | 'back' | 'forward' | 'backLong' | 'forwardLong' | 'mute' | 'full' | 'captions'

const letterShortcuts: Partial<Record<string, Shortcut>> = {
  k: 'toggle',
  j: 'backLong',
  l: 'forwardLong',
  m: 'mute',
  f: 'full',
  c: 'captions',
}

/**
 * The shortcut a key means here. Keys that a focused control uses itself (Space on a button,
 * arrows on the seek bar, the volume, a menu or the tabs) keep their own meaning.
 */
function shortcutOf(event: React.KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return null
  const target = event.target as HTMLElement
  const ownsKeys = target.matches(
    'button, input, textarea, [role=slider], [role=menuitemradio], [role=tab]',
  )
  if (event.key === ' ') return ownsKeys ? null : 'toggle'
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    if (ownsKeys && !target.matches('button:not([role])')) return null
    return event.key === 'ArrowLeft' ? 'back' : 'forward'
  }
  if (target.matches('input, textarea')) return null
  return letterShortcuts[event.key] ?? null
}

/** The media element's state and the actions on it. */
function useMedia({
  kind,
  tracks,
  skipSeconds,
  mediaRef,
}: {
  kind: 'video' | 'audio'
  tracks: readonly MediaTextTrack[]
  skipSeconds: number
  mediaRef?: React.Ref<HTMLMediaElement | null>
}) {
  const root = React.useRef<HTMLElement>(null)
  const media = React.useRef<HTMLMediaElement | null>(null)
  const [state, setState] = React.useState(initialState)
  const [caption, setCaption] = React.useState(() => tracks.findIndex((track) => track.default))
  const lastCaption = React.useRef(Math.max(0, caption))
  const [fullscreen, setFullscreen] = React.useState(false)
  React.useImperativeHandle<HTMLMediaElement | null, HTMLMediaElement | null>(
    mediaRef,
    () => media.current,
    [],
  )

  // Text tracks are switched on the element: a <track>'s index is its index in textTracks.
  React.useEffect(() => {
    const list = media.current?.textTracks
    if (!list) return
    Array.from(list).forEach((track, i) => {
      track.mode = i === caption ? 'showing' : 'disabled'
    })
  }, [caption, tracks])

  React.useEffect(() => {
    const onChange = () => {
      const element = document.fullscreenElement
      setFullscreen(element !== null && element === root.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
    }
  }, [])

  function seekTo(time: number) {
    const m = media.current
    if (!m) return
    m.currentTime = Math.max(0, Math.min(time, Number.isFinite(m.duration) ? m.duration : time))
    setState(readMedia(m))
  }
  function skip(seconds: number) {
    if (media.current) seekTo(media.current.currentTime + seconds)
  }
  function toggle() {
    const m = media.current
    if (!m) return
    if (m.paused || m.ended) void m.play().catch(() => undefined)
    else m.pause()
  }
  function toggleFullscreen() {
    if (kind !== 'video') return
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    else void root.current?.requestFullscreen().catch(() => undefined)
  }
  function chooseCaption(index: number) {
    if (index >= 0) lastCaption.current = index
    setCaption(index)
  }
  const actions: Record<Shortcut, () => void> = {
    toggle,
    back: () => {
      skip(-5)
    },
    forward: () => {
      skip(5)
    },
    backLong: () => {
      skip(-skipSeconds)
    },
    forwardLong: () => {
      skip(skipSeconds)
    },
    mute: () => {
      if (media.current) media.current.muted = !media.current.muted
    },
    full: toggleFullscreen,
    captions: () => {
      if (tracks.length > 0) chooseCaption(caption >= 0 ? -1 : lastCaption.current)
    },
  }
  return {
    state,
    caption,
    fullscreen,
    actions,
    chooseCaption,
    seekTo,
    seekAndPlay: (time: number) => {
      seekTo(time)
      if (media.current?.paused) void media.current.play().catch(() => undefined)
    },
    setRate: (rate: number) => {
      if (media.current) media.current.playbackRate = rate
    },
    setVolume: (volume: number) => {
      if (!media.current) return
      media.current.volume = volume
      media.current.muted = volume === 0
    },
    sync: (e: React.SyntheticEvent<HTMLMediaElement>) => {
      setState(readMedia(e.currentTarget))
    },
    /** No source could be played: the element itself reports no error in that case. */
    fail: () => {
      setState((current) => ({ ...current, failed: true }))
    },
    /** The callback ref for the <video> or <audio> element. */
    attach: (element: HTMLMediaElement | null) => {
      media.current = element
    },
    /** The callback ref for the player itself (the element that goes full screen). */
    attachRoot: (element: HTMLElement | null) => {
      root.current = element
    },
  }
}

type Player = ReturnType<typeof useMedia>

/** The row of buttons under the seek bar. */
function ControlBar({
  state,
  actions,
  caption,
  fullscreen,
  onCaption,
  onRate,
  onVolume,
  kind,
  chapter,
  tracks,
  playbackRates,
  skipSeconds,
}: Pick<Player, 'state' | 'actions' | 'caption' | 'fullscreen'> & {
  onCaption: (index: number) => void
  onRate: (rate: number) => void
  onVolume: (volume: number) => void
  kind: 'video' | 'audio'
  chapter?: MediaChapter
  tracks: readonly MediaTextTrack[]
  playbackRates: readonly number[]
  skipSeconds: number
}) {
  const t = useCoreloomI18n().messages.mediaPlayer
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="icon-sm"
        aria-label={state.playing ? t.pause : t.play}
        onClick={actions.toggle}
      >
        {state.playing ? (
          <PauseIcon className="fill-current" />
        ) : (
          <PlayIcon className="fill-current" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t.back(skipSeconds)}
        onClick={actions.backLong}
      >
        <RotateCcwIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t.forward(skipSeconds)}
        onClick={actions.forwardLong}
      >
        <RotateCwIcon />
      </Button>
      <span className="ml-1 min-w-0 truncate font-mono text-[12px] text-muted-foreground tabular-nums">
        {formatMediaTime(state.time)} / {formatMediaTime(state.duration)}
        {kind === 'video' && chapter && (
          <span className="hidden font-sans text-[12.5px] sm:inline"> · {chapter.title}</span>
        )}
      </span>
      <span className="ml-auto" />
      <SettingsMenus
        rate={state.rate}
        rates={playbackRates}
        onRate={onRate}
        tracks={kind === 'video' ? tracks : []}
        caption={caption}
        onCaption={onCaption}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={state.muted ? t.unmute : t.mute}
        onClick={actions.mute}
      >
        {state.muted ? <VolumeXIcon /> : <Volume2Icon />}
      </Button>
      <Slider
        aria-label={t.volume}
        className="hidden w-20 sm:flex"
        min={0}
        max={1}
        step={0.05}
        value={[state.muted ? 0 : state.volume]}
        onValueChange={([volume]) => {
          onVolume(volume)
        }}
      />
      {kind === 'video' && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
          onClick={actions.full}
        >
          {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </Button>
      )}
    </div>
  )
}

/** The <video> or <audio> element, with its sources and text tracks. */
function MediaElement({
  kind,
  attach,
  sync,
  onFail,
  onToggle,
  sources,
  tracks,
  poster,
}: {
  kind: 'video' | 'audio'
  attach: (element: HTMLMediaElement | null) => void
  sync: (e: React.SyntheticEvent<HTMLMediaElement>) => void
  onFail: () => void
  onToggle: () => void
  sources: readonly MediaSource[]
  tracks: readonly MediaTextTrack[]
  poster?: string
}) {
  const listenForFailure = (source: HTMLSourceElement | null) => {
    source?.addEventListener('error', onFail)
    return () => source?.removeEventListener('error', onFail)
  }
  const children = (
    <>
      {sources.map((s, i) => (
        <source
          key={s.src}
          src={s.src}
          type={s.type}
          // When every <source> fails, only the last one says so (media.error stays null), and
          // React doesn't listen to a <source>'s errors: listen here.
          ref={i === sources.length - 1 ? listenForFailure : undefined}
        />
      ))}
      {tracks.map((track) => (
        <track
          key={track.src}
          src={track.src}
          srcLang={track.srcLang}
          label={track.label}
          kind={track.kind ?? 'subtitles'}
        />
      ))}
    </>
  )
  const events = {
    onLoadedMetadata: sync,
    onDurationChange: sync,
    onTimeUpdate: sync,
    onPlay: sync,
    onPause: sync,
    onEnded: sync,
    onVolumeChange: sync,
    onRateChange: sync,
    onError: sync,
  }
  if (kind === 'audio')
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- the transcript is the text alternative of audio.
      <audio ref={attach} preload="metadata" {...events}>
        {children}
      </audio>
    )
  return (
    // Clicking the picture plays or pauses; the Play button is the keyboard's way.
    // eslint-disable-next-line jsx-a11y/media-has-caption -- captions come from `tracks`, and a video may have no speech.
    <video
      ref={attach}
      poster={poster}
      preload="metadata"
      playsInline
      onClick={onToggle}
      className="size-full cursor-pointer object-contain"
      {...events}
    >
      {children}
    </video>
  )
}

/** An audio player's top line: the artwork, the title and the current chapter. */
function AudioHeader({
  title,
  artwork,
  chapter,
  children,
}: {
  title: string
  artwork?: string
  chapter?: MediaChapter
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      {artwork && <img src={artwork} alt="" className="size-14 shrink-0 rounded-md object-cover" />}
      <div className="min-w-0">
        <p className="m-0 truncate text-[14.5px] font-medium text-foreground">{title}</p>
        {chapter && (
          <p className="m-0 truncate text-[13px] text-muted-foreground">{chapter.title}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function MediaPlayer({
  kind = 'video',
  src,
  title,
  poster,
  tracks = [],
  chapters = [],
  transcript = [],
  playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2],
  skipSeconds = 10,
  mediaRef,
  className,
}: {
  /** "video" (the default) or "audio" (no picture: the title and the artwork instead). */
  kind?: 'video' | 'audio'
  /** A URL, or several files for browsers that differ in what they play. */
  src: string | readonly MediaSource[]
  /** What it is: the player's accessible name, and the heading line of an audio player. */
  title: string
  /** The image before playing (video), or the artwork beside the title (audio). */
  poster?: string
  /** Captions and subtitles (WebVTT), for video. The one with `default` is on from the start. */
  tracks?: readonly MediaTextTrack[]
  /** Marks on the seek bar and a list to jump to; sorted by `start`. */
  chapters?: readonly MediaChapter[]
  /** Lines to read along: the current one is highlighted, a click plays from there. */
  transcript?: readonly TranscriptCue[]
  /** Choices in the speed menu. Default 0.5× to 2×. */
  playbackRates?: readonly number[]
  /** Seconds the back and forward buttons skip. Default 10. */
  skipSeconds?: number
  /** The `<video>` or `<audio>` element, for the app's own analytics or a start time. */
  mediaRef?: React.Ref<HTMLMediaElement | null>
  className?: string
}) {
  const t = useCoreloomI18n().messages.mediaPlayer
  const {
    state,
    fullscreen,
    caption,
    actions,
    attach,
    attachRoot,
    chooseCaption,
    seekTo,
    seekAndPlay,
    setRate,
    setVolume,
    sync,
    fail,
  } = useMedia({ kind, tracks, skipSeconds, mediaRef })
  const chapter = chapters[chapterIndexAt(chapters, state.time)] as MediaChapter | undefined
  const sources = typeof src === 'string' ? [{ src }] : src
  const element = (
    <MediaElement
      kind={kind}
      attach={attach}
      sync={sync}
      onFail={fail}
      onToggle={actions.toggle}
      sources={sources}
      tracks={kind === 'video' ? tracks : []}
      poster={poster}
    />
  )

  return (
    // Shortcuts (k, j, l, m, f, c, arrows) work from any control inside the player.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the keys come from the focused controls inside; the region itself never takes focus.
    <section
      ref={attachRoot}
      aria-label={title}
      data-slot="media-player"
      data-kind={kind}
      onKeyDown={(e) => {
        // Menus are portalled out of the player but still bubble here through React.
        if (!e.currentTarget.contains(e.target as Node)) return
        const shortcut = shortcutOf(e)
        if (!shortcut) return
        e.preventDefault()
        actions[shortcut]()
      }}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        fullscreen && 'justify-center rounded-none border-0',
        className,
      )}
    >
      {kind === 'video' ? (
        <div className={cn('relative aspect-video bg-inset', fullscreen && 'min-h-0 flex-1')}>
          {element}
        </div>
      ) : (
        <AudioHeader title={title} artwork={poster} chapter={chapter}>
          {element}
        </AudioHeader>
      )}
      <div className="flex flex-col gap-1 px-3 pt-2 pb-2.5">
        <SeekBar time={state.time} duration={state.duration} chapters={chapters} onSeek={seekTo} />
        <ControlBar
          state={state}
          actions={actions}
          caption={caption}
          fullscreen={fullscreen}
          onCaption={chooseCaption}
          onRate={setRate}
          onVolume={setVolume}
          kind={kind}
          chapter={chapter}
          tracks={tracks}
          playbackRates={playbackRates}
          skipSeconds={skipSeconds}
        />
        {state.failed && (
          <p role="alert" className="m-0 px-1 text-[13px] text-destructive">
            {t.failed}
          </p>
        )}
      </div>
      {!fullscreen && (
        <MediaPanels
          chapters={chapters}
          transcript={transcript}
          time={state.time}
          playing={state.playing}
          onSeek={seekAndPlay}
        />
      )}
    </section>
  )
}

export { type MediaChapter, MediaPlayer, type MediaSource, type MediaTextTrack, type TranscriptCue }
export { chapterIndexAt, cueIndexAt, formatMediaTime, parseVtt } from '@/components/ui/media-cues'
