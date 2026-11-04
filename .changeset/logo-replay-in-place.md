---
'@coreloom/ui': patch
---

### Fixed

- `Logo`: with `trigger="hover"` and `href`, the first click now goes home. Replaying the entrance used to remount the logo, so the element under the pointer changed between mousedown and mouseup and the click was lost; the replay now restarts the animation in place.
