---
'@coreloom/ui': minor
---

### Added

- **SaveStatus** (`@coreloom/save-status`, also in `all`): where an autosaving document stands.
  - It shows "Saved · 2 minutes ago" (with RelativeTime), "Saving…", "Unsaved changes", or "Couldn't save" with a Retry button (`onRetry`).
  - Screen readers hear one polite status message when the state settles; passing through Saving… isn't announced.
  - After Retry, focus stays on the status line.
- **Diagram card** block (`@coreloom/diagram-card`): a gallery card for a diagram document.
  - The thumbnail is a `diagram` drawn with UmlDiagram's `preview`, or an `image` URL. When there's neither, a neutral drawing stands in.
  - The title is a link (`AppLink`) that covers the whole card.
  - It shows a visibility badge (`private`, `public`, `protected`, with an icon and a word), the number of diagrams and when the document changed.
  - `actions` fill a "…" menu that stays its own button.
