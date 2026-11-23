---
'@coreloom/ui': minor
---

### Added

- **ChatWidget**: `children` puts the app's own conversation UI in the card instead of the Chat (the Chat's props are then optional and ignored); opening still puts the cursor in its `PromptInput`.
- **ChatWidget**: `headerActions` adds controls to the header, before Minimise (a conversation switcher, "New conversation").
- **ChatWidget**: `resizable` adds an Expand / Shrink button to the header that enlarges the card to 720 × 820px (clamped to the window), with `size` / `defaultSize` / `onSizeChange`. The panel carries `data-size`. Off by default; not shown in the full-screen sheet. New strings `ai.widget.expand` and `ai.widget.shrink` in every locale.
