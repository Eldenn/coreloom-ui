# Media Player

Plays a video or an audio file with the same controls everywhere: play, back and forward, a seek bar with chapter marks, speed, captions, volume and full screen. Chapters and a transcript sit below; the current line is highlighted and a click plays from there.

**`MediaPlayer` takes** `title`, `src`, and optionally `kind` (`video` or `audio`), `poster`, `tracks` (WebVTT), `chapters`, `transcript`, `playbackRates`, `skipSeconds`, `mediaRef` and `className`. `parseVtt(text)` turns a captions file into transcript lines.

- Keyboard: k or Space plays, j / l skip, m mutes, c toggles captions, f goes full screen.
- The seek bar is a native range that reads "1:23 of 4:56".

**In an app:** `pnpm dlx shadcn@latest add @coreloom/media-player`.

_All parts are on `window.CoreloomUIDesignSystem_ff5f32`._
