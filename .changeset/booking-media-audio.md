---
'@coreloom/ui': minor
---

### Added

- **Booking** block (`@coreloom/booking`, experimental): online appointment booking.
  - Three steps: a service (skipped when there is only one), a day in the calendar and a free time, then a recap with the visitor's name, email, optional phone and note, and Confirm.
  - Free times come from `onLoadSlots({ serviceId, date })`, grouped as morning, afternoon and evening, shown in the place's `timeZone`; taken times are struck through. A failure offers Retry.
  - `onBook(request)` makes the appointment; its `reference` shows on the confirmation, with an **Add to calendar** (.ics) link. A failure keeps everything filled in.
  - `isDateUnavailable`, `fromDate` and `toDate` limit the calendar; `aside` takes a PractitionerCard or OpeningHours.
  - Each step's title takes focus when it opens, and one polite live region says how many times are free.
- **MediaPlayer** (`@coreloom/media-player`, experimental): a video or audio player with its own controls.
  - Play, back and forward, a seek bar with chapter marks, speed, WebVTT captions, volume and full screen, with keyboard shortcuts (k, j, l, m, c, f, arrows).
  - Chapters and a transcript below: the current line is highlighted, follows playback and plays from where it's clicked.
  - `parseVtt(text)` turns a captions file into transcript lines, speakers included.
- **AudioRecorder** (`@coreloom/audio-recorder`, experimental): records a voice note from the microphone.
  - A live waveform and a timer, pause, stop and discard, then playback and delete; `maxDuration` stops it by itself.
  - The recording (`blob`, `mimeType`, `duration`, `levels`) goes to the app through `onValueChange`.
  - `DictationButton` goes in PromptInput's toolbar: it records, calls your `onTranscribe` and hands back the text (`appendText` adds it to the field).
  - `useAudioRecorder` and `AudioWaveform` for a recorder or a voice message of your own.
