---
'@coreloom/ui': minor
---

### Added

- `RichTextEditor`: `suggestion` takes a proposed version of the whole document (light Markdown,
  like an `onRequest` answer) and shows it as changes to accept or reject, without the AI panel: a
  review agent or a server-side pass can propose edits. Nothing is focused or scrolled when it
  arrives. `onReviewEnd({ accepted, rejected })` is called when a review (from `suggestion` or the
  panel) has nothing left. New type `RichTextReviewResult`.
