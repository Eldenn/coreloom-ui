---
'@coreloom/ui': patch
---

### Fixed

- **Rich text editor** and **Settings section**: the link field and the "type to confirm" field take their id from `React.useId()` instead of a fixed string, so two instances on one page no longer share a label target.
