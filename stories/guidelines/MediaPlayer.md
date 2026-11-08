# Media Player

> **Experimental.** This item may still change in a minor release, with an **Upgrading** note in the changelog. See [VERSIONING.md](https://github.com/Eldenn/coreloom-ui/blob/main/VERSIONING.md).

Plays a video or an audio file with the same controls in every browser: play, back and forward, a seek bar with chapter marks, speed, captions, volume and full screen. Below it, the chapters and a transcript: the line being spoken is highlighted and a click plays from there. For lessons, talks, podcasts and recorded calls. It plays files; streaming protocols (HLS, DASH) need a player of their own.

**The consumer provides** `title` (the player's accessible name, and the title line of an audio player) and `src` (a URL, or `{ src, type }` sources for browsers that differ), and optionally `kind` (`video` by default, or `audio`), `poster` (the image before playing, or an audio player's artwork), `tracks` (WebVTT captions: `src`, `srcLang`, `label`, `kind` and `default` for the one on from the start), `chapters` (`{ start, title }`, in seconds), `transcript` (`{ start, end, text, speaker }` lines), `playbackRates` (0.5× to 2× by default), `skipSeconds` (10 by default), `mediaRef` (the `<video>` or `<audio>` element, for analytics or a start time) and `className`.

```tsx
const transcript = parseVtt(await (await fetch('/media/lesson.en.vtt')).text())
<MediaPlayer title="Getting started" src="/media/lesson.webm" poster="/media/lesson.jpg"
  tracks={[{ src: '/media/lesson.en.vtt', srcLang: 'en', label: 'English', default: true }]}
  chapters={[{ start: 0, title: 'Your workspace' }, { start: 12, title: 'Create a project' }]}
  transcript={transcript} />
```

- `parseVtt(text)` turns a captions file into transcript lines (a `<v Name>` voice becomes the `speaker`), so one file serves both. Bad cues are skipped; it never throws.
- The seek bar is a native range: arrow keys move it, and screen readers hear "1:23 of 4:56". Chapters show as marks on it and as a list.
- Keyboard, from any control in the player: <kbd>k</kbd> or <kbd>Space</kbd> (outside a button) plays and pauses, <kbd>j</kbd> / <kbd>l</kbd> skip back and forward, <kbd>←</kbd> / <kbd>→</kbd> move 5 seconds (outside the sliders), <kbd>m</kbd> mutes, <kbd>c</kbd> turns captions on and off, <kbd>f</kbd> goes full screen.
- Every button has a name that says its state ("Pause", "Unmute", "Captions: English", "Playback speed, 1.5×"). Clicking the picture plays and pauses too.
- The transcript scrolls itself to the current line while playing (instantly under reduced motion). Its lines are buttons: the transcript is the text alternative of audio, so give one to every podcast.
- Captions are the browser's own (`<track>`): they follow the person's caption settings. Audio files take no `tracks`.
- If the file can't be loaded, the reason shows under the controls.

**In an app:** `pnpm dlx shadcn@latest add @coreloom/media-player`.
