---
'@coreloom/ui': patch
---

### Fixed

- `AudioRecorder`: the elapsed time stayed at 0:00, and `maxDuration` never stopped the recording,
  when the browser kept its audio context suspended (a machine without audio output, for one).
  The time now comes from the page's clock.
